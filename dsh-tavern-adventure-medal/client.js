window.__ModuleLoader__.load({
  id: 'dsh-tavern-adventure-medal',
  factory() {
    const name = 'dsh-tavern-adventure-medal'
    const PREVIEW_EVENT = name + ':preview'
    const UNLOCK_EVENT = name + ':unlocked'
    const SETTINGS_BUTTON = '[data-slot="settings.launcher"] button, button[aria-label="设置"], button[aria-label="Settings"]'
    const DISPLAY_MS = 3400
    const ENTER_MS = 260
    const EXIT_MS = 280
    const EASE_OUT = 'cubic-bezier(.23, 1, .32, 1)'
    const EASE_IN_OUT = 'cubic-bezier(.77, 0, .175, 1)'
    const CONFETTI_COLORS = ['#ffe4a0', '#f6ad59', '#efa0bb', '#a4ddcf', '#b5c8ff', '#fff4da']
    const styles = `
.adventure-celebration {
  position: fixed; inset: 0; z-index: 2100; display: grid; place-items: center;
  box-sizing: border-box; width: auto; height: auto; margin: 0; padding: 0; border: 0;
  background: transparent; overflow: hidden; pointer-events: none;
}
.adventure-celebration::backdrop { background: transparent; pointer-events: none; }
.adventure-celebration-shade {
  position: absolute; inset: 0; background: radial-gradient(ellipse at center, #34233168, #110e1bbb 80%);
}
.adventure-celebration-card {
  --adventure-trim: #ffdfa8;
  position: relative; z-index: 1; isolation: isolate; overflow: hidden; container-type: inline-size;
  display: flex; flex-direction: column; justify-content: end; align-items: center;
  box-sizing: border-box; width: min(350px, calc(100vw - 32px), 64dvh); aspect-ratio: 3 / 4;
  padding: clamp(12px, 3vh, 24px);
  border: 1px solid #ffdda6ac; border-radius: 20px; text-align: center; color: #fff3e1;
  background: radial-gradient(ellipse at 50% 28%, #896248, transparent 72%), linear-gradient(145deg, #34404d, #221624);
  box-shadow: 0 18px 64px #09071099, 0 0 28px #ffbf6338;
}
.adventure-celebration-card[data-tier="silver"] { --adventure-trim: #dfeaf9; }
.adventure-celebration-card[data-tier="gold"] { --adventure-trim: #ffe29b; }
.adventure-celebration-card[data-tier="rainbow"] { --adventure-trim: #f6d8f1; }
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
.adventure-celebration-confetti { position: absolute; left: 50%; top: 50%; width: 7px; height: 11px; border-radius: 1px; }
.adventure-celebration-confetti:nth-child(3n) { width: 7px; height: 7px; border-radius: 50%; }
.adventure-celebration-confetti:nth-child(5n) { width: 5px; height: 15px; }
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

        function scatterConfetti(layer, width) {
          for (let i = 0; i < 28; i++) {
            const side = i % 2 ? -1 : 1
            const spread = Math.random()
            const distance = width * (.24 + spread * .56)
            const lift = width * (.1 + Math.random() * .58)
            const turn = side * (70 + Math.random() * 210)
            const bit = element('span', 'confetti')
            bit.setAttribute('aria-hidden', 'true')
            bit.style.backgroundColor = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
            layer.append(bit)
            const motion = bit.animate([
              { transform: `translate(${side * width * .27}px, 30px) rotate(0deg)`, opacity: 0 },
              { transform: `translate(${side * distance * .9}px, ${-lift}px) rotate(${turn * .6}deg)`, opacity: 1, offset: .55 },
              { transform: `translate(${side * distance}px, ${-lift + 55}px) rotate(${turn}deg)`, opacity: 0 },
            ], { duration: 290, delay: 30 + spread * 70, easing: EASE_OUT, fill: 'both' })
            motion.finished.then(() => bit.remove(), () => {})
          }
        }

        function flyToSettings(layer, card, shade, reduced) {
          if (celebration !== layer) return
          const target = reduced ? null : settingsBounds(document)
          const frames = [{ opacity: 1 }, { opacity: 0 }]
          if (target) {
            const bounds = card.getBoundingClientRect()
            const dx = target.left + target.width / 2 - (bounds.left + bounds.width / 2)
            const dy = target.top + target.height / 2 - (bounds.top + bounds.height / 2)
            frames[0].transform = 'translate(0, 0) scale(1)'
            frames[1].transform = `translate(${dx}px, ${dy}px) scale(.13)`
            frames.splice(1, 0, {
              transform: `translate(${dx * .85}px, ${dy * .85}px) scale(.26)`, opacity: 1, offset: .7,
            })
          }
          if (typeof card.animate !== 'function') return clearCelebration()
          shade.animate([{ opacity: 1 }, { opacity: 0 }], { duration: EXIT_MS, easing: EASE_OUT, fill: 'forwards' })
          card.animate(frames, { duration: EXIT_MS, easing: target ? EASE_IN_OUT : EASE_OUT, fill: 'forwards' })
            .finished.then(() => { if (celebration === layer) clearCelebration() }, () => {})
        }

        function show(achievement, preview = false) {
          clearCelebration()
          const layer = celebration = element('div')
          const shade = element('div', 'shade')
          shade.setAttribute('aria-hidden', 'true')
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
          layer.append(shade, card)
          if (typeof layer.showPopover === 'function') layer.setAttribute('popover', 'manual')
          document.body.append(layer)
          if (layer.hasAttribute('popover')) layer.showPopover()

          const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          if (typeof card.animate === 'function') {
            const enter = [{ opacity: 0 }, { opacity: 1 }]
            if (!reduced) {
              enter[0].transform = 'translateY(8%) scale(.93)'
              enter[1].transform = 'translateY(0) scale(1)'
              scatterConfetti(layer, card.offsetWidth)
            }
            card.animate(enter, { duration: ENTER_MS, easing: EASE_OUT })
            shade.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ENTER_MS, easing: EASE_OUT })
          }
          timer = window.setTimeout(() => flyToSettings(layer, card, shade, reduced), DISPLAY_MS)
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
