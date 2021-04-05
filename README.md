# SpriteSpin

SpriteSpin is library for playing animations from image frames. It requires an array of images or a stiched sprite sheet and plays them frame by frame like a flip book. The aim of this plugin is to provide a 360 degree view of any kind of product.

The library is built with extensibility in mind and comes with a plugin system to customize its behavior.

## NPM
install with npm

```bash
$ npm install spritespin
```

or Yarn

```bash
$ yarn add spritespin
```

## CDN

```html
<script src='https://unpkg.com/spritespin@beta/release/spritespin.js' type='text/javascript'></script>
```

## Usage

```
SpriteSpin.create({
  target: '#spritespin-preview',
  source: SpriteSpin.source('http://spritespin.ginie.eu/images/rad_zoom_{frame}.jpg', {
    frame: [1,34],
    digits: 3,
  })
})
```

## License

Code licensed under the MIT license
