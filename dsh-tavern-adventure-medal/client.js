window.__ModuleLoader__.load({
  id: 'dsh-tavern-adventure-medal',
  factory() {
    const name = 'dsh-tavern-adventure-medal'
    const PREVIEW_EVENT = 'dsh-tavern-adventure-medal:preview'
    const DISPLAY_MS = 4200
    const EXIT_MS = 180
    const styles = `
.adventure-achievement {
  position: fixed;
  z-index: 2100;
  inset: auto max(16px, env(safe-area-inset-right, 0px)) max(20px, env(safe-area-inset-bottom, 0px)) auto;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12px;
  width: max-content;
  max-width: calc(100vw - 40px);
  margin: 0;
  padding: 12px 16px 12px 12px;
  border: 1px solid #e4bf714f;
  border-radius: 12px;
  background: #25231f;
  color: #fff8e8;
  box-shadow: 0 8px 24px #0005;
  pointer-events: none;
  opacity: 1;
  transform: translateY(0);
  transition: opacity 180ms cubic-bezier(.23, 1, .32, 1), transform 180ms cubic-bezier(.23, 1, .32, 1);
}
.adventure-achievement[data-leaving] { opacity: 0; transform: translateY(22%); }
@starting-style { .adventure-achievement { opacity: 0; transform: translateY(22%); } }
@media (prefers-reduced-motion: reduce) {
  .adventure-achievement, .adventure-achievement[data-leaving] { transform: none; }
}
.adventure-achievement-mark {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex: none;
  border-radius: 50%;
  background: #704d32;
  color: #ffe7ba;
  font-size: 19px;
}
.adventure-achievement[data-tier="silver"] .adventure-achievement-mark { background: #4d5862; color: #e5f2ff; }
.adventure-achievement[data-tier="gold"] .adventure-achievement-mark { background: #786025; color: #fff2b6; }
.adventure-achievement[data-tier="rainbow"] .adventure-achievement-mark { background: linear-gradient(135deg, #805666, #4d6280); color: #fff2d9; }
.adventure-achievement-copy { min-width: 0; display: grid; gap: 3px; }
.adventure-achievement-label { color: #d8ba83; font-size: 12px; }
.adventure-achievement-title { font-size: 15px; line-height: 1.4; font-weight: 650; }
`

    function mainGameId(sessions) {
      const list = sessions.list.getSnapshot()
      return Object.values(list?.byId || {}).find(row => row?.retainedBy?.mainView > 0)?.id || list?.current || ''
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
        let toast
        let timer
        let previewRequest = 0

        function clearToast() {
          window.clearTimeout(timer)
          toast?.remove()
          toast = undefined
        }

        function show(achievement, aboveSettings = false) {
          clearToast()
          toast = document.createElement('div')
          toast.className = 'adventure-achievement'
          toast.dataset.tier = achievement.id
          toast.setAttribute('role', 'status')
          const mark = document.createElement('span')
          mark.className = 'adventure-achievement-mark'
          mark.textContent = '★'
          mark.setAttribute('aria-hidden', 'true')
          const copy = document.createElement('div')
          copy.className = 'adventure-achievement-copy'
          const label = document.createElement('span')
          label.className = 'adventure-achievement-label'
          label.textContent = '成就解锁'
          const title = document.createElement('strong')
          title.className = 'adventure-achievement-title'
          title.textContent = achievement.title
          toast.append(mark, copy)
          if (aboveSettings && typeof toast.showPopover === 'function') {
            toast.setAttribute('popover', 'manual')
          }
          document.body.append(toast)
          if (toast.hasAttribute('popover')) toast.showPopover()
          copy.append(label, title)
          timer = window.setTimeout(() => {
            toast.dataset.leaving = ''
            timer = window.setTimeout(clearToast, EXIT_MS)
          }, DISPLAY_MS)
        }

        function followGame() {
          const next = mainGameId(sessions)
          if (next === gameId) return
          gameId = next
          unwatch?.()
          clearToast()
          unwatch = next ? ui.watchState(next, 'achievement', payload => {
            if (!payload?.id || document.visibilityState === 'hidden') return
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
          clearToast()
          style.remove()
        }
      }, 'adventure-medal: achievement notifications')
    }

    return { name, inject: ['tavernUi', 'sessions'], apply }
  },
})
