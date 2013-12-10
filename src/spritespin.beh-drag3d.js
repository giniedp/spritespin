(function ($, SpriteSpin) {
  "use strict";

  SpriteSpin.registerModule('drag3d', {

    mousedown: function (e) {
      var $this = $(this), data = $this.spritespin('data');
      SpriteSpin.updateInput(e, data);
      data.onDrag = true;
    },

    mousemove: function (e) {
      var $this = $(this), data = $this.spritespin('data');
      if (data.onDrag) {
        SpriteSpin.updateInput(e, data);

        // number of frames per row
        var fx = (data.framesX || data.frames);

        // resolve click coordinates in frame units
        var cx = data.clickframe % fx;
        var cy = data.clickframe / fx;

        cx += Math.round(data.dX / data.width * (data.senseX || data.sense));
        cy += Math.round(data.dY / data.height * (data.senseY || data.sense));
        //cx = cx < 0 ? 0 : (cx > fx - 1 ? fx - 1 : cx);

        var frame = Math.round(fx * cy) + cx;
        $this.spritespin("update", frame);  // update to frame
        $this.spritespin("animate", false);  // stop animation
      }
    },

    mouseup: function (e) {
      var $this = $(this), data = $this.spritespin('data');
      SpriteSpin.resetInput(data);
      data.onDrag = false;
    },

    mouseleave: function (e) {
      var $this = $(this), data = $this.spritespin('data');
      SpriteSpin.resetInput(data);
      data.onDrag = false;
    }
  });

}(window.jQuery || window.Zepto || window.$, window.SpriteSpin));
