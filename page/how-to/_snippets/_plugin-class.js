class MyPlugin {
  constructor() {
    this.name = "my-plugin"
  }
  onInit(e, state) {
    // ...
  }
}
SpriteSpin.registerPlugin('my-plugin', MyPlugin)
