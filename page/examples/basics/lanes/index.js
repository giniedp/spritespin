SpriteSpin.create({
  target: '#spritespin-example',
  source: SpriteSpin.source('http://spritespin.ginie.eu/images/3d/sample-{lane}-{frame}.jpg', {
    lane: [0,11],
    frame: [0,23],
    digits: 2
  }),
  // width and height of the display
  //- width: 400,
  //- height: 225,
  // the number of lanes (vertical angles)
  lanes: 12,
  // the number of frames per lane (per vertical angle)
  frames: 24,
  // interaction sensitivity (and direction) modifier for horizontal movement
  sense: 1,
  // interaction sensitivity (and direction) modifier for vertical movement
  senseLane: -2,

  // the initial lane number
  lane: 6,
  // the initial frame number (within the lane)
  frame: 0,
  // disable autostart of the animation
  animate: false,

  plugins: [
    'progress',
    '360',
    'drag'
  ]
})
