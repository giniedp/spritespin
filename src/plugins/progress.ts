import { Data, getPluginState, registerPlugin, Utils } from '../core'
const { fadeOut, hide, fadeIn, createElement } = Utils

interface State {
  stage: HTMLElement
  label: HTMLElement
  progress: HTMLElement
}

const NAME = 'progress'

function getState(data: Data) {
  return getPluginState<State>(data, NAME)
}

function onInit(e: Event, data: Data) {
  const state = getState(data)
  if (!state.stage) {
    state.stage = createElement('div', { class: 'spritespin-progress' })
    state.label = createElement('div', { class: 'spritespin-progress-label' })
    state.progress = createElement('div', { class: 'spritespin-progress-bar' })
    state.stage.appendChild(state.label)
    state.stage.appendChild(state.progress)
    data.target.appendChild(state.stage)
  }
  state.label.textContent = '0%'
  state.label.style.textAlign = 'center'
  state.progress.style.width = '0%'

  hide(state.stage)
  fadeIn(state.stage)
}
function onProgress(e: Event, data: Data) {
  const state = getState(data)
  state.label.textContent = `${data.progress.percent}%`
  state.progress.style.width = `${data.progress.percent}%`
}

function onLoad(e: Event, data: Data) {
  fadeOut(getState(data).stage)
}

function onDestroy(e: Event, data: Data) {
  getState(data).stage.remove()
}

registerPlugin(NAME, {
  name: NAME,
  onInit: onInit,
  onProgress: onProgress,
  onLoad: onLoad,
  onDestroy: onDestroy
})
