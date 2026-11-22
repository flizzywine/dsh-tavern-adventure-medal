import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { apply, name } from '../dsh-tavern-adventure-medal/index.mjs'

const testSession = 'test-00000000-0000-0000-0000-000000000000'
const chat = (sessionId, turnCount, extra = {}) => ({
  id: 'chat-' + sessionId, sessionId, mode: 'story', preview: { turnCount }, ...extra,
})

test('旧档只补成就，实时首次达成只发一次，重启后仍保留', async t => {
  const home = await mkdtemp(join(tmpdir(), 'achievement-home-'))
  const previousHome = process.env.DSH_HOME
  process.env.DSH_HOME = home
  t.after(async () => {
    if (previousHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousHome
    await rm(home, { recursive: true, force: true })
  })
  const data = join(home, 'profile-data', 'tavern', 'data')
  const runtime = join(home, 'apps', 'dsh-tavern')
  const domain = join(runtime, 'tavern-plugin', 'lib', 'domain')
  const encoder = join(runtime, 'node_modules', 'sharp')
  await mkdir(domain, { recursive: true })
  await mkdir(encoder, { recursive: true })
  await writeFile(join(runtime, 'package.json'), '{"type":"module"}')
  await writeFile(join(domain, 'chat-journal-store.js'), `
    import { readFile } from 'node:fs/promises'
    import { join } from 'node:path'
    export const createChatJournalStore = ({ dataRoot }) => ({
      read: async id => JSON.parse(await readFile(join(dataRoot, id + '.json'), 'utf8'))
    })
  `)
  await writeFile(join(runtime, 'tavern-plugin', 'lib', 'profile-data-store.js'), 'export const createProfileDataStore = () => ({})')
  await writeFile(join(domain, 'file-resources.js'), `
    import { readFile } from 'node:fs/promises'
    import { join } from 'node:path'
    export const createFileResourceStore = ({ dataRoot }) => ({
      cardImagePreview: cardPath => ({ read: () => readFile(join(dataRoot, cardPath)) })
    })
  `)
  await writeFile(join(encoder, 'index.js'), `
    module.exports = bytes => ({
      resize: () => ({ webp: () => ({ toBuffer: async () => bytes }) })
    })
  `)
  await mkdir(join(data, 'automation'), { recursive: true })
  await writeFile(join(data, 'automation', testSession + '.json'), JSON.stringify({ sessionId: testSession }))
  const cardA = { cardName: '测试卡甲', cardPath: 'a.webp', createdAt: Date.UTC(2026, 9, 25) }
  const cardB = { cardName: '测试卡乙', cardPath: 'b.webp' }
  const coverA = 'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEALmk0mk0iIiIiIgBoSygABc6zbAAA'
  const coverB = 'UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA='
  const coverUrl = cover => 'data:image/webp;base64,' + cover
  await writeFile(join(data, cardA.cardPath), Buffer.from(coverA, 'base64'))
  await writeFile(join(data, cardB.cardPath), Buffer.from(coverB, 'base64'))
  const rows = [chat('old', 300, cardB), chat('a', 499, cardA), chat('card', 1200, { mode: 'card' }), chat(testSession, 2000)]
  const writeIndex = () => writeFile(join(data, 'index.json'), JSON.stringify({ chats: rows }))
  const writeChat = (index, messages) => writeFile(join(data, rows[index].id + '.json'), JSON.stringify({ messages }))
  const messages = [{ role: 'assistant', sourceText: '开场🌙', text: '不同的渲染文本' }, { role: 'user', text: '继续吧' }]
  await writeIndex()
  await writeChat(0, [])
  await writeChat(1, messages)

  let saved, notifySaved
  const states = []
  function start() {
    const handlers = new Map()
    let settle
    apply({
      effect: run => run(),
      tavern: {
        handle: (route, handler) => { handlers.set(route, handler) },
        onTurnSettled: handler => { settle = handler },
        readPluginData: async () => structuredClone(saved),
        savePluginData: async ({ data }) => { saved = structuredClone(data); notifySaved?.() },
        publishState: async state => { states.push(state) },
      },
    })
    return { settle, claim: handlers.get(name + '/claim-achievement'), preview: handlers.get(name + '/preview-achievement') }
  }

  const initialized = new Promise(resolve => { notifySaved = resolve })
  const first = start()
  await initialized
  const earned = () => saved.achievements.filter(tier => tier.earned)
  assert.deepEqual(earned().map(tier => [tier.rounds, tier.unlockedAt]), [[50, null], [100, null], [300, null]])
  assert.deepEqual(states, [])
  const beforePreview = structuredClone(saved)
  const rainbow = await first.preview({ gameId: 'a', id: 'rainbow' })
  assert.equal(rainbow.cardName, '测试卡甲')
  assert.equal(rainbow.cover, coverUrl(coverA))
  assert.equal(rainbow.rounds, 1000)
  assert.equal(rainbow.title, '这局直接封神')
  assert.equal(rainbow.contextChars, 6)
  assert.equal(rainbow.turnCount, 499)
  assert.equal(rainbow.startedAt, cardA.createdAt)
  const goldPreview = await first.preview({ gameId: 'old', id: 'gold' })
  assert.equal(goldPreview.cardName, '测试卡乙')
  assert.equal(goldPreview.cover, coverUrl(coverB))
  assert.equal(goldPreview.contextChars, 0)
  assert.equal(await first.preview({ gameId: 'card', id: 'rainbow' }), null)
  assert.equal(await first.preview({ gameId: testSession, id: 'rainbow' }), null)
  assert.equal(await first.preview({ gameId: 'a', id: 'missing' }), null)
  assert.deepEqual(saved, beforePreview)
  assert.deepEqual(states, [])
  assert.equal(first.claim({ gameId: 'a', id: 'rainbow' }), null)
  await first.settle({ gameId: 'a' })
  await first.settle({ gameId: 'card' })
  await first.settle({ gameId: testSession })
  assert.deepEqual(states, [])

  rows[1] = chat('a', 500, cardA)
  await writeIndex()
  messages.push({ role: 'assistant', text: '新回复' })
  await writeChat(1, messages)
  await first.settle({ gameId: 'a', greeting: true })
  assert.deepEqual(states, [])
  await Promise.all([first.settle({ gameId: 'a' }), first.settle({ gameId: 'a' })])
  assert.deepEqual(states, [{ gameId: 'a', name: 'achievement', data: { id: 'gold' } }])
  assert.equal(first.claim({ gameId: 'a', id: 'silver' }), null)
  const gold = first.claim({ gameId: 'a', id: 'gold' })
  assert.equal(gold.title, '名场面制造机')
  assert.equal(gold.cover, coverUrl(coverA))
  assert.equal(gold.cardName, '测试卡甲')
  assert.equal(gold.contextChars, 9)
  assert.equal(gold.turnCount, 500)
  assert.equal(gold.startedAt, cardA.createdAt)
  assert.ok(gold.unlockedAt > 0)
  assert.equal(first.claim({ gameId: 'a', id: 'gold' }), null)

  await writeFile(join(data, cardA.cardPath), Buffer.from(coverB, 'base64'))
  messages.push({ role: 'user', text: '好' })
  await writeChat(1, messages)
  const restarted = start()
  await restarted.settle({ gameId: 'a' })
  const updatedPreview = await restarted.preview({ gameId: 'a', id: 'gold' })
  assert.equal(updatedPreview.cover, coverUrl(coverB))
  assert.equal(updatedPreview.contextChars, 10)
  assert.deepEqual(earned().at(-1), gold)
  await rm(join(data, cardA.cardPath))
  await rm(join(data, rows[1].id + '.json'))
  const missing = await restarted.preview({ gameId: 'a', id: 'gold' })
  assert.equal(missing.cover, undefined)
  assert.equal(missing.contextChars, undefined)
  assert.equal(restarted.claim({ gameId: 'a', id: 'gold' }), null)
  assert.equal(states.length, 1)
  assert.deepEqual(earned().map(tier => tier.rounds), [50, 100, 300, 500])

  const fourTiers = saved.achievements.filter(tier => tier.id !== 'starter')
  saved = { version: 1, achievements: fourTiers }
  await start().settle({ gameId: 'not-a-chat' })
  assert.deepEqual(saved.achievements[0], { id: 'starter', rounds: 50, title: '开局就上头', earned: true, unlockedAt: null })
  assert.deepEqual(saved.achievements.slice(1), fourTiers)
  assert.equal(states.length, 1)

  const lockedFourTiers = fourTiers.map(({ id, rounds, title }) => ({ id, rounds, title, earned: false, unlockedAt: null }))
  saved = { version: 1, achievements: lockedFourTiers }
  rows.splice(0, rows.length, chat('a', 50, cardA))
  await writeIndex()
  await start().settle({ gameId: 'not-a-chat' })
  assert.deepEqual(earned().map(tier => tier.rounds), [50], 'A qualifying save is enough to backfill the new tier')
  assert.equal(states.length, 1, 'Backfill is silent')

  saved.achievements[0] = { ...saved.achievements[0], earned: false }
  rows[0] = chat('a', 49, cardA)
  await writeIndex()
  const lowest = start()
  await lowest.settle({ gameId: 'a' })
  assert.equal(states.length, 1)
  rows[0] = chat('a', 50, cardA)
  await writeIndex()
  await lowest.settle({ gameId: 'a' })
  assert.deepEqual(states.at(-1), { gameId: 'a', name: 'achievement', data: { id: 'starter' } })
  assert.equal(lowest.claim({ gameId: 'a', id: 'starter' }).title, '开局就上头')
})
