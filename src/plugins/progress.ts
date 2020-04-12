import * as SpriteSpin from '../core'
import { fadeOut, hide, fadeIn } from '../utils'

interface State {
  stage: HTMLElement
  label: HTMLElement
  progress: HTMLElement
}

const NAME = 'progress'
const template = `
<div class='spritespin-progress'>
  <div class='spritespin-progress-label'></div>
  <div class='spritespin-progress-bar'></div>
</div>
`

function getState(data: SpriteSpin.Data) {
  return SpriteSpin.getPluginState<State>(data, NAME)
}

function onInit(e: Event, data: SpriteSpin.Data) {
  const state = getState(data)
  if (!state.stage) {
    state.stage = document.createElement('div')
    state.stage.outerHTML = template
    state.label = state.stage.querySelector('.spritespin-progress-label')
    state.progress = state.stage.querySelector('.spritespin-progress-bar')
    data.target.appendChild(state.stage)
  }

  state.label.textContent = '0%'
  state.label.style.textAlign = 'center'
  state.progress.style.width = '0%'

  hide(state.stage)
  fadeIn(state.stage)
}
function onProgress(e: Event, data: SpriteSpin.Data) {
  const state = getState(data)
  state.label.textContent = `${data.progress.percent}%`
  state.progress.style.width = `${data.progress.percent}%`
}

function onLoad(e: Event, data: SpriteSpin.Data) {
  fadeOut(getState(data).stage)
}

function onDestroy(e: Event, data: SpriteSpin.Data) {
  getState(data).stage.remove()
}

SpriteSpin.registerPlugin(NAME, {
  name: NAME,
  onInit: onInit,
  onProgress: onProgress,
  onLoad: onLoad,
  onDestroy: onDestroy
})
