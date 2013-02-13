(function () {
  var Loader = this.SpriteLoader = {};
  Loader.preload = function(images, callback){
    if (typeof (images) === "string") { images = [images]; }
    var i, data = {
      callback : callback,
      numLoaded: 0,
      numImages: images.length,
      images   : []
    };
    for (i = 0; i < images.length; i += 1 ) {
      Loader.load(images[i], data); 
    }
  };
  Loader.load = function(imageSource, data){
    var image = new Image();
    data.images.push(image);
    image.onload = function(){
      data.numLoaded += 1;
      if (data.numLoaded === data.numImages) { 
        data.callback(data.images); 
      }
    }; 
    image.src = imageSource;
  };
}());