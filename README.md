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
Create a container on your site where you want the animation to show up:
    <div id="spritespin"/>
In your javascript fire the plugin on that container:
    $("#spritespin").spritespin([options]);

For more information visit http://giniedp.github.com/spritespin/