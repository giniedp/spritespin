(function () {
  var Loader = this.SpriteLoader = function(images, callback){
    if (typeof (images) === "string") { 
      images = [images]; 
    }
    
    this.callback = callback;
    this.numLoaded = 0;
    this.numErrors = 0;
    this.numAborts = 0;
    this.numProcessed = 0;
    this.numImages = images.length;
    this.images = [];
    var i = 0;
    for (i = 0; i < images.length; i += 1 ) {
      this.load(images[i]); 
    }
  };
  Loader.prototype.load = function(imageSource){
    var image = new Image();
    this.images.push(image);
    image.loader = this;
    image.onload = function(){
      this.loader.numLoaded += 1;
      this.loader.numProcessed += 1;
      if (this.loader.numProcessed === this.loader.numImages) { 
        this.loader.callback(this.loader); 
      }
    }; 
    
    image.onerror = function(){
      this.loader.numErrors += 1;
      this.loader.numProcessed += 1;
      if (this.loader.numProcessed === this.loader.numImages) { 
        this.loader.callback(this.loader); 
      }
    };
    
    image.onabort = function(){
      this.loader.numAborts += 1;
      this.loader.numProcessed += 1;
      if (this.loader.numProcessed === this.loader.numImages) { 
        this.loader.callback(this.loader); 
      }
    };
    image.src = imageSource;
  };
}());