SpriteSpin.registerPlugin('my-plugin', function() {
  return {
    name: 'my-plugin',
    onInit(e, state) {
      SpriteSpin.getPluginOptions(state, 'my-plugin')
    }
  }
})
