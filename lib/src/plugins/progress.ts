import { css, hide, show } from 'core/utils'
import { InstanceState, registerPlugin, Utils } from '../core'
const { createElement } = Utils

const NAME = 'progress'

registerPlugin(NAME, (data: InstanceState) => {

  const stage = createElement('div', { class: 'spritespin-progress' })
  const label = createElement('div', { class: 'spritespin-progress-label' })
  const progress = createElement('div', { class: 'spritespin-progress-bar' })
  stage.appendChild(label)
  stage.appendChild(progress)
  data.target.appendChild(stage)
  label.textContent = '0%'
  css(stage, { position: 'absolute', width: '100%', top: 0 })
  label.style.textAlign = 'center'
  progress.style.width = '0%'

  function update() {
    if (data.isLoading) {
      label.textContent = `${data.progress.percent}%`
      progress.style.width = `${data.progress.percent}%`
      show(stage)
    } else {
      hide(stage)
    }
  }

  function destroy() {
    stage.remove()
  }

  return {
    name: NAME,
    onInit: update,
    onProgress: update,
    onLoad: update,
    onDestroy: destroy
  }
})
