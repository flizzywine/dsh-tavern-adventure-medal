window.__ModuleLoader__.load({
  id: 'dsh-tavern-adventure-medal',
  factory() {
    const name = 'dsh-tavern-adventure-medal'
    const PREVIEW_EVENT = name + ':preview'
    const UNLOCK_EVENT = name + ':unlocked'
    const SETTINGS_BUTTON = '[data-slot="settings.launcher"] button, button[aria-label="设置"], button[aria-label="Settings"]'
    const DISPLAY_MS = 3400
    const ENTER_MS = 290
    const EXIT_MS = 295
    const EASE_OUT = 'cubic-bezier(.23, 1, .32, 1)'
    const EASE_IN_OUT = 'cubic-bezier(.77, 0, .175, 1)'
    const CELEBRATIONS = {
      bronze: {
        colors: ['#ffbc83', '#f9784b', '#ffe5bc', '#ffc35b'], shapes: ['spark', 'dot'], bursts: [22], spread: .72,
      },
      silver: {
        colors: ['#cbdcff', '#8ee5ff', '#edf6ff', '#b7b0ff'], shapes: ['shard', 'spark'], bursts: [32], spread: .95,
      },
      gold: {
        colors: ['#ffe288', '#ffb64b', '#fff5c0', '#f89d62'], shapes: ['ribbon', 'foil', 'spark'], bursts: [30, 18], spread: 1.13,
      },
      rainbow: {
        colors: ['#ff9ecb', '#ffda78', '#a7f4d6', '#8ad8ff', '#b3a1ff', '#fff3d5'],
        shapes: ['ribbon', 'shard', 'spark', 'foil'], bursts: [36, 24], spread: 1.35,
      },
    }
    const styles = `
.adventure-celebration {
  --adventure-trim: #ffd9ae;
  --adventure-aura: radial-gradient(ellipse, #ffae5966, #dc6e3129 50%, transparent 72%);
  position: fixed; inset: 0; z-index: 2100; display: grid; place-items: center;
  box-sizing: border-box; width: auto; height: auto; margin: 0; padding: 0; border: 0;
  background: transparent; overflow: hidden; pointer-events: none;
}
.adventure-celebration::backdrop { background: transparent; pointer-events: none; }
.adventure-celebration-shade {
  position: absolute; inset: 0; background: radial-gradient(ellipse at center, #34233168, #110e1bbb 80%);
}
.adventure-celebration[data-tier="silver"] {
  --adventure-trim: #d9eeff;
  --adventure-aura: radial-gradient(ellipse, #98c9ff70, #768dff29 48%, transparent 71%);
}
.adventure-celebration[data-tier="gold"] {
  --adventure-trim: #ffe298;
  --adventure-aura: radial-gradient(ellipse, #fff1a98c, #fdb4513d 37%, transparent 70%),
    repeating-conic-gradient(from 7deg, #ffd37966 0deg, transparent 7deg 18deg);
}
.adventure-celebration[data-tier="rainbow"] {
  --adventure-trim: #ffe1f6;
  --adventure-aura: conic-gradient(from 35deg, #e294ff76, #95cdff82, #8ff7d37c, #ffe08c7d, #fba4ba83, #e294ff76);
}
.adventure-celebration-aura {
  position: absolute; width: min(760px, 110vw); aspect-ratio: 1; border-radius: 50%;
  background: var(--adventure-aura);
  mask-image: radial-gradient(ellipse, #000 24%, #000b 47%, transparent 72%);
}
.adventure-celebration[data-tier="rainbow"] .adventure-celebration-aura::after {
  content: ''; position: absolute; inset: 5%; border-radius: 50%;
  background: conic-gradient(from 25deg, transparent, #ecb3ffcc, transparent 26%, #a0e5ffd9, transparent 52%, #90f0cbcc, transparent 74%, #ffe29ecc, transparent);
  mask-image: radial-gradient(circle closest-side, transparent 64%, #000 65% 66%, transparent 67% 74%, #000 75% 76%, transparent 77%);
}
.adventure-celebration-card {
  position: relative; z-index: 1; isolation: isolate; overflow: hidden; container-type: inline-size;
  display: flex; flex-direction: column; justify-content: end; align-items: center;
  box-sizing: border-box; width: min(350px, calc(100vw - 32px), 64dvh); aspect-ratio: 3 / 4;
  padding: clamp(12px, 3vh, 24px);
  border: 1px solid color-mix(in srgb, var(--adventure-trim) 78%, transparent);
  border-radius: 20px; text-align: center; color: #fff3e1;
  background: radial-gradient(ellipse at 50% 28%, #896248, transparent 72%), linear-gradient(145deg, #34404d, #221624);
  box-shadow: 0 18px 64px #09071099, 0 0 32px color-mix(in srgb, var(--adventure-trim) 32%, transparent);
}
.adventure-celebration-cover {
  position: absolute; z-index: -2; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 34%;
}
.adventure-celebration-card::before {
  content: ''; position: absolute; z-index: -1; inset: 0;
  background: linear-gradient(180deg, #140d2008 24%, #17111c22 44%, #17111ccf 72%, #140e18f8 100%);
}
.adventure-celebration-card::after {
  content: ''; position: absolute; inset: 6px; border: 1px solid #ffe4be55; border-radius: 14px;
}
.adventure-celebration-medal { width: 30%; max-width: 88px; height: auto; filter: drop-shadow(0 4px 7px #150a12aa); }
.adventure-celebration-star { color: #ffe2a6; font-size: clamp(27px, 25cqi, 68px); line-height: 1; }
.adventure-celebration-copy { display: grid; justify-items: center; gap: 4px; width: 100%; min-width: 0; line-height: 1.3; }
.adventure-celebration-label {
  margin-top: 6px; color: var(--adventure-trim); font-size: clamp(10px, 4cqi, 12px); font-weight: 700;
  letter-spacing: .16em; text-shadow: 0 1px 4px #130d17;
}
.adventure-celebration-title {
  font-family: 'Songti SC', 'Noto Serif SC', 'SimSun', serif; font-size: clamp(16px, 11cqi, 32px); font-weight: 800;
  text-shadow: 0 2px 7px #150d17;
}
.adventure-celebration-description {
  padding: 3px 10px; border: 1px solid #ffe4be77; border-radius: 999px; background: #211720b8;
  color: var(--adventure-trim); font-size: clamp(10px, 4.6cqi, 14px); font-weight: 650; font-variant-numeric: tabular-nums;
}
.adventure-celebration-character {
  max-width: 100%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: #fff3e1;
  font-size: clamp(10px, 4.5cqi, 14px); text-shadow: 0 1px 5px #130d17;
}
.adventure-celebration-chars { color: #f0ddc9; font-size: clamp(10px, 4.2cqi, 12px); font-variant-numeric: tabular-nums; }
.adventure-celebration-shine {
  position: absolute; z-index: 2; inset: -8%;
  background: linear-gradient(110deg, transparent 35%, #fff7df22 44%, #fffcf19c 49%, #fff2ca35 53%, transparent 63%);
  mix-blend-mode: screen;
}
.adventure-celebration-confetti { position: absolute; z-index: 2; left: 50%; top: 50%; width: 8px; height: 12px; border-radius: 1px; }
.adventure-celebration-confetti[data-shape="spark"] {
  width: 15px; height: 15px; clip-path: polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%);
}
.adventure-celebration-confetti[data-shape="dot"] { width: 5px; height: 5px; border-radius: 50%; }
.adventure-celebration-confetti[data-shape="shard"] { clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); }
.adventure-celebration-confetti[data-shape="ribbon"] { width: 5px; height: 22px; border-radius: 60% 35%; }
.adventure-celebration-arrival {
  position: absolute; z-index: 2; width: 26px; height: 26px; margin: -13px; border-radius: 50%;
  border: 2px solid var(--adventure-trim); box-sizing: border-box; box-shadow: 0 0 15px var(--adventure-trim);
}
`

    function mainGameId(sessions) {
      const list = sessions.list.getSnapshot()
      return Object.values(list?.byId || {}).find(row => row?.retainedBy?.mainView > 0)?.id || list?.current || ''
    }

    function settingsBounds(document) {
      for (const button of document.querySelectorAll(SETTINGS_BUTTON)) {
        const rect = button.getBoundingClientRect()
        const { innerWidth, innerHeight } = document.defaultView
        if (rect.width > 0 && rect.height > 0 && rect.left < innerWidth && rect.right > 0
          && rect.top < innerHeight && rect.bottom > 0 && document.defaultView.getComputedStyle(button).visibility === 'visible') return rect
      }
      return null
    }

    function apply(ctx) {
      const { tavernUi: ui, sessions } = ctx
      if (!sessions?.list?.subscribe || typeof ui?.watchState !== 'function' || typeof ui.callHost !== 'function') return
      ctx.effect(() => {
        const document = window.document
        const style = document.createElement('style')
        style.textContent = styles
        document.head.append(style)

        let disposed = false
        let gameId = ''
        let unwatch
        let celebration
        let timer
        let previewRequest = 0

        function element(tag, part, text) {
          const node = document.createElement(tag)
          node.className = 'adventure-celebration' + (part ? '-' + part : '')
          if (text !== undefined) node.textContent = text
          return node
        }

        function clearCelebration() {
          window.clearTimeout(timer)
          celebration?.remove()
          celebration = undefined
        }

        function scatterConfetti(layer, width, preset, count, delay) {
          const sideRoom = Math.max(12, (layer.clientWidth - width) / 2)
          const reach = Math.min(sideRoom, width * preset.spread)
          for (let i = 0; i < count; i++) {
            const side = i % 2 ? -1 : 1
            const spread = Math.random()
            const start = width * .45
            const distance = start + reach * (.28 + spread * .72)
            const lift = width * (.2 + Math.random() * .66)
            const turn = side * (120 + Math.random() * 340)
            const bit = element('span', 'confetti')
            bit.setAttribute('aria-hidden', 'true')
            bit.dataset.shape = preset.shapes[Math.floor(Math.random() * preset.shapes.length)]
            bit.style.backgroundColor = preset.colors[i % preset.colors.length]
            layer.append(bit)
            const motion = bit.animate([
              { transform: `translate(${side * start}px, ${width * .17}px) rotate(0deg) scale(.6)`, opacity: 0, easing: EASE_OUT },
              { transform: `translate(${side * (start + (distance - start) * .75)}px, ${-lift}px) rotate(${turn * .45}deg) scale(1)`, opacity: 1, offset: .36 },
              { opacity: 1, offset: .68 },
              { transform: `translate(${side * distance}px, ${width * .6 - lift * .3}px) rotate(${turn}deg) scale(.75)`, opacity: 0 },
            ], { duration: 720 + spread * 380, delay: delay + spread * 80, fill: 'both' })
            motion.finished.then(() => bit.remove(), () => {})
          }
        }

        function shineAcrossCard(card) {
          const sheen = element('span', 'shine')
          sheen.setAttribute('aria-hidden', 'true')
          card.append(sheen)
          sheen.animate([
            { transform: 'translateX(-90%)', opacity: 0 },
            { opacity: .85, offset: .35 },
            { opacity: .85, offset: .65 },
            { transform: 'translateX(90%)', opacity: 0 },
          ], { duration: 660, delay: 260, easing: EASE_IN_OUT, fill: 'both' })
            .finished.then(() => sheen.remove(), () => {})
        }

        function flyToSettings(layer, card, shade, aura, reduced) {
          if (celebration !== layer) return
          if (typeof card.animate !== 'function') return clearCelebration()
          const target = reduced ? null : settingsBounds(document)
          const frames = [{ opacity: 1 }, { opacity: 0 }]
          const motions = []
          if (target) {
            const bounds = card.getBoundingClientRect()
            const x = target.left + target.width / 2
            const y = target.top + target.height / 2
            const dx = x - (bounds.left + bounds.width / 2)
            const dy = y - (bounds.top + bounds.height / 2)
            const tilt = Math.sign(dx) * 10
            frames[0].transform = 'translate(0, 0) rotate(0deg) scale(1)'
            frames[1].transform = `translate(${dx}px, ${dy}px) rotate(${tilt}deg) scale(.12)`
            frames.splice(1, 0, {
              transform: `translate(${dx * .78}px, ${dy * .66}px) rotate(${tilt}deg) scale(.3)`, opacity: 1, offset: .7,
            })
            const arrival = element('span', 'arrival')
            arrival.setAttribute('aria-hidden', 'true')
            arrival.style.left = x + 'px'
            arrival.style.top = y + 'px'
            layer.append(arrival)
            motions.push(arrival.animate([
              { transform: 'scale(.9)', opacity: 0 },
              { transform: 'scale(1)', opacity: 1, offset: .22 },
              { transform: 'scale(2.15)', opacity: 0 },
            ], { duration: 190, delay: EXIT_MS - 70, easing: EASE_OUT, fill: 'both' }))
          }
          for (const backdrop of [shade, aura]) {
            backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: EXIT_MS, easing: EASE_OUT, fill: 'forwards' })
          }
          motions.push(card.animate(frames, { duration: EXIT_MS, easing: target ? EASE_IN_OUT : EASE_OUT, fill: 'forwards' }))
          Promise.allSettled(motions.map(animation => animation.finished))
            .then(() => { if (celebration === layer) clearCelebration() })
        }

        function show(achievement, preview = false) {
          clearCelebration()
          const layer = celebration = element('div')
          layer.dataset.tier = achievement.id
          const shade = element('div', 'shade')
          shade.setAttribute('aria-hidden', 'true')
          const aura = element('div', 'aura')
          aura.setAttribute('aria-hidden', 'true')
          const card = element('section', 'card')
          card.dataset.tier = achievement.id
          card.setAttribute('role', 'status')
          card.setAttribute('aria-atomic', 'true')
          if (achievement.cover) {
            const cover = element('img', 'cover')
            cover.alt = ''
            cover.src = achievement.cover
            card.append(cover)
          }
          const medal = element('img', 'medal')
          medal.alt = ''
          medal.width = 218
          medal.height = 280
          medal.addEventListener('error', () => {
            const star = element('span', 'star', '★')
            star.setAttribute('aria-hidden', 'true')
            medal.replaceWith(star)
          }, { once: true })
          medal.src = '/profile-bridge/achievement-medal.webp'
          card.append(medal)
          const copy = element('div', 'copy')
          copy.append(
            element('span', 'label', preview ? '成就预览' : '成就解锁'),
            element('strong', 'title', achievement.title),
            element('span', 'description', `达成 ${achievement.rounds.toLocaleString()} 轮冒险`),
          )
          if (achievement.cardName) copy.append(element('span', 'character', achievement.cardName))
          if (Number.isSafeInteger(achievement.contextChars) && achievement.contextChars >= 0) {
            copy.append(element('span', 'chars', `总字数 ${achievement.contextChars.toLocaleString()} 字`))
          }
          card.append(copy)
          layer.append(shade, aura, card)
          if (typeof layer.showPopover === 'function') layer.setAttribute('popover', 'manual')
          document.body.append(layer)
          if (layer.hasAttribute('popover')) layer.showPopover()

          const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          if (typeof card.animate === 'function') {
            const enter = [{ opacity: 0 }, { opacity: 1 }]
            if (!reduced) {
              enter[0].transform = 'translateY(15%) rotate(-4deg) scale(.9)'
              enter[0].easing = EASE_OUT
              enter[1].transform = 'translateY(0) rotate(0deg) scale(1)'
              enter.splice(1, 0, { transform: 'translateY(-2%) rotate(1deg) scale(1.045)', opacity: 1, offset: .64 })
              const preset = CELEBRATIONS[achievement.id] ?? CELEBRATIONS.bronze
              const width = card.offsetWidth
              preset.bursts.forEach((count, index) => scatterConfetti(layer, width, preset, count, 70 + index * 240))
              shineAcrossCard(card)
              if (achievement.id === 'rainbow') {
                aura.animate([{ transform: 'rotate(-35deg)' }, { transform: 'rotate(0deg)' }], { duration: 1100, easing: EASE_OUT })
              }
            }
            card.animate(enter, { duration: ENTER_MS, easing: reduced ? EASE_OUT : 'linear' })
            for (const backdrop of [shade, aura]) {
              backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ENTER_MS, easing: EASE_OUT })
            }
          }
          timer = window.setTimeout(() => flyToSettings(layer, card, shade, aura, reduced), DISPLAY_MS)
        }

        function followGame() {
          const next = mainGameId(sessions)
          if (next === gameId) return
          gameId = next
          unwatch?.()
          clearCelebration()
          unwatch = next ? ui.watchState(next, 'achievement', payload => {
            if (!payload?.id || disposed || gameId !== next) return
            window.dispatchEvent(new window.Event(UNLOCK_EVENT))
            if (document.visibilityState === 'hidden') return
            void ui.callHost(name + '/claim-achievement', { gameId: next, id: payload.id }).then(achievement => {
              if (!disposed && gameId === next && document.visibilityState !== 'hidden' && achievement) show(achievement)
            }, () => {})
          }) : undefined
        }

        function preview(event) {
          const { id, complete } = event.detail || {}
          if (typeof id !== 'string' || typeof complete !== 'function') return
          event.preventDefault()
          const selectedGame = mainGameId(sessions)
          const request = ++previewRequest
          if (!selectedGame) return complete(null)
          void ui.callHost(name + '/preview-achievement', { gameId: selectedGame, id }).then(achievement => {
            if (disposed || request !== previewRequest) return
            if (!achievement || mainGameId(sessions) !== selectedGame) return complete(null)
            show(achievement, true)
            complete(achievement)
          }, () => { if (!disposed && request === previewRequest) complete(null) })
        }

        const unsubscribe = sessions.list.subscribe(followGame)
        window.addEventListener(PREVIEW_EVENT, preview)
        followGame()
        return () => {
          disposed = true
          unsubscribe()
          window.removeEventListener(PREVIEW_EVENT, preview)
          unwatch?.()
          clearCelebration()
          style.remove()
        }
      }, 'adventure-medal: achievement celebration')
    }

    return { name, inject: ['tavernUi', 'sessions'], apply }
  },
})
