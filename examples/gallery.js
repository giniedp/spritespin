(function($, window){
  $.fn.spritespingallery = function(){
    var options = {
      width : $(this).attr("spin-width"),
      height : $(this).attr("spin-height")
    };
    var $this = $(this);
    var spin = $this.find(".spritespin");
    var spins = $this.find(".spritespin img");
    $this.find(".spritespin").spritespin({
      width     : options.width,
      height    : options.height,
      frames    : spins.length,
      frameTime : 1000,
      behavior  : "click",
      module    : "gallery"
    }).bind("onFrame", function(e, data){
      $this.find(".slider").slider("value", data.frame);
    });
    $this.find(".slider").slider({
      max : spins.length - 1,
      slide : function(e, ui){ spin.spritespin("frame", ui.value); }
    });
    $this.find(".btn-next").click(function(){
      var d = spin.data("spritespin");
      spin.spritespin("frame", d.frame + 1);
      return false;
    });
    $this.find(".btn-prev").click(function(){
      var d = spin.data("spritespin");
      spin.spritespin("frame", d.frame - 1);
      return false;
    });
    $this.find(".btn-zoom").click(function(){
      var d = spin.data("spritespin");
      var img = $($this.find(".originals *")[d.frame]).clone();
      $.fancybox({ content: img });
      return false;
    });
    $this.find(".btn-grid").click(function(){
      $this.find(".thumbnails").toggle();
      return false;
    });
    $this.find(".thumbnails *").click(function(){
      $this.find(".thumbnails").hide();
      spin.spritespin("frame", $(this).index());
      return false;
    });
    $this.find(".thumbnails").hide().css({
      width : options.width,
      height : options.height,
      position : "absolute",
      top : "0px",
      left : "0px",
      overflow : "hidden"
    });
    $this.find(".originals").hide();
    $this.css({
      width : options.width,
      height : options.height,
      position : "relative"
    });
  }

  $(function(){
    $(".spin-gallery").spritespingallery();
  });
})(jQuery, window);
