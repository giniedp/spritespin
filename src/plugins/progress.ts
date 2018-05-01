import * as SpriteSpin from '../core'
import * as Utils from '../utils'

(() => {

interface State {
  stage: JQuery<HTMLElement>
}

const template = `
<div class='spritespin-progress'>
  <div class='spritespin-progress-label'></div>
  <div class='spritespin-progress-bar'></div>
</div>
`

function getState(data: SpriteSpin.Data) {
  return SpriteSpin.getPluginState<State>(data, NAME)
}

const NAME = 'progress'
function onInit(e, data: SpriteSpin.Data) {
  const state = getState(data)
  if (!state.stage) {
    state.stage = Utils.$(template)
    state.stage.appendTo(data.target)
  }

  state.stage.find('.spritespin-progress-label')
    .text(`0%`)
    .css({ 'text-align': 'center' })
  state.stage.find('.spritespin-progress-bar').css({
    width: `0%`
  })

  state.stage.hide().fadeIn()
}
function onProgress(e, data: SpriteSpin.Data) {
  const state = getState(data)
  state.stage.find('.spritespin-progress-label')
    .text(`${data.progress.percent}%`)
    .css({ 'text-align': 'center' })
  state.stage.find('.spritespin-progress-bar').css({
    width: `${data.progress.percent}%`
  })
}

function onLoad(e, data: SpriteSpin.Data) {
  Utils.$(getState(data).stage).fadeOut()
}

function onDestroy(e, data: SpriteSpin.Data) {
  Utils.$(getState(data).stage).remove()
}

SpriteSpin.registerPlugin(NAME, {
  name: NAME,
  onInit: onInit,
  onProgress: onProgress,
  onLoad: onLoad,
  onDestroy: onDestroy
})

})()
