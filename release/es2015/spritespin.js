"use strict";
var SpriteSpin;
(function (SpriteSpin) {
    //
    // - INSTANCE REGISTRY
    //
    let instanceCounter = 0;
    SpriteSpin.instances = {};
    function pushInstance(data) {
        instanceCounter += 1;
        data.id = String(instanceCounter);
        SpriteSpin.instances[data.id] = data;
    }
    function popInstance(data) {
        delete SpriteSpin.instances[data.id];
    }
    let lazyinit = () => {
        // replace function with a noop
        // this logic must run only once
        lazyinit = () => { };
        function eachInstance(cb) {
            for (const id in SpriteSpin.instances) {
                if (SpriteSpin.instances.hasOwnProperty(id)) {
                    cb(SpriteSpin.instances[id]);
                }
            }
        }
        function onEvent(eventName, e) {
            eachInstance((data) => {
                for (const module of data.plugins) {
                    if (typeof module[eventName] === 'function') {
                        module[eventName].apply(data.target, [e, data]);
                    }
                }
            });
        }
        function onResize() {
            eachInstance((data) => {
                if (data.responsive) {
                    boot(data);
                }
            });
        }
        for (const eventName of SpriteSpin.eventNames) {
            SpriteSpin.$(window.document).bind(eventName + '.' + SpriteSpin.namespace, (e) => {
                onEvent('document' + eventName, e);
            });
        }
        let resizeTimeout = null;
        SpriteSpin.$(window).on('resize', () => {
            window.clearTimeout(resizeTimeout);
            resizeTimeout = window.setTimeout(onResize, 100);
        });
    };
    //
    // - PLUGIN REGISTRY
    //
    /**
     * Collection of registered modules that can be used to extend the functionality of SpriteSpin.
     */
    const plugins = {};
    /**
     * Registers a module implementation as an available extension to SpriteSpin.
     * Use this to add custom Rendering or Updating modules that can be addressed with the 'module' option.
     */
    function registerPlugin(name, plugin) {
        if (plugins[name]) {
            SpriteSpin.Utils.error(`Plugin name "${name}" is already taken`);
            return;
        }
        plugin = plugin || {};
        plugins[name] = plugin;
        return plugin;
    }
    SpriteSpin.registerPlugin = registerPlugin;
    function registerModule(name, plugin) {
        SpriteSpin.Utils.warn('"registerModule" is deprecated, use "registerPlugin" instead');
        registerPlugin(name, plugin);
    }
    SpriteSpin.registerModule = registerModule;
    //
    // - API REGISTRY
    //
    /**
     *
     */
    class Api {
        constructor(data) {
            this.data = data;
        }
    }
    SpriteSpin.Api = Api;
    /**
     * Helper method that allows to extend the api with more methods.
     * Receives an object with named functions that are extensions to the API.
     */
    function registerApi(methods) {
        const api = Api.prototype;
        for (const key in methods) {
            if (methods.hasOwnProperty(key)) {
                if (api[key]) {
                    SpriteSpin.$.error('API method is already defined: ' + key);
                }
                else {
                    api[key] = methods[key];
                }
            }
        }
        return api;
    }
    SpriteSpin.registerApi = registerApi;
    function extendApi(methods) {
        registerApi(methods);
    }
    SpriteSpin.extendApi = extendApi;
    //
    // - STATE REGISTRY
    //
    function getState(data, name) {
        data.state = data.state || {};
        data.state[name] = data.state[name] || {};
        return data.state[name];
    }
    function getInputState(data) {
        return getState(data, 'input');
    }
    SpriteSpin.getInputState = getInputState;
    function getAnimationState(data) {
        return getState(data, 'animation');
    }
    SpriteSpin.getAnimationState = getAnimationState;
    function getPluginState(data, name) {
        const state = getState(data, 'plugin');
        state[name] = state[name] || {};
        return state[name];
    }
    SpriteSpin.getPluginState = getPluginState;
    function is(data, key) {
        return !!getState(data, 'flags')[key];
    }
    SpriteSpin.is = is;
    function flag(data, key, value) {
        getState(data, 'flags')[key] = !!value;
    }
    SpriteSpin.flag = flag;
    /**
     * Updates the input state of the SpriteSpin data using the given mouse or touch event.
     */
    function updateInput(e, data) {
        const cursor = SpriteSpin.Utils.getCursorPosition(e);
        const state = getInputState(data);
        // cache positions from previous frame
        state.oldX = state.currentX;
        state.oldY = state.currentY;
        state.currentX = cursor.x;
        state.currentY = cursor.y;
        // Fix old position.
        if (state.oldX === undefined || state.oldY === undefined) {
            state.oldX = state.currentX;
            state.oldY = state.currentY;
        }
        // Cache the initial click/touch position and store the frame number at which the click happened.
        // Useful for different behavior implementations. This must be restored when the click/touch is released.
        if (state.startX === undefined || state.startY === undefined) {
            state.startX = state.currentX;
            state.startY = state.currentY;
            state.clickframe = data.frame;
            state.clicklane = data.lane;
        }
        // Calculate the vector from start position to current pointer position.
        state.dX = state.currentX - state.startX;
        state.dY = state.currentY - state.startY;
        // Calculate the vector from last frame position to current pointer position.
        state.ddX = state.currentX - state.oldX;
        state.ddY = state.currentY - state.oldY;
        // Normalize vectors to range [-1:+1]
        state.ndX = state.dX / data.target.innerWidth();
        state.ndY = state.dY / data.target.innerHeight();
        state.nddX = state.ddX / data.target.innerWidth();
        state.nddY = state.ddY / data.target.innerHeight();
    }
    SpriteSpin.updateInput = updateInput;
    /**
     * Resets the input state of the SpriteSpin data.
     */
    function resetInput(data) {
        const input = getInputState(data);
        input.startX = input.startY = undefined;
        input.currentX = input.currentY = undefined;
        input.oldX = input.oldY = undefined;
        input.dX = input.dY = 0;
        input.ddX = input.ddY = 0;
        input.ndX = input.ndY = 0;
        input.nddX = input.nddY = 0;
    }
    SpriteSpin.resetInput = resetInput;
    function updateLane(data, lane) {
        data.lane = data.wrapLane
            ? SpriteSpin.Utils.wrap(lane, 0, data.lanes - 1, data.lanes)
            : SpriteSpin.Utils.clamp(lane, 0, data.lanes - 1);
    }
    function updateAnimationFrame(data) {
        data.frame += (data.reverse ? -1 : 1);
        // wrap the frame value to fit in range [0, data.frames)
        data.frame = SpriteSpin.Utils.wrap(data.frame, 0, data.frames - 1, data.frames);
        // stop animation if loop is disabled and the stopFrame is reached
        if (!data.loop && (data.frame === data.stopFrame)) {
            stopAnimation(data);
        }
    }
    function updateInputFrame(data, frame) {
        data.frame = Number(frame);
        data.frame = data.wrap
            ? SpriteSpin.Utils.wrap(data.frame, 0, data.frames - 1, data.frames)
            : SpriteSpin.Utils.clamp(data.frame, 0, data.frames - 1);
    }
    function updateAnimation(data) {
        const state = getAnimationState(data);
        if (state.handler) {
            updateBefore(data);
            updateAnimationFrame(data);
            updateAfter(data);
        }
    }
    function updateBefore(data) {
        const state = getAnimationState(data);
        state.lastFrame = data.frame;
        state.lastLane = data.lane;
    }
    function updateAfter(data) {
        const state = getAnimationState(data);
        if (state.lastFrame !== data.frame || state.lastLane !== data.lane) {
            data.target.trigger('onFrameChanged', data);
        }
        data.target.trigger('onFrame', data);
        data.target.trigger('onDraw', data);
    }
    /**
     * Updates the frame number of the SpriteSpin data. Performs an auto increment if no frame number is given.
     */
    function updateFrame(data, frame, lane) {
        updateBefore(data);
        if (frame !== undefined) {
            updateInputFrame(data, frame);
        }
        if (lane !== undefined) {
            updateLane(data, lane);
        }
        updateAfter(data);
    }
    SpriteSpin.updateFrame = updateFrame;
    /**
     * Stops the running animation on given SpriteSpin data.
     */
    function stopAnimation(data) {
        data.animate = false;
        const state = getAnimationState(data);
        if (state.handler != null) {
            window.clearInterval(state.handler);
            state.handler = null;
        }
    }
    SpriteSpin.stopAnimation = stopAnimation;
    /**
     * Starts animation on given SpriteSpin data if animation is enabled.
     */
    function applyAnimation(data) {
        if (data.animate) {
            requestAnimation(data);
        }
        else {
            stopAnimation(data);
        }
    }
    SpriteSpin.applyAnimation = applyAnimation;
    function requestAnimation(data) {
        const state = getAnimationState(data);
        state.handler = (state.handler || window.setInterval((() => {
            updateAnimation(data);
        }), data.frameTime));
    }
    SpriteSpin.$ = (window['jQuery'] || window['Zepto'] || window['$']); // tslint:disable-line
    /**
     * The namespace that is used to bind functions to DOM events and store the data object
     */
    SpriteSpin.namespace = 'spritespin';
    /**
     * Event names that are recognized by SpriteSpin. A module can implement any of these and they will be bound
     * to the target element on which the plugin is called.
     */
    SpriteSpin.eventNames = [
        'mousedown',
        'mousemove',
        'mouseup',
        'mouseenter',
        'mouseover',
        'mouseleave',
        'dblclick',
        'mousewheel',
        'touchstart',
        'touchmove',
        'touchend',
        'touchcancel',
        'selectstart',
        'gesturestart',
        'gesturechange',
        'gestureend'
    ];
    /**
     *
     */
    SpriteSpin.callbackNames = [
        'onInit',
        'onProgress',
        'onLoad',
        'onFrameChanged',
        'onFrame',
        'onDraw',
        'onComplete'
    ];
    /**
     * Names of events for that the default behavior should be prevented.
     */
    SpriteSpin.eventsToPrevent = [
        'dragstart'
    ];
    /**
     * Default set of SpriteSpin options. This also represents the majority of data attributes that are used during the
     * lifetime of a SpriteSpin instance. The data is stored inside the target DOM element on which the plugin is called.
     */
    SpriteSpin.defaults = {
        source: undefined,
        width: undefined,
        height: undefined,
        frames: undefined,
        framesX: undefined,
        lanes: 1,
        sizeMode: undefined,
        renderer: 'canvas',
        lane: 0,
        frame: 0,
        frameTime: 40,
        animate: true,
        reverse: false,
        loop: true,
        stopFrame: 0,
        wrap: true,
        wrapLane: false,
        sense: 1,
        senseLane: undefined,
        orientation: 'horizontal',
        detectSubsampling: true,
        scrollThreshold: 50,
        preloadCount: undefined,
        responsive: undefined,
        plugins: [
            '360',
            'drag'
        ]
    };
    /**
     * Replaces module names on given SpriteSpin data and replaces them with actual implementations.
     */
    function applyPlugins(data) {
        for (let i = 0; i < data.plugins.length; i += 1) {
            const name = data.plugins[i];
            if (typeof name !== 'string') {
                continue;
            }
            const plugin = plugins[name];
            if (!plugin) {
                SpriteSpin.Utils.error('No plugin found with name ' + name);
                continue;
            }
            data.plugins[i] = plugin;
        }
    }
    SpriteSpin.applyPlugins = applyPlugins;
    /**
     * Applies css attributes to layout the SpriteSpin containers.
     */
    function applyLayout(data) {
        // disable selection
        data.target
            .attr('unselectable', 'on')
            .css({
            width: '',
            height: '',
            '-ms-user-select': 'none',
            '-moz-user-select': 'none',
            '-khtml-user-select': 'none',
            '-webkit-user-select': 'none',
            'user-select': 'none'
        });
        const size = data.responsive ? SpriteSpin.Utils.getComputedSize(data) : SpriteSpin.Utils.getOuterSize(data);
        const layout = SpriteSpin.Utils.getInnerLayout(data.sizeMode, SpriteSpin.Utils.getInnerSize(data), size);
        // apply layout on target
        data.target.css({
            width: size.width,
            height: size.height,
            position: 'relative',
            overflow: 'hidden'
        });
        // apply layout on stage
        data.stage.css(layout).hide();
        if (!data.canvas) {
            return;
        }
        // apply layout on canvas
        data.canvas.css(layout).hide();
        data.context.scale(data.canvasRatio, data.canvasRatio);
        // apply pixel ratio on canvas
        data.canvasRatio = data.canvasRatio || SpriteSpin.Utils.pixelRatio(data.context);
        if (typeof layout.width === 'number' && typeof layout.height === 'number') {
            data.canvas[0].width = (layout.width * data.canvasRatio) || size.width;
            data.canvas[0].height = (layout.height * data.canvasRatio) || size.height;
        }
        else {
            data.canvas[0].width = (size.width * data.canvasRatio);
            data.canvas[0].height = (size.height * data.canvasRatio);
        }
    }
    SpriteSpin.applyLayout = applyLayout;
    /**
     * (re)binds all spritespin events on the target element
     */
    function applyEvents(data) {
        const target = data.target;
        // Clear all SpriteSpin events on the target element
        SpriteSpin.Utils.unbind(target);
        // disable all default browser behavior on the following events
        // mainly prevents image drag operation
        for (const eName of SpriteSpin.eventsToPrevent) {
            SpriteSpin.Utils.bind(target, eName, SpriteSpin.Utils.prevent);
        }
        // Bind module functions to SpriteSpin events
        for (const plugin of data.plugins) {
            for (const eName of SpriteSpin.eventNames) {
                SpriteSpin.Utils.bind(target, eName, plugin[eName]);
            }
            for (const eName of SpriteSpin.callbackNames) {
                SpriteSpin.Utils.bind(target, eName, plugin[eName]);
            }
        }
        // bind auto start function to load event.
        SpriteSpin.Utils.bind(target, 'onLoad', (e, d) => {
            applyAnimation(d);
        });
        // bind all user events that have been passed on initialization
        for (const eName of SpriteSpin.callbackNames) {
            SpriteSpin.Utils.bind(target, eName, data[eName]);
        }
    }
    SpriteSpin.applyEvents = applyEvents;
    function applyMetrics(data) {
        if (!data.images) {
            data.metrics = [];
        }
        data.metrics = SpriteSpin.Utils.measure(data.images, data);
        const spec = SpriteSpin.Utils.findSpecs(data.metrics, data.frames, 0, 0);
        if (spec.sprite) {
            // TODO: try to remove frameWidth/frameHeight
            data.frameWidth = spec.sprite.width;
            data.frameHeight = spec.sprite.height;
        }
    }
    /**
     * Runs the boot process. (re)initializes plugins, (re)initializes the layout, (re)binds events and loads source images.
     */
    function boot(data) {
        applyPlugins(data);
        applyLayout(data);
        applyEvents(data);
        data.loading = true;
        data.target.addClass('loading').trigger('onInit', data);
        SpriteSpin.Utils.preload({
            source: data.source,
            preloadCount: data.preloadCount,
            progress: (progress) => {
                data.progress = progress;
                data.target.trigger('onProgress', data);
            },
            complete: (images) => {
                data.images = images;
                data.loading = false;
                data.frames = data.frames || images.length;
                applyMetrics(data);
                applyLayout(data);
                data.stage.show();
                data.target
                    .removeClass('loading')
                    .trigger('onLoad', data)
                    .trigger('onFrame', data)
                    .trigger('onDraw', data)
                    .trigger('onComplete', data);
            }
        });
    }
    SpriteSpin.boot = boot;
    function instantiate(options) {
        const $this = options.target;
        // SpriteSpin is not initialized
        // Create default settings object and extend with given options
        const data = SpriteSpin.$.extend({}, SpriteSpin.defaults, options);
        // ensure source is set
        data.source = data.source || [];
        // ensure plugins are set
        data.plugins = data.plugins || [];
        // if image tags are contained inside this DOM element
        // use these images as the source files
        $this.find('img').each(() => {
            if (!Array.isArray(data.source)) {
                data.source = [];
            }
            data.source.push(SpriteSpin.$(this).attr('src'));
        });
        // build inner html
        // <div>
        //   <div class='spritespin-stage'></div>
        //   <canvas class='spritespin-canvas'></canvas>
        // </div>
        $this
            .empty()
            .addClass('spritespin-instance')
            .append("<div class='spritespin-stage'></div>");
        // add the canvas element if canvas rendering is enabled and supported
        if (data.renderer === 'canvas') {
            const canvas = document.createElement('canvas');
            if (!!(canvas.getContext && canvas.getContext('2d'))) {
                data.canvas = SpriteSpin.$(canvas).addClass('spritespin-canvas');
                data.context = canvas.getContext('2d');
                $this.append(data.canvas);
                $this.addClass('with-canvas');
            }
            else {
                // fallback to image rendering mode
                data.renderer = 'image';
            }
        }
        // setup references to DOM elements
        data.target = $this;
        data.stage = $this.find('.spritespin-stage');
        // store the data
        $this.data(SpriteSpin.namespace, data);
        pushInstance(data);
        return data;
    }
    function fixPlugins(data) {
        // tslint:disable
        if (data['mods']) {
            SpriteSpin.Utils.warn('"mods" option is deprecated, use "plugins" instead');
            data.plugins = data['mods'];
        }
        // tslint:enable
        if (data.behavior || data.module) {
            SpriteSpin.Utils.warn('"behavior" and "module" options are deprecated, use "plugins" instead');
            if (data.behavior) {
                data.plugins.push(data.behavior);
            }
            if (data.module) {
                data.plugins.push(data.module);
            }
            delete data.behavior;
            delete data.module;
        }
    }
    /**
     * Initializes the target element with spritespin data.
     */
    function createOrUpdate(options) {
        lazyinit();
        const $this = options.target;
        let data = $this.data(SpriteSpin.namespace);
        if (!data) {
            data = instantiate(options);
        }
        else {
            // just update the data object
            SpriteSpin.$.extend(data, options);
        }
        data.source = SpriteSpin.Utils.toArray(data.source);
        fixPlugins(data);
        boot(data);
    }
    SpriteSpin.createOrUpdate = createOrUpdate;
    /**
     * Stops running animation, unbinds all events and deletes the data on the target element of the given data object.
     */
    function destroy(data) {
        popInstance(data);
        stopAnimation(data);
        SpriteSpin.Utils.unbind(data.target);
        data.target.removeData(SpriteSpin.namespace);
    }
    SpriteSpin.destroy = destroy;
    function extension(obj, value) {
        if (obj === 'data') {
            return this.data(SpriteSpin.namespace);
        }
        if (obj === 'api') {
            const data = this.data(SpriteSpin.namespace);
            data.api = data.api || new SpriteSpin.Api(data);
            return data.api;
        }
        if (obj === 'destroy') {
            return SpriteSpin.$(this).each(() => {
                SpriteSpin.destroy(SpriteSpin.$(this).data(SpriteSpin.namespace));
            });
        }
        if (arguments.length === 2 && typeof obj === 'string') {
            const tmp = {};
            tmp[obj] = value;
            obj = tmp;
        }
        if (typeof obj === 'object') {
            obj.target = obj.target || SpriteSpin.$(this);
            SpriteSpin.createOrUpdate(obj);
            return obj.target;
        }
        return SpriteSpin.$.error('Invalid call to spritespin');
    }
    SpriteSpin.$.fn.spritespin = extension;
})(SpriteSpin || (SpriteSpin = {}));
var SpriteSpin;
(function (SpriteSpin) {
    var Utils;
    (function (Utils) {
        function getCursorPosition(event) {
            let touches = event.touches;
            let source = event;
            // jQuery Event normalization does not preserve the 'event.touches'
            // try to grab touches from the original event
            if (event.touches === undefined && event.originalEvent !== undefined) {
                touches = event.originalEvent.touches;
            }
            // get current touch or mouse position
            if (touches !== undefined && touches.length > 0) {
                source = event.touches[0];
            }
            return {
                x: source.clientX || 0,
                y: source.clientY || 0
            };
        }
        Utils.getCursorPosition = getCursorPosition;
    })(Utils = SpriteSpin.Utils || (SpriteSpin.Utils = {}));
})(SpriteSpin || (SpriteSpin = {}));
var SpriteSpin;
(function (SpriteSpin) {
    var Utils;
    (function (Utils) {
        let canvas;
        let context;
        function detectionContext() {
            if (context) {
                return context;
            }
            if (!canvas) {
                canvas = document.createElement('canvas');
            }
            if (!canvas || !canvas.getContext) {
                return null;
            }
            context = canvas.getContext('2d');
            return context;
        }
        /**
         * Idea taken from https://github.com/stomita/ios-imagefile-megapixel
         * Detects whether the image has been sub sampled by the browser and does not have its original dimensions.
         * This method unfortunately does not work for images that have transparent background.
         */
        function detectSubsampling(img, width, height) {
            if (!detectionContext()) {
                return false;
            }
            // sub sampling happens on images above 1 megapixel
            if (width * height <= 1024 * 1024) {
                return false;
            }
            // set canvas to 1x1 pixel size and fill it with magenta color
            canvas.width = canvas.height = 1;
            context.fillStyle = '#FF00FF';
            context.fillRect(0, 0, 1, 1);
            // render the image with a negative offset to the left so that it would
            // fill the canvas pixel with the top right pixel of the image.
            context.drawImage(img, -width + 1, 0);
            // check color value to confirm image is covering edge pixel or not.
            // if color still magenta, the image is assumed to be sub sampled.
            try {
                const dat = context.getImageData(0, 0, 1, 1).data;
                return (dat[0] === 255) && (dat[1] === 0) && (dat[2] === 255);
            }
            catch (err) {
                // avoids cross origin exception for chrome when code runs without a server
                return false;
            }
        }
        Utils.detectSubsampling = detectSubsampling;
    })(Utils = SpriteSpin.Utils || (SpriteSpin.Utils = {}));
})(SpriteSpin || (SpriteSpin = {}));
var SpriteSpin;
(function (SpriteSpin) {
    var Utils;
    (function (Utils) {
        /**
         *
         */
        function getOuterSize(data) {
            const width = Math.floor(data.width || data.frameWidth || data.target.innerWidth());
            const height = Math.floor(data.height || data.frameHeight || data.target.innerHeight());
            return {
                aspect: width / height,
                height,
                width
            };
        }
        Utils.getOuterSize = getOuterSize;
        function getComputedSize(data) {
            const size = getOuterSize(data);
            if (typeof window.getComputedStyle !== 'function') {
                return size;
            }
            const style = window.getComputedStyle(data.target[0]);
            if (!style.width) {
                return size;
            }
            size.width = Math.floor(Number(style.width.replace('px', '')));
            size.height = Math.floor(size.width / size.aspect);
            return size;
        }
        Utils.getComputedSize = getComputedSize;
        /**
         *
         */
        function getInnerSize(data) {
            const width = Math.floor(data.frameWidth || data.width || data.target.innerWidth());
            const height = Math.floor(data.frameHeight || data.height || data.target.innerHeight());
            return {
                aspect: width / height,
                height,
                width
            };
        }
        Utils.getInnerSize = getInnerSize;
        /**
         *
         */
        function getInnerLayout(mode, inner, outer) {
            // get mode
            const isFit = mode === 'fit';
            const isFill = mode === 'fill';
            const isMatch = mode === 'stretch';
            // resulting layout
            const layout = {
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                overflow: 'hidden'
            };
            // no calculation here
            if (!mode || isMatch) {
                return layout;
            }
            // get size and aspect
            const aspectIsGreater = inner.aspect >= outer.aspect;
            // mode == original
            let width = inner.width;
            let height = inner.height;
            // keep aspect ratio but fit/fill into container
            if (isFit && aspectIsGreater || isFill && !aspectIsGreater) {
                width = outer.width;
                height = outer.width / inner.aspect;
            }
            if (isFill && aspectIsGreater || isFit && !aspectIsGreater) {
                height = outer.height;
                width = outer.height * inner.aspect;
            }
            // floor the numbers
            width = Math.floor(width);
            height = Math.floor(height);
            // position in center
            layout.width = width;
            layout.height = height;
            layout.top = Math.floor((outer.height - height) / 2);
            layout.left = Math.floor((outer.width - width) / 2);
            layout.right = layout.left;
            layout.bottom = layout.top;
            return layout;
        }
        Utils.getInnerLayout = getInnerLayout;
    })(Utils = SpriteSpin.Utils || (SpriteSpin.Utils = {}));
})(SpriteSpin || (SpriteSpin = {}));
var SpriteSpin;
(function (SpriteSpin) {
    var Utils;
    (function (Utils) {
        /**
         * Measures the image frames that are used in the given data object
         */
        function measure(images, options) {
            if (images.length === 1) {
                return [measureSheet(images[0], options)];
            }
            else {
                return measureFrames(images, options);
            }
        }
        Utils.measure = measure;
        function measureSheet(image, options) {
            const result = { id: 0, sprites: [] };
            measureImage(image, options, result);
            const frames = options.frames;
            const framesX = Number(options.framesX) || frames;
            const framesY = Math.ceil(frames / framesX);
            const frameWidth = Math.floor(result.width / framesX);
            const frameHeight = Math.floor(result.height / framesY);
            const divisor = result.isSubsampled ? 2 : 1;
            for (let i = 0; i < frames; i++) {
                const x = (i % framesX) * frameWidth;
                const y = Math.floor(i / framesX) * frameHeight;
                result.sprites.push({
                    id: i,
                    x: x, y: y,
                    width: frameWidth,
                    height: frameHeight,
                    sampledX: x / divisor,
                    sampledY: y / divisor,
                    sampledWidth: frameWidth / divisor,
                    sampledHeight: frameHeight / divisor
                });
            }
            return result;
        }
        function measureFrames(images, options) {
            const result = [];
            for (let id = 0; id < images.length; id++) {
                // TODO: optimize
                // dont measure images with same size twice
                const sheet = measureSheet(images[id], { frames: 1, framesX: 1, detectSubsampling: options.detectSubsampling });
                sheet.id = id;
                result.push(sheet);
            }
            return result;
        }
        function measureImage(image, options, result) {
            const size = Utils.naturalSize(image);
            result.isSubsampled = options.detectSubsampling && Utils.detectSubsampling(image, size.width, size.height);
            result.width = size.width;
            result.height = size.height;
            result.sampledWidth = size.width / (result.isSubsampled ? 2 : 1);
            result.sampledHeight = size.height / (result.isSubsampled ? 2 : 1);
            return result;
        }
        function findSpecs(metrics, frames, frame, lane) {
            let spriteId = lane * frames + frame;
            let sheetId = 0;
            let sprite = null;
            let sheet = null;
            while (true) {
                sheet = metrics[sheetId];
                if (!sheet) {
                    break;
                }
                if (spriteId >= sheet.sprites.length) {
                    spriteId -= sheet.sprites.length;
                    sheetId++;
                    continue;
                }
                sprite = sheet.sprites[spriteId];
                break;
            }
            return { sprite, sheet };
        }
        Utils.findSpecs = findSpecs;
    })(Utils = SpriteSpin.Utils || (SpriteSpin.Utils = {}));
})(SpriteSpin || (SpriteSpin = {}));
var SpriteSpin;
(function (SpriteSpin) {
    var Utils;
    (function (Utils) {
        let img;
        /**
         * gets the original width and height of an image element
         */
        function naturalSize(image) {
            // for browsers that support naturalWidth and naturalHeight properties
            if (image.naturalWidth) {
                return {
                    height: image.naturalHeight,
                    width: image.naturalWidth
                };
            }
            // browsers that do not support naturalWidth and naturalHeight properties have to fall back to the width and
            // height properties. However, the image might have a css style applied so width and height would return the
            // css size. To avoid thet create a new Image object that is free of css rules and grab width and height
            // properties
            //
            // assume that the src has already been downloaded, so no onload callback is needed.
            img = img || new Image();
            img.src = image.src;
            return {
                height: img.height,
                width: img.width
            };
        }
        Utils.naturalSize = naturalSize;
    })(Utils = SpriteSpin.Utils || (SpriteSpin.Utils = {}));
})(SpriteSpin || (SpriteSpin = {}));
var SpriteSpin;
(function (SpriteSpin) {
    var Utils;
    (function (Utils) {
        function indexOf(element, arr) {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] === element) {
                    return i;
                }
            }
        }
        function noop() {
            //
        }
        function preload(opts) {
            let src;
            const input = opts.source;
            src = typeof input === 'string' ? [input] : input;
            // const src: string[] =  ? [opts.source] : opts.source
            const images = [];
            const targetCount = (opts.preloadCount || src.length);
            const onInitiated = opts.initiated || noop;
            const onProgress = opts.progress || noop;
            const onComplete = opts.complete || noop;
            let count = 0;
            let completed = false;
            let firstLoaded = false;
            const tick = function () {
                count += 1;
                onProgress({
                    index: indexOf(this, images),
                    loaded: count,
                    total: src.length,
                    percent: Math.round((count / src.length) * 100)
                });
                firstLoaded = firstLoaded || (this === images[0]);
                if (firstLoaded && !completed && (count >= targetCount)) {
                    completed = true;
                    onComplete(images);
                }
            };
            for (const url of src) {
                const img = new Image();
                // push result
                images.push(img);
                // bind logic, dont care about abort/errors
                img.onload = img.onabort = img.onerror = tick;
                // begin load
                img.src = url;
            }
            onInitiated(images);
        }
        Utils.preload = preload;
    })(Utils = SpriteSpin.Utils || (SpriteSpin.Utils = {}));
})(SpriteSpin || (SpriteSpin = {}));
var SpriteSpin;
(function (SpriteSpin) {
    var Utils;
    (function (Utils) {
        function padNumber(num, length, pad) {
            num = String(num);
            while (num.length < length) {
                num = String(pad) + num;
            }
            return num;
        }
        /**
         * Generates an array of source strings
         * - path is a source string where the frame number of the file name is exposed as '{frame}'
         * - start indicates the first frame number
         * - end indicates the last frame number
         * - digits is the number of digits used in the file name for the frame number
         * @example
         *      sourceArray('http://example.com/image_{frame}.jpg, { frame: [1, 3], digits: 2 })
         *      // -> [ 'http://example.com/image_01.jpg', 'http://example.com/image_02.jpg', 'http://example.com/image_03.jpg' ]
         */
        function sourceArray(path, opts) {
            let fStart = 0, fEnd = 0, lStart = 0, lEnd = 0;
            const digits = opts.digits || 2;
            if (opts.frame) {
                fStart = opts.frame[0];
                fEnd = opts.frame[1];
            }
            if (opts.lane) {
                lStart = opts.lane[0];
                lEnd = opts.lane[1];
            }
            let i, j, temp;
            const result = [];
            for (i = lStart; i <= lEnd; i += 1) {
                for (j = fStart; j <= fEnd; j += 1) {
                    temp = path.replace('{lane}', padNumber(i, digits, 0));
                    temp = temp.replace('{frame}', padNumber(j, digits, 0));
                    result.push(temp);
                }
            }
            return result;
        }
        Utils.sourceArray = sourceArray;
    })(Utils = SpriteSpin.Utils || (SpriteSpin.Utils = {}));
})(SpriteSpin || (SpriteSpin = {}));
(function (SpriteSpin) {
    SpriteSpin.sourceArray = SpriteSpin.Utils.sourceArray;
})(SpriteSpin || (SpriteSpin = {}));
var SpriteSpin;
(function (SpriteSpin) {
    var Utils;
    (function (Utils) {
        function noop() {
            // noop
        }
        Utils.noop = noop;
        function wrapConsole(type) {
            return console && console[type] ? (...args) => console.log.apply(console, args) : noop;
        }
        Utils.log = wrapConsole('log');
        Utils.warn = wrapConsole('warn');
        Utils.error = wrapConsole('error');
        function toArray(value) {
            return Array.isArray(value) ? value : [value];
        }
        Utils.toArray = toArray;
        /**
         * clamps the given value by the given min and max values
         */
        function clamp(value, min, max) {
            return (value > max ? max : (value < min ? min : value));
        }
        Utils.clamp = clamp;
        /**
         *
         */
        function wrap(value, min, max, size) {
            while (value > max) {
                value -= size;
            }
            while (value < min) {
                value += size;
            }
            return value;
        }
        Utils.wrap = wrap;
        /**
         * prevents default action on the given event
         */
        function prevent(e) {
            e.preventDefault();
            return false;
        }
        Utils.prevent = prevent;
        /**
         * Binds on the given target and event the given function.
         * The SpriteSpin namespace is attached to the event name
         */
        function bind(target, event, func) {
            if (func) {
                target.bind(event + '.' + SpriteSpin.namespace, (e) => {
                    func.apply(target, [e, target.spritespin('data')]);
                });
            }
        }
        Utils.bind = bind;
        /**
         * Unbinds all SpriteSpin events from given target element
         */
        function unbind(target) {
            target.unbind('.' + SpriteSpin.namespace);
        }
        Utils.unbind = unbind;
        /**
         * Checks if given object is a function
         */
        function isFunction(fn) {
            return typeof fn === 'function';
        }
        Utils.isFunction = isFunction;
        function pixelRatio(context) {
            const devicePixelRatio = window.devicePixelRatio || 1;
            const backingStoreRatio = context.webkitBackingStorePixelRatio ||
                context.mozBackingStorePixelRatio ||
                context.msBackingStorePixelRatio ||
                context.oBackingStorePixelRatio ||
                context.backingStorePixelRatio || 1;
            return devicePixelRatio / backingStoreRatio;
        }
        Utils.pixelRatio = pixelRatio;
    })(Utils = SpriteSpin.Utils || (SpriteSpin.Utils = {}));
})(SpriteSpin || (SpriteSpin = {}));
// tslint:disable:object-literal-shorthand
// tslint:disable:only-arrow-functions
var SpriteSpin;
(function (SpriteSpin) {
    SpriteSpin.registerApi({
        // Gets a value indicating whether the animation is currently running.
        isPlaying: function () {
            return SpriteSpin.getAnimationState(this.data).handler != null;
        },
        // Gets a value indicating whether the animation looping is enabled.
        isLooping: function () {
            return this.data.loop;
        },
        // Starts/Stops the animation playback
        toggleAnimation: function () {
            if (this.isPlaying()) {
                this.stopAnimation();
            }
            else {
                this.startAnimation();
            }
        },
        // Stops animation playback
        stopAnimation: function () {
            this.data.animate = false;
            SpriteSpin.stopAnimation(this.data);
        },
        // Starts animation playback
        startAnimation: function () {
            this.data.animate = true;
            SpriteSpin.applyAnimation(this.data);
        },
        // Sets a value indicating whether the animation should be looped or not.
        // This might start the animation (if the 'animate' data attribute is set to true)
        loop: function (value) {
            this.data.loop = value;
            SpriteSpin.applyAnimation(this.data);
            return this;
        },
        // Gets the current frame number
        currentFrame: function () {
            return this.data.frame;
        },
        // Updates SpriteSpin to the specified frame.
        updateFrame: function (frame) {
            SpriteSpin.updateFrame(this.data, frame);
            return this;
        },
        // Skips the given number of frames
        skipFrames: function (step) {
            const data = this.data;
            SpriteSpin.updateFrame(data, data.frame + (data.reverse ? -step : +step));
            return this;
        },
        // Updates SpriteSpin so that the next frame is shown
        nextFrame: function () {
            return this.skipFrames(1);
        },
        // Updates SpriteSpin so that the previous frame is shown
        prevFrame: function () {
            return this.skipFrames(-1);
        },
        // Starts the animations that will play until the given frame number is reached
        // options:
        //   force [boolean] starts the animation, even if current frame is the target frame
        //   nearest [boolean] animates to the direction with minimum distance to the target frame
        playTo: function (frame, options) {
            const data = this.data;
            options = options || {};
            if (!options.force && data.frame === frame) {
                return;
            }
            if (options.nearest) {
                // distance to the target frame
                const a = frame - data.frame;
                // distance to last frame and the to target frame
                const b = frame > data.frame ? a - data.frames : a + data.frames;
                // minimum distance
                const c = Math.abs(a) < Math.abs(b) ? a : b;
                data.reverse = c < 0;
            }
            data.animate = true;
            data.loop = false;
            data.stopFrame = frame;
            SpriteSpin.applyAnimation(data);
            return this;
        }
    });
})(SpriteSpin || (SpriteSpin = {}));
// tslint:disable:only-arrow-functions
var SpriteSpin;
(function (SpriteSpin) {
    var Fullscreen;
    (function (Fullscreen) {
        function pick(target, names) {
            for (const name of names) {
                if (target[name] || name in target) {
                    return name;
                }
            }
            return names[0];
        }
        const browser = {
            requestFullscreen: pick(document.documentElement, [
                'requestFullscreen',
                'webkitRequestFullScreen',
                'mozRequestFullScreen',
                'msRequestFullscreen'
            ]),
            exitFullscreen: pick(document, [
                'exitFullscreen',
                'webkitExitFullscreen',
                'webkitCancelFullScreen',
                'mozCancelFullScreen',
                'msExitFullscreen'
            ]),
            fullscreenElement: pick(document, [
                'fullscreenElement',
                'webkitFullscreenElement',
                'webkitCurrentFullScreenElement',
                'mozFullScreenElement',
                'msFullscreenElement'
            ]),
            fullscreenEnabled: pick(document, [
                'fullscreenEnabled',
                'webkitFullscreenEnabled',
                'mozFullScreenEnabled',
                'msFullscreenEnabled'
            ]),
            fullscreenchange: pick(document, [
                'onfullscreenchange',
                'onwebkitfullscreenchange',
                'onmozfullscreenchange',
                'onMSFullscreenChange'
            ]).replace(/^on/, ''),
            fullscreenerror: pick(document, [
                'onfullscreenerror',
                'onwebkitfullscreenerror',
                'onmozfullscreenerror',
                'onMSFullscreenError'
            ]).replace(/^on/, '')
        };
        const changeEvent = browser.fullscreenchange + '.' + SpriteSpin.namespace + '-fullscreen';
        function unbindChangeEvent() {
            SpriteSpin.$(document).unbind(changeEvent);
        }
        function bindChangeEvent(callback) {
            unbindChangeEvent();
            SpriteSpin.$(document).bind(changeEvent, callback);
        }
        const orientationEvent = 'orientationchange.' + SpriteSpin.namespace + '-fullscreen';
        function unbindOrientationEvent() {
            SpriteSpin.$(window).unbind(orientationEvent);
        }
        function bindOrientationEvent(callback) {
            unbindOrientationEvent();
            SpriteSpin.$(window).bind(orientationEvent, callback);
        }
        function requestFullscreenNative(e) {
            e = e || document.documentElement;
            e[browser.requestFullscreen]();
        }
        function exitFullscreen() {
            return document[browser.exitFullscreen]();
        }
        Fullscreen.exitFullscreen = exitFullscreen;
        function fullscreenEnabled() {
            return document[browser.fullscreenEnabled];
        }
        Fullscreen.fullscreenEnabled = fullscreenEnabled;
        function fullscreenElement() {
            return document[browser.fullscreenElement];
        }
        Fullscreen.fullscreenElement = fullscreenElement;
        function isFullscreen() {
            return !!fullscreenElement();
        }
        Fullscreen.isFullscreen = isFullscreen;
        function toggleFullscreen(data, opts) {
            if (isFullscreen()) {
                this.apiRequestFullscreen(opts);
            }
            else {
                this.exitFullscreen();
            }
        }
        Fullscreen.toggleFullscreen = toggleFullscreen;
        function requestFullscreen(data, opts) {
            opts = opts || {};
            const oWidth = data.width;
            const oHeight = data.height;
            const oSource = data.source;
            const oSize = data.sizeMode;
            const oResponsive = data.responsive;
            const enter = () => {
                data.width = window.screen.width;
                data.height = window.screen.height;
                data.source = (opts.source || oSource);
                data.sizeMode = opts.sizeMode || 'fit';
                data.responsive = false;
                SpriteSpin.boot(data);
            };
            const exit = () => {
                data.width = oWidth;
                data.height = oHeight;
                data.source = oSource;
                data.sizeMode = oSize;
                data.responsive = oResponsive;
                SpriteSpin.boot(data);
            };
            bindChangeEvent(() => {
                if (isFullscreen()) {
                    enter();
                    bindOrientationEvent(enter);
                }
                else {
                    unbindChangeEvent();
                    unbindOrientationEvent();
                    exit();
                }
            });
            requestFullscreenNative(data.target[0]);
        }
        Fullscreen.requestFullscreen = requestFullscreen;
        SpriteSpin.registerApi({
            fullscreenEnabled,
            fullscreenElement,
            exitFullscreen,
            toggleFullscreen: function (opts) {
                toggleFullscreen(this.data, opts);
            },
            requestFullscreen: function (opts) {
                requestFullscreen(this.data, opts);
            }
        });
    })(Fullscreen = SpriteSpin.Fullscreen || (SpriteSpin.Fullscreen = {}));
})(SpriteSpin || (SpriteSpin = {}));
((SpriteSpin) => {
    const NAME = 'click';
    function click(e, data) {
        if (data.loading || !data.stage.is(':visible')) {
            return;
        }
        SpriteSpin.updateInput(e, data);
        const input = SpriteSpin.getInputState(data);
        let half, pos;
        const target = data.target, offset = target.offset();
        if (data.orientation === 'horizontal') {
            half = target.innerWidth() / 2;
            pos = input.currentX - offset.left;
        }
        else {
            half = target.innerHeight() / 2;
            pos = input.currentY - offset.top;
        }
        SpriteSpin.updateFrame(data, data.frame + (pos > half ? 1 : -1));
    }
    SpriteSpin.registerPlugin(NAME, {
        name: NAME,
        mouseup: click,
        touchend: click
    });
})(SpriteSpin);
((SpriteSpin) => {
    const NAME = 'drag';
    function getState(data) {
        return SpriteSpin.getPluginState(data, NAME);
    }
    function getAxis(data) {
        if (typeof data.orientation === 'number') {
            return data.orientation * Math.PI / 180;
        }
        if (data.orientation === 'horizontal') {
            return 0;
        }
        return Math.PI / 2;
    }
    function dragStart(e, data) {
        const state = getState(data);
        if (data.loading || SpriteSpin.is(data, 'dragging') || !data.stage.is(':visible')) {
            return;
        }
        state.frame = data.frame || 0;
        state.lane = data.lane || 0;
        SpriteSpin.flag(data, 'dragging', true);
        SpriteSpin.updateInput(e, data);
    }
    function dragEnd(e, data) {
        if (SpriteSpin.is(data, 'dragging')) {
            SpriteSpin.flag(data, 'dragging', false);
            SpriteSpin.resetInput(data);
        }
    }
    function drag(e, data) {
        const state = getState(data);
        const input = SpriteSpin.getInputState(data);
        if (!SpriteSpin.is(data, 'dragging')) {
            return;
        }
        SpriteSpin.updateInput(e, data);
        const rad = getAxis(data);
        const sn = Math.sin(rad);
        const cs = Math.cos(rad);
        const x = ((input.nddX * cs - input.nddY * sn) * data.sense) || 0;
        const y = ((input.nddX * sn + input.nddY * cs) * (data.senseLane || data.sense)) || 0;
        // accumulate
        state.frame += data.frames * x;
        state.lane += data.lanes * y;
        // update spritespin
        const oldFrame = data.frame;
        const oldLane = data.lane;
        SpriteSpin.updateFrame(data, Math.floor(state.frame), Math.floor(state.lane));
        SpriteSpin.stopAnimation(data);
        if (/^touch.*/.test(e.name) && (oldFrame !== data.frame || oldLane !== data.lane)) {
            // prevent touch scroll
            e.preventDefault();
            // stop dragging if the drag distance exceeds the scroll threshold.
            if (data.scrollThreshold != null && (Math.abs(input.ddX) + Math.abs(input.ddY)) > data.scrollThreshold) {
                dragEnd(e, data);
            }
        }
    }
    function mousemove(e, data) {
        dragStart(e, data);
        drag(e, data);
    }
    SpriteSpin.registerPlugin('drag', {
        name: 'drag',
        mousedown: dragStart,
        mousemove: drag,
        mouseup: dragEnd,
        documentmousemove: drag,
        documentmouseup: dragEnd,
        touchstart: dragStart,
        touchmove: drag,
        touchend: dragEnd,
        touchcancel: dragEnd
    });
    SpriteSpin.registerPlugin('move', {
        name: 'move',
        mousemove: mousemove,
        mouseleave: dragEnd,
        touchstart: dragStart,
        touchmove: drag,
        touchend: dragEnd,
        touchcancel: dragEnd
    });
})(SpriteSpin);
((SpriteSpin) => {
    const NAME = 'hold';
    function getState(data) {
        return SpriteSpin.getPluginState(data, NAME);
    }
    function rememberOptions(data) {
        const state = getState(data);
        state.frameTime = data.frameTime;
        state.animate = data.animate;
        state.reverse = data.reverse;
    }
    function restoreOptions(data) {
        const state = getState(data);
        data.frameTime = state.frameTime;
        data.animate = state.animate;
        data.reverse = state.reverse;
    }
    function start(e, data) {
        if (SpriteSpin.is(data, 'loading') || SpriteSpin.is(data, 'dragging') || !data.stage.is(':visible')) {
            return;
        }
        rememberOptions(data);
        SpriteSpin.updateInput(e, data);
        SpriteSpin.flag(data, 'dragging', true);
        data.animate = true;
        SpriteSpin.applyAnimation(data);
    }
    function stop(e, data) {
        SpriteSpin.flag(data, 'dragging', false);
        SpriteSpin.resetInput(data);
        SpriteSpin.stopAnimation(data);
        restoreOptions(data);
        SpriteSpin.applyAnimation(data);
    }
    function update(e, data) {
        if (!SpriteSpin.is(data, 'dragging')) {
            return;
        }
        SpriteSpin.updateInput(e, data);
        const input = SpriteSpin.getInputState(data);
        let half, delta;
        const target = data.target, offset = target.offset();
        if (data.orientation === 'horizontal') {
            half = target.innerWidth() / 2;
            delta = (input.currentX - offset.left - half) / half;
        }
        else {
            half = (data.height / 2);
            delta = (input.currentY - offset.top - half) / half;
        }
        data.reverse = delta < 0;
        delta = delta < 0 ? -delta : delta;
        data.frameTime = 80 * (1 - delta) + 20;
        if (((data.orientation === 'horizontal') && (input.dX < input.dY)) ||
            ((data.orientation === 'vertical') && (input.dX < input.dY))) {
            e.preventDefault();
        }
    }
    function onFrame(e, data) {
        data.animate = true;
        SpriteSpin.applyAnimation(data);
    }
    SpriteSpin.registerPlugin(NAME, {
        name: NAME,
        mousedown: start,
        mousemove: update,
        mouseup: stop,
        mouseleave: stop,
        touchstart: start,
        touchmove: update,
        touchend: stop,
        touchcancel: stop,
        onFrame: onFrame
    });
})(SpriteSpin);
((SpriteSpin) => {
    const NAME = 'swipe';
    function getState(data) {
        return SpriteSpin.getPluginState(data, NAME);
    }
    function getOption(data, name, fallback) {
        return data[name] || fallback;
    }
    function init(e, data) {
        const state = getState(data);
        state.fling = getOption(data, 'swipeFling', 10);
        state.snap = getOption(data, 'swipeSnap', 0.50);
    }
    function start(e, data) {
        if (!data.loading && !SpriteSpin.is(data, 'dragging')) {
            SpriteSpin.updateInput(e, data);
            SpriteSpin.flag(data, 'dragging', true);
        }
    }
    function update(e, data) {
        if (!SpriteSpin.is(data, 'dragging')) {
            return;
        }
        SpriteSpin.updateInput(e, data);
        const frame = data.frame;
        const lane = data.lane;
        SpriteSpin.updateFrame(data, frame, lane);
    }
    function end(e, data) {
        if (!SpriteSpin.is(data, 'dragging')) {
            return;
        }
        SpriteSpin.flag(data, 'dragging', false);
        const state = getState(data);
        const input = SpriteSpin.getInputState(data);
        let frame = data.frame;
        const lane = data.lane;
        const snap = state.snap;
        const fling = state.fling;
        let dS, dF;
        if (data.orientation === 'horizontal') {
            dS = input.ndX;
            dF = input.ddX;
        }
        else {
            dS = input.ndY;
            dF = input.ddY;
        }
        if (dS >= snap || dF >= fling) {
            frame = data.frame - 1;
        }
        else if (dS <= -snap || dF <= -fling) {
            frame = data.frame + 1;
        }
        SpriteSpin.resetInput(data);
        SpriteSpin.updateFrame(data, frame, lane);
        SpriteSpin.stopAnimation(data);
    }
    SpriteSpin.registerPlugin(NAME, {
        name: NAME,
        onLoad: init,
        mousedown: start,
        mousemove: update,
        mouseup: end,
        mouseleave: end,
        touchstart: start,
        touchmove: update,
        touchend: end,
        touchcancel: end
    });
})(SpriteSpin);
((SpriteSpin) => {
    const $ = SpriteSpin.$;
    const floor = Math.floor;
    const NAME = '360';
    function onLoad(e, data) {
        data.stage.find('.spritespin-frames').detach();
        if (data.renderer === 'image') {
            $(data.images).addClass('spritespin-frames').appendTo(data.stage);
        }
    }
    function onDraw(e, data) {
        const specs = SpriteSpin.Utils.findSpecs(data.metrics, data.frames, data.frame, data.lane);
        const sheet = specs.sheet;
        const sprite = specs.sprite;
        if (!sheet || !sprite) {
            return;
        }
        const src = data.source[sheet.id];
        const image = data.images[sheet.id];
        if (data.renderer === 'canvas') {
            data.canvas.show();
            const w = data.canvas[0].width / data.canvasRatio;
            const h = data.canvas[0].height / data.canvasRatio;
            data.context.clearRect(0, 0, w, h);
            data.context.drawImage(image, sprite.sampledX, sprite.sampledY, sprite.sampledWidth, sprite.sampledHeight, 0, 0, w, h);
            return;
        }
        const scaleX = sprite.sampledWidth / data.stage.innerWidth();
        const scaleY = sprite.sampledHeight / data.stage.innerHeight();
        const top = Math.floor(-sprite.sampledX * scaleY);
        const left = Math.floor(-sprite.sampledY * scaleX);
        const width = Math.floor(sheet.sampledWidth * scaleX);
        const height = Math.floor(sheet.sampledHeight * scaleY);
        if (data.renderer === 'background') {
            data.stage.css({
                'background-image': `url('${src}')`,
                'background-position': `${left}px ${top}px`,
                'background-repeat': 'no-repeat',
                // set custom background size to enable responsive rendering
                '-webkit-background-size': `${width}px ${height}px`,
                '-moz-background-size': `${width}px ${height}px`,
                '-o-background-size': `${width}px ${height}px`,
                'background-size': `${width}px ${height}px` /* Chrome, Firefox 4+, IE 9+, Opera, Safari 5+ */
            });
            return;
        }
        $(data.images).hide();
        $(image).show().css({
            position: 'absolute',
            top: top,
            left: left,
            'max-width': 'initial',
            width: width,
            height: height
        });
    }
    SpriteSpin.registerPlugin(NAME, {
        name: NAME,
        onLoad,
        onDraw
    });
})(SpriteSpin);
((SpriteSpin) => {
    const NAME = 'blur';
    function getState(data) {
        return SpriteSpin.getPluginState(data, NAME);
    }
    function getOption(data, name, fallback) {
        return data[name] || fallback;
    }
    function init(e, data) {
        const state = getState(data);
        state.canvas = state.canvas || SpriteSpin.$("<canvas class='blur-layer'></canvas>");
        state.context = state.context || state.canvas[0].getContext('2d');
        state.steps = state.steps || [];
        state.fadeTime = Math.max(getOption(data, 'blurFadeTime', 200), 1);
        state.frameTime = Math.max(getOption(data, 'blurFrameTime', data.frameTime), 16);
        state.trackTime = null;
        state.cssBlur = !!getOption(data, 'blurCss', data.frameTime);
        const inner = SpriteSpin.Utils.getInnerSize(data);
        const outer = data.responsive ? SpriteSpin.Utils.getComputedSize(data) : SpriteSpin.Utils.getOuterSize(data);
        const css = SpriteSpin.Utils.getInnerLayout(data.sizeMode, inner, outer);
        state.canvas[0].width = data.width * data.canvasRatio;
        state.canvas[0].height = data.height * data.canvasRatio;
        state.canvas.css(css).show();
        state.context.scale(data.canvasRatio, data.canvasRatio);
        data.target.append(state.canvas);
    }
    function onFrame(e, data) {
        const state = getState(data);
        trackFrame(data);
        if (state.timeout == null) {
            loop(data);
        }
    }
    function trackFrame(data) {
        const state = getState(data);
        const ani = SpriteSpin.getAnimationState(data);
        // distance between frames
        let d = Math.abs(data.frame - ani.lastFrame);
        // shortest distance
        d = d >= data.frames / 2 ? data.frames - d : d;
        state.steps.unshift({
            frame: data.frame,
            lane: data.lane,
            live: 1,
            step: state.frameTime / state.fadeTime,
            d: d,
            alpha: 0
        });
    }
    const toRemove = [];
    function removeOldFrames(frames) {
        toRemove.length = 0;
        for (let i = 0; i < frames.length; i += 1) {
            if (frames[i].alpha <= 0) {
                toRemove.push(i);
            }
        }
        for (const item of toRemove) {
            frames.splice(item, 1);
        }
    }
    function loop(data) {
        const state = getState(data);
        state.timeout = window.setTimeout(() => { tick(data); }, state.frameTime);
    }
    function killLoop(data) {
        const state = getState(data);
        window.clearTimeout(state.timeout);
        state.timeout = null;
    }
    function applyCssBlur(canvas, d) {
        const amount = Math.min(Math.max((d / 2) - 4, 0), 1.5);
        const blur = `blur(${amount}px)`;
        canvas.css({
            '-webkit-filter': blur,
            filter: blur
        });
    }
    function drawFrame(data, state, step) {
        if (step.alpha <= 0) {
            return;
        }
        const specs = SpriteSpin.Utils.findSpecs(data.metrics, data.frames, data.frame, data.lane);
        const sheet = specs.sheet;
        const sprite = specs.sprite;
        if (!sheet || !sprite) {
            return;
        }
        const src = data.source[sheet.id];
        const image = data.images[sheet.id];
        if (image.complete === false) {
            return;
        }
        state.canvas.show();
        const w = state.canvas[0].width / data.canvasRatio;
        const h = state.canvas[0].height / data.canvasRatio;
        state.context.clearRect(0, 0, w, h);
        state.context.drawImage(image, sprite.sampledX, sprite.sampledY, sprite.sampledWidth, sprite.sampledHeight, 0, 0, w, h);
    }
    function tick(data) {
        const state = getState(data);
        killLoop(data);
        if (!state.context) {
            return;
        }
        let d = 0;
        state.context.clearRect(0, 0, data.width, data.height);
        for (const step of state.steps) {
            step.live = Math.max(step.live - step.step, 0);
            step.alpha = Math.max(step.live - 0.25, 0);
            drawFrame(data, state, step);
            d += step.alpha + step.d;
        }
        if (state.cssBlur) {
            applyCssBlur(state.canvas, d);
        }
        removeOldFrames(state.steps);
        if (state.steps.length) {
            loop(data);
        }
    }
    SpriteSpin.registerPlugin(NAME, {
        name: NAME,
        onLoad: init,
        onFrameChanged: onFrame
    });
})(SpriteSpin);
((SpriteSpin) => {
    const max = Math.max;
    const min = Math.min;
    const NAME = 'ease';
    function getState(data) {
        return SpriteSpin.getPluginState(data, NAME);
    }
    function getOption(data, name, fallback) {
        return data[name] || fallback;
    }
    function init(e, data) {
        const state = getState(data);
        state.maxSamples = max(getOption(data, 'easeMaxSamples', 5), 0);
        state.damping = max(min(getOption(data, 'easeDamping', 0.9), 0.999), 0);
        state.abortTime = max(getOption(data, 'easeAbortTime', 250), 16);
        state.updateTime = max(getOption(data, 'easeUpdateTime', data.frameTime), 16);
        state.samples = [];
        state.steps = [];
    }
    function update(e, data) {
        if (SpriteSpin.is(data, 'dragging')) {
            killLoop(data);
            sampleInput(data);
        }
    }
    function end(e, data) {
        const state = getState(data);
        const samples = state.samples;
        let last;
        let lanes = 0;
        let frames = 0;
        let time = 0;
        for (const sample of samples) {
            if (!last) {
                last = sample;
                continue;
            }
            const dt = sample.time - last.time;
            if (dt > state.abortTime) {
                lanes = frames = time = 0;
                return killLoop(data);
            }
            frames += sample.frame - last.frame;
            lanes += sample.lane - last.lane;
            time += dt;
            last = sample;
        }
        samples.length = 0;
        if (!time) {
            return;
        }
        state.lane = data.lane;
        state.lanes = 0;
        state.laneStep = lanes / time * state.updateTime;
        state.frame = data.frame;
        state.frames = 0;
        state.frameStep = frames / time * state.updateTime;
        loop(data);
    }
    function sampleInput(data) {
        const state = getState(data);
        // add a new sample
        state.samples.push({
            time: new Date().getTime(),
            frame: data.frame,
            lane: data.lane
        });
        // drop old samples
        while (state.samples.length > state.maxSamples) {
            state.samples.shift();
        }
    }
    function killLoop(data) {
        const state = getState(data);
        if (state.handler != null) {
            window.clearTimeout(state.handler);
            state.handler = null;
        }
    }
    function loop(data) {
        const state = getState(data);
        state.handler = window.setTimeout(() => { tick(data); }, state.updateTime);
    }
    function tick(data) {
        const state = getState(data);
        state.lanes += state.laneStep;
        state.frames += state.frameStep;
        state.laneStep *= state.damping;
        state.frameStep *= state.damping;
        const frame = Math.floor(state.frame + state.frames);
        const lane = Math.floor(state.lane + state.lanes);
        SpriteSpin.updateFrame(data, frame, lane);
        if (SpriteSpin.is(data, 'dragging')) {
            killLoop(data);
        }
        else if (Math.abs(state.frameStep) > 0.005 || Math.abs(state.laneStep) > 0.005) {
            loop(data);
        }
        else {
            killLoop(data);
        }
    }
    SpriteSpin.registerPlugin(NAME, {
        name: NAME,
        onLoad: init,
        mousemove: update,
        mouseup: end,
        mouseleave: end,
        touchmove: update,
        touchend: end,
        touchcancel: end
    });
})(SpriteSpin);
((SpriteSpin) => {
    const NAME = 'gallery';
    function getState(data) {
        return SpriteSpin.getPluginState(data, NAME);
    }
    function getOption(data, name, fallback) {
        return data[name] || fallback;
    }
    function load(e, data) {
        const state = getState(data);
        state.images = [];
        state.offsets = [];
        state.frame = data.frame;
        state.speed = getOption(data, 'gallerySpeed', 500);
        state.opacity = getOption(data, 'galleryOpacity', 0.25);
        state.stage = getOption(data, 'galleryStage', SpriteSpin.$('<div></div>'));
        state.stage.empty().addClass('gallery-stage').prependTo(data.stage);
        let size = 0;
        for (const image of data.images) {
            const naturalSize = SpriteSpin.Utils.naturalSize(image);
            const scale = data.height / naturalSize.height;
            const img = $(image);
            state.stage.append(img);
            state.images.push(img);
            state.offsets.push(-size + (data.width - image.width * scale) / 2);
            size += data.width;
            img.css({
                'max-width': 'initial',
                opacity: state.opacity,
                width: data.width,
                height: data.height
            });
        }
        const innerSize = SpriteSpin.Utils.getInnerSize(data);
        const outerSize = data.responsive ? SpriteSpin.Utils.getComputedSize(data) : SpriteSpin.Utils.getOuterSize(data);
        const layout = SpriteSpin.Utils.getInnerLayout(data.sizeMode, innerSize, outerSize);
        state.stage.css(layout).css({ width: size, left: state.offsets[state.frame] });
        state.images[state.frame].animate({ opacity: 1 }, { duration: state.speed });
    }
    function draw(e, data) {
        const state = getState(data);
        const input = SpriteSpin.getInputState(data);
        const isDragging = SpriteSpin.is(data, 'dragging');
        if (state.frame !== data.frame && !isDragging) {
            state.stage.stop(true, false).animate({ left: state.offsets[data.frame] }, { duration: state.speed });
            state.images[state.frame].animate({ opacity: state.opacity }, { duration: state.speed });
            state.frame = data.frame;
            state.images[state.frame].animate({ opacity: 1 }, { duration: state.speed });
            state.stage.animate({ left: state.offsets[state.frame] });
        }
        else if (isDragging || state.dX !== input.dX) {
            state.dX = input.dX;
            state.ddX = input.ddX;
            state.stage.stop(true, true).css({ left: state.offsets[state.frame] + state.dX });
        }
    }
    SpriteSpin.registerPlugin(NAME, {
        name: NAME,
        onLoad: load,
        onDraw: draw
    });
})(SpriteSpin);
((SpriteSpin) => {
    const NAME = 'panorama';
    function getState(data) {
        return SpriteSpin.getPluginState(data, NAME);
    }
    function onLoad(e, data) {
        const state = getState(data);
        const sprite = data.metrics[0];
        if (!sprite) {
            return;
        }
        if (data.orientation === 'horizontal') {
            state.scale = data.target.innerHeight() / sprite.sampledHeight;
            data.frames = sprite.sampledWidth;
        }
        else {
            state.scale = data.target.innerWidth() / sprite.sampledWidth;
            data.frames = sprite.sampledHeight;
        }
        const width = Math.floor(sprite.sampledWidth * state.scale);
        const height = Math.floor(sprite.sampledHeight * state.scale);
        data.stage.css({
            'background-image': `url(${data.source[sprite.id]})`,
            'background-repeat': 'repeat-both',
            // set custom background size to enable responsive rendering
            '-webkit-background-size': `${width}px ${height}px`,
            '-moz-background-size': `${width}px ${height}px`,
            '-o-background-size': `${width}px ${height}px`,
            'background-size': `${width}px ${height}px` /* Chrome, Firefox 4+, IE 9+, Opera, Safari 5+ */
        });
    }
    function onDraw(e, data) {
        const state = getState(data);
        const px = data.orientation === 'horizontal' ? 1 : 0;
        const py = px ? 0 : 1;
        const offset = data.frame % data.frames;
        const left = Math.round(px * offset * state.scale);
        const top = Math.round(py * offset * state.scale);
        data.stage.css({ 'background-position': `${left}px ${top}px` });
    }
    SpriteSpin.registerPlugin(NAME, {
        name: NAME,
        onLoad: onLoad,
        onDraw: onDraw
    });
})(SpriteSpin);
((SpriteSpin) => {
    const NAME = 'zoom';
    function getState(data) {
        return SpriteSpin.getPluginState(data, NAME);
    }
    function getOption(data, name, fallback) {
        return data[name] || fallback;
    }
    function onInit(e, data) {
        const state = getState(data);
        state.source = getOption(data, 'zoomSource', data.source);
        state.doubleClickTime = getOption(data, 'zoomDoubleClickTime', 500);
        state.stage = state.stage || SpriteSpin.$("<div class='zoom-stage'></div>");
        state.stage.css({
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute'
        })
            .appendTo(data.target)
            .hide();
    }
    function onDestroy(e, data) {
        const state = getState(data);
        if (state.stage) {
            state.stage.remove();
            delete state.stage;
        }
    }
    function updateInput(e, data) {
        const state = getState(data);
        if (!state.stage.is(':visible')) {
            return;
        }
        e.preventDefault();
        // hack into drag/move module and disable dragging
        // prevents frame change during zoom mode
        SpriteSpin.flag(data, 'dragging', false);
        // grab touch/cursor position
        const cursor = SpriteSpin.Utils.getCursorPosition(e);
        // normalize cursor position into [0:1] range
        const x = cursor.x / data.width;
        const y = cursor.y / data.height;
        if (state.oldX == null) {
            state.oldX = x;
            state.oldY = y;
        }
        if (state.currentX == null) {
            state.currentX = x;
            state.currentY = y;
        }
        // calculate move delta since last frame and remember current position
        let dx = x - state.oldX;
        let dy = y - state.oldY;
        state.oldX = x;
        state.oldY = y;
        // invert drag direction for touch events to enable 'natural' scrolling
        if (e.type.match(/touch/)) {
            dx = -dx;
            dy = -dy;
        }
        // accumulate display coordinates
        state.currentX = SpriteSpin.Utils.clamp(state.currentX + dx, 0, 1);
        state.currentY = SpriteSpin.Utils.clamp(state.currentY + dy, 0, 1);
        SpriteSpin.updateFrame(data, data.frame, data.lane);
    }
    function onClick(e, data) {
        e.preventDefault();
        const state = getState(data);
        // simulate double click
        const clickTime = new Date().getTime();
        if (!state.clickTime) {
            // on first click
            state.clickTime = clickTime;
            return;
        }
        // on second click
        const timeDelta = clickTime - state.clickTime;
        if (timeDelta > state.doubleClickTime) {
            // took too long, back to first click
            state.clickTime = clickTime;
            return;
        }
        // on valid double click
        state.clickTime = undefined;
        if (toggleZoom(data)) {
            updateInput(e, data);
        }
    }
    function onMove(e, data) {
        const state = getState(data);
        if (state.stage.is(':visible')) {
            updateInput(e, data);
        }
    }
    function onDraw(e, data) {
        const state = getState(data);
        // calculate the frame index
        const index = data.lane * data.frames + data.frame;
        // get the zoom image. Use original frames as fallback. This won't work for spritesheets
        const source = state.source[index];
        const spec = SpriteSpin.Utils.findSpecs(data.metrics, data.frames, data.frame, data.lane);
        // get display position
        let x = state.currentX;
        let y = state.currentY;
        // fallback to centered position
        if (x == null) {
            x = state.currentX = 0.5;
            y = state.currentY = 0.5;
        }
        if (source) {
            // scale up from [0:1] to [0:100] range
            x = Math.floor(x * 100);
            y = Math.floor(y * 100);
            // update background image and position
            state.stage.css({
                'background-repeat': 'no-repeat',
                'background-image': `url('${source}')`,
                'background-position': `${x}% ${y}%`
            });
        }
        else if (spec.sheet && spec.sprite) {
            const sprite = spec.sprite;
            const sheet = spec.sheet;
            const src = data.source[sheet.id];
            const left = -Math.floor(sprite.sampledX + x * (sprite.sampledWidth - data.width));
            const top = -Math.floor(sprite.sampledY + y * (sprite.sampledHeight - data.height));
            const width = sheet.sampledWidth;
            const height = sheet.sampledHeight;
            state.stage.css({
                'background-image': `url('${src}')`,
                'background-position': `${left}px ${top}px`,
                'background-repeat': 'no-repeat',
                // set custom background size to enable responsive rendering
                '-webkit-background-size': `${width}px ${height}px`,
                '-moz-background-size': `${width}px ${height}px`,
                '-o-background-size': `${width}px ${height}px`,
                'background-size': `${width}px ${height}px` /* Chrome, Firefox 4+, IE 9+, Opera, Safari 5+ */
            });
        }
    }
    function toggleZoom(data) {
        const state = getState(data);
        if (!state.stage) {
            SpriteSpin.$.error('zoom module is not initialized or is not available.');
            return false;
        }
        if (state.stage.is(':visible')) {
            state.stage.fadeOut();
            data.stage.fadeIn();
        }
        else {
            state.stage.fadeIn();
            data.stage.fadeOut();
            return true;
        }
        return false;
    }
    SpriteSpin.registerPlugin(NAME, {
        name: NAME,
        mousedown: onClick,
        touchstart: onClick,
        mousemove: onMove,
        touchmove: onMove,
        onInit: onInit,
        onDestroy: onDestroy,
        onDraw: onDraw
    });
    SpriteSpin.registerApi({
        toggleZoom: function () { toggleZoom(this.data); } // tslint:disable-line
    });
})(SpriteSpin);
//# sourceMappingURL=spritespin.js.map