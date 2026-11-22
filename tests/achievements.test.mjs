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
  await mkdir(join(data, 'automation'), { recursive: true })
  await writeFile(join(data, 'automation', testSession + '.json'), JSON.stringify({ sessionId: testSession }))
  const rows = [chat('old', 300), chat('a', 499), chat('card', 1200, { mode: 'card' }), chat(testSession, 2000)]
  const writeIndex = () => writeFile(join(data, 'index.json'), JSON.stringify({ chats: rows }))
  await writeIndex()

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
    return { settle, claim: handlers.get(name + '/claim-achievement') }
  }

  const initialized = new Promise(resolve => { notifySaved = resolve })
  const first = start()
  await initialized
  const earned = () => saved.achievements.filter(tier => tier.earned)
  assert.deepEqual(earned().map(tier => [tier.rounds, tier.unlockedAt]), [[100, null], [300, null]])
  assert.deepEqual(states, [])
  await first.settle({ gameId: 'a' })
  await first.settle({ gameId: 'card' })
  await first.settle({ gameId: testSession })
  assert.deepEqual(states, [])

  rows[1] = chat('a', 500)
  await writeIndex()
  await first.settle({ gameId: 'a', greeting: true })
  assert.deepEqual(states, [])
  await Promise.all([first.settle({ gameId: 'a' }), first.settle({ gameId: 'a' })])
  assert.deepEqual(states, [{ gameId: 'a', name: 'achievement', data: { id: 'gold' } }])
  assert.equal(first.claim({ gameId: 'a', id: 'silver' }), null)
  const gold = first.claim({ gameId: 'a', id: 'gold' })
  assert.equal(gold.title, '酒馆传说')
  assert.ok(gold.unlockedAt > 0)
  assert.equal(first.claim({ gameId: 'a', id: 'gold' }), null)

  const restarted = start()
  await restarted.settle({ gameId: 'a' })
  assert.equal(restarted.claim({ gameId: 'a', id: 'gold' }), null)
  assert.equal(states.length, 1)
  assert.deepEqual(earned().map(tier => tier.rounds), [100, 300, 500])
})
