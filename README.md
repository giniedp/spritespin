SpriteSpin jQuery Plugin
=====================================================
This plugin enables spriteanimation on your website. It requires a series of 
images stiched together into a single spritesheet and is able to play these 
images frame by frame which results in an animation. The aim of this plugin is
to provide a 360° view of some kind of product. There is no flash needed, 
everything is done with javascript and the jQuery framework.

Requirements
=====
The only requirement is the jQuery core framework. The plugin is tested with
jQuery-1.4.2. Optional requirement is the jQuery-ui framework in order you want
to control the animation by using a slider.

Usage
=====
Create a container on your site where you want the animation to show up

  <div id="spritespin"/>
  
In your javascript fire the plugin on that container

  $("#spritespin").spritespin([options]);
  
Options
=====
* **width** The width of a single frame. Default is 640.
* **height** The height of a single frame. Default is 480.
* **frames** Total number of frames. Default os 36.
* **frame** Initial frame number. Default is 0.
* **animate** If true, starts the animation after initialize. Default is false.
* **loop** If true, always repeats the animation.
* **speed** Time in miliseconds between updates. Default is 32 (8 Frames per second).
* **reverse** If true, plays the animation backward. Default is false.
* **image** Path to the sprite image. Default is "images/spritespin.jpg"
* **onFrameChanged** Event that is called when the framenumber has changed. Default is undefined.
* **slider** Instance of a jQuery-ui Slider.Default is undefined.
* **interactive** If true, enables mouse interaction. This allows to "drag" the animation. Default is true.

Api
=====
After a container has been initialized with the plugin, there are some methods
available on that container.

Update
-----
* **$("#spritespin").spritepin("update")** Updates the player. Frame number will be incremented.
* **$("#spritespin").spritepin("update", <number>)** Updates the player to the specified frame number.

Animate
-----
* **$("#spritespin").spritepin("animate")** Returns true if animation is running, otherwise false.
* **$("#spritespin").spritepin("animate", true)** Starts the animation if animation is running.
* **$("#spritespin").spritepin("animate", false)** Stops the animation if animation is running.
* **$("#spritespin").spritepin("animate", "toggle")** Toggles the animation

Frame
-----
* **$("#spritespin").spritepin("frame")** Returns the current framenumber.
* **$("#spritespin").spritepin("frame", <number>)** Same as update.

Loop
-----
* **$("#spritespin").spritepin("loop")** Gets a value whether the animation loops or not.
* **$("#spritespin").spritepin("loop", <boolean>)** Sets a value whether the animation loops or not.

Related work
=====
Same functionality is provided by the reel plugin http://jquery.vostrel.cz/reel
However, this does not perform well in firefox. Since firefox is one of the
widely used browsers i wrote the plugin from scratch. Unfortunately this plugin
also has its drawbacks, see known issues.

Known Issues
=====
* Opera browser plays only the half of the animation. Still working on that.
* Chrome browser performs bad during animation. Working on that too.