"use strict";
var SpriteSpin;
(function (SpriteSpin) {
    var instanceCounter = 0;
    SpriteSpin.instances = {};
    function pushInstance(data) {
        instanceCounter += 1;
        data.id = String(instanceCounter);
        SpriteSpin.instances[data.id] = data;
    }
    function popInstance(data) {
        delete SpriteSpin.instances[data.id];
    }
    var lazyinit = function () {
        lazyinit = function () { };
        function eachInstance(cb) {
            for (var id in SpriteSpin.instances) {
                if (SpriteSpin.instances.hasOwnProperty(id)) {
                    cb(SpriteSpin.instances[id]);
                }
            }
        }
        function onEvent(eventName, e) {
            eachInstance(function (data) {
                for (var _i = 0, _a = data.plugins; _i < _a.length; _i++) {
                    var module_1 = _a[_i];
                    if (typeof module_1[eventName] === 'function') {
                        module_1[eventName].apply(data.target, [e, data]);
                    }
                }
            });
        }
        function onResize() {
            eachInstance(function (data) {
                if (data.responsive) {
                    boot(data);
                }
            });
        }
        var _loop_1 = function (eventName) {
            SpriteSpin.$(window.document).bind(eventName + '.' + SpriteSpin.namespace, function (e) {
                onEvent('document' + eventName, e);
            });
        };
        for (var _i = 0, eventNames_1 = SpriteSpin.eventNames; _i < eventNames_1.length; _i++) {
            var eventName = eventNames_1[_i];
            _loop_1(eventName);
        }
        var resizeTimeout = null;
        SpriteSpin.$(window).on('resize', function () {
            window.clearTimeout(resizeTimeout);
            resizeTimeout = window.setTimeout(onResize, 100);
        });
    };
    var plugins = {};
    function registerPlugin(name, plugin) {
        if (plugins[name]) {
            SpriteSpin.Utils.error("Plugin name \"" + name + "\" is already taken");
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
    var Api = (function () {
        function Api(data) {
            this.data = data;
        }
        return Api;
    }());
    SpriteSpin.Api = Api;
    function registerApi(methods) {
        var api = Api.prototype;
        for (var key in methods) {
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
        SpriteSpin.Utils.warn('"extendApi" is deprecated, use "registerApi" instead');
        registerApi(methods);
    }
    SpriteSpin.extendApi = extendApi;
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
        var state = getState(data, 'plugin');
        state[name] = state[name] || {};
        return state[name];
    }
    SpriteSpin.getPluginState = getPluginState;
    function is(data, flag) {
        return !!getState(data, 'flags')[flag];
    }
    SpriteSpin.is = is;
    function flag(data, flag, value) {
        getState(data, 'flags')[flag] = !!value;
    }
    SpriteSpin.flag = flag;
    function inputFromEvent(e) {
        var touches = e.touches;
        var source = e;
        if (e.touches === undefined && e.originalEvent !== undefined) {
            touches = e.originalEvent.touches;
        }
        if (touches !== undefined && touches.length > 0) {
            source = e.touches[0];
        }
        return {
            clientX: source.clientX || 0,
            clientY: source.clientY || 0
        };
    }
    function updateInput(e, data) {
        var input = inputFromEvent(e);
        var state = getInputState(data);
        state.oldX = state.currentX;
        state.oldY = state.currentY;
        state.currentX = input.clientX;
        state.currentY = input.clientY;
        if (state.oldX === undefined || state.oldY === undefined) {
            state.oldX = state.currentX;
            state.oldY = state.currentY;
        }
        if (state.startX === undefined || state.startY === undefined) {
            state.startX = state.currentX;
            state.startY = state.currentY;
            state.clickframe = data.frame;
            state.clicklane = data.lane;
        }
        state.dX = state.currentX - state.startX;
        state.dY = state.currentY - state.startY;
        state.ddX = state.currentX - state.oldX;
        state.ddY = state.currentY - state.oldY;
        state.ndX = state.dX / data.width;
        state.ndY = state.dY / data.height;
        state.nddX = state.ddX / data.width;
        state.nddY = state.ddY / data.height;
    }
    SpriteSpin.updateInput = updateInput;
    function resetInput(data) {
        var input = getInputState(data);
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
        data.lane = lane;
        if (data.wrapLane) {
            data.lane = SpriteSpin.Utils.wrap(data.lane, 0, data.lanes - 1, data.lanes);
        }
        else {
            data.lane = SpriteSpin.Utils.clamp(data.lane, 0, data.lanes - 1);
        }
    }
    function updateAnimationFrame(data) {
        data.frame += (data.reverse ? -1 : 1);
        data.frame = SpriteSpin.Utils.wrap(data.frame, 0, data.frames - 1, data.frames);
        if (!data.loop && (data.frame === data.stopFrame)) {
            stopAnimation(data);
        }
    }
    function updateInputFrame(data, frame) {
        data.frame = Number(frame);
        if (data.wrap) {
            data.frame = SpriteSpin.Utils.wrap(data.frame, 0, data.frames - 1, data.frames);
        }
        else {
            data.frame = SpriteSpin.Utils.clamp(data.frame, 0, data.frames - 1);
        }
    }
    function updateAnimation(data) {
        var state = getAnimationState(data);
        if (state.handler) {
            updateBefore(data);
            updateAnimationFrame(data);
            updateAfter(data);
        }
    }
    function updateBefore(data) {
        var state = getAnimationState(data);
        state.lastFrame = data.frame;
        state.lastLane = data.lane;
    }
    function updateAfter(data) {
        var state = getAnimationState(data);
        if (state.lastFrame !== data.frame || state.lastLane !== data.lane) {
            data.target.trigger('onFrameChanged', data);
        }
        data.target.trigger('onFrame', data);
        data.target.trigger('onDraw', data);
    }
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
    function stopAnimation(data) {
        data.animate = false;
        var animation = getAnimationState(data);
        if (animation.handler) {
            window.clearInterval(animation.handler);
            animation.handler = null;
        }
    }
    SpriteSpin.stopAnimation = stopAnimation;
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
        var state = getAnimationState(data);
        state.handler = (state.handler || window.setInterval((function () {
            updateAnimation(data);
        }), data.frameTime));
    }
    SpriteSpin.$ = (window['jQuery'] || window['Zepto'] || window['$']);
    SpriteSpin.namespace = 'spritespin';
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
    SpriteSpin.callbackNames = [
        'onInit',
        'onProgress',
        'onLoad',
        'onFrameChanged',
        'onFrame',
        'onDraw',
        'onComplete'
    ];
    SpriteSpin.eventsToPrevent = [
        'dragstart'
    ];
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
        onInit: undefined,
        onProgress: undefined,
        onLoad: undefined,
        onFrame: undefined,
        onDraw: undefined,
        responsive: undefined,
        plugins: [
            '360',
            'drag'
        ]
    };
    function applyPlugins(data) {
        for (var i = 0; i < data.plugins.length; i += 1) {
            var name_1 = data.plugins[i];
            if (typeof name_1 !== 'string') {
                continue;
            }
            var plugin = plugins[name_1];
            if (!plugin) {
                SpriteSpin.Utils.error('No plugin found with name ' + name_1);
                continue;
            }
            data.plugins[i] = plugin;
        }
    }
    SpriteSpin.applyPlugins = applyPlugins;
    function applyLayout(data) {
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
        var size = data.responsive ? SpriteSpin.Utils.getComputedSize(data) : SpriteSpin.Utils.getOuterSize(data);
        var layout = SpriteSpin.Utils.getInnerLayout(data.sizeMode, SpriteSpin.Utils.getInnerSize(data), size);
        data.target.css({
            width: size.width,
            height: size.height,
            position: 'relative',
            overflow: 'hidden'
        });
        data.stage.css(layout).hide();
        if (!data.canvas) {
            return;
        }
        data.canvas.css(layout).hide();
        data.context.scale(data.canvasRatio, data.canvasRatio);
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
    function applyEvents(data) {
        var target = data.target;
        SpriteSpin.Utils.unbind(target);
        for (var _i = 0, _a = SpriteSpin.eventsToPrevent; _i < _a.length; _i++) {
            var eName = _a[_i];
            SpriteSpin.Utils.bind(target, eName, SpriteSpin.Utils.prevent);
        }
        for (var _b = 0, _c = data.plugins; _b < _c.length; _b++) {
            var plugin = _c[_b];
            for (var _d = 0, _e = SpriteSpin.eventNames; _d < _e.length; _d++) {
                var eName = _e[_d];
                SpriteSpin.Utils.bind(target, eName, plugin[eName]);
            }
            for (var _f = 0, _g = SpriteSpin.callbackNames; _f < _g.length; _f++) {
                var eName = _g[_f];
                SpriteSpin.Utils.bind(target, eName, plugin[eName]);
            }
        }
        SpriteSpin.Utils.bind(target, 'onLoad', function (e, d) {
            applyAnimation(d);
        });
        for (var _h = 0, _j = SpriteSpin.callbackNames; _h < _j.length; _h++) {
            var eName = _j[_h];
            SpriteSpin.Utils.bind(target, eName, data[eName]);
        }
    }
    SpriteSpin.applyEvents = applyEvents;
    function applyMetrics(data) {
        if (!data.images) {
            data.metrics = [];
        }
        data.metrics = SpriteSpin.Utils.measure(data.images, data);
        var spec = SpriteSpin.Utils.findSpecs(data.metrics, data.frames, 0, 0);
        if (spec.sprite) {
            data.frameWidth = spec.sprite.width;
            data.frameHeight = spec.sprite.height;
        }
    }
    function boot(data) {
        applyPlugins(data);
        applyLayout(data);
        applyEvents(data);
        data.loading = true;
        data.target.addClass('loading').trigger('onInit', data);
        SpriteSpin.Utils.preload({
            source: data.source,
            preloadCount: data.preloadCount,
            progress: function (progress) {
                data.target.trigger('onProgress', [progress, data]);
            },
            complete: function (images) {
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
        var _this = this;
        var $this = options.target;
        var data = SpriteSpin.$.extend({}, SpriteSpin.defaults, options);
        data.source = data.source || [];
        data.plugins = data.plugins || [];
        $this.find('img').each(function () {
            if (!Array.isArray(data.source)) {
                data.source = [];
            }
            data.source.push(SpriteSpin.$(_this).attr('src'));
        });
        $this
            .empty()
            .addClass('spritespin-instance')
            .append("<div class='spritespin-stage'></div>");
        if (data.renderer === 'canvas') {
            var canvas = document.createElement('canvas');
            if (!!(canvas.getContext && canvas.getContext('2d'))) {
                data.canvas = SpriteSpin.$(canvas).addClass('spritespin-canvas');
                data.context = canvas.getContext('2d');
                $this.append(data.canvas);
                $this.addClass('with-canvas');
            }
            else {
                data.renderer = 'image';
            }
        }
        data.target = $this;
        data.stage = $this.find('.spritespin-stage');
        $this.data(SpriteSpin.namespace, data);
        pushInstance(data);
        return data;
    }
    function fixPlugins(data) {
        if (data['mods']) {
            SpriteSpin.Utils.warn('"mods" option is deprecated, use "plugins" instead');
            data.plugins = data['mods'];
        }
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
    function createOrUpdate(options) {
        lazyinit();
        var $this = options.target;
        var data = $this.data(SpriteSpin.namespace);
        if (!data) {
            data = instantiate(options);
        }
        else {
            SpriteSpin.$.extend(data, options);
        }
        data.source = SpriteSpin.Utils.toArray(data.source);
        fixPlugins(data);
        boot(data);
    }
    SpriteSpin.createOrUpdate = createOrUpdate;
    function destroy(data) {
        popInstance(data);
        stopAnimation(data);
        SpriteSpin.Utils.unbind(data.target);
        data.target.removeData(SpriteSpin.namespace);
    }
    SpriteSpin.destroy = destroy;
    function extension(obj, value) {
        var _this = this;
        if (obj === 'data') {
            return this.data(SpriteSpin.namespace);
        }
        if (obj === 'api') {
            var data = this.data(SpriteSpin.namespace);
            data.api = data.api || new SpriteSpin.Api(data);
            return data.api;
        }
        if (obj === 'destroy') {
            return SpriteSpin.$(this).each(function () {
                SpriteSpin.destroy(SpriteSpin.$(_this).data(SpriteSpin.namespace));
            });
        }
        if (arguments.length === 2 && typeof obj === 'string') {
            var tmp = {};
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
"use strict";
var SpriteSpin;
(function (SpriteSpin) {
    var Utils;
    (function (Utils) {
        function getCursorPosition(event) {
            var touches = event.touches;
            var source = event;
            if (event.touches === undefined && event.originalEvent !== undefined) {
                touches = event.originalEvent.touches;
            }
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
"use strict";
var SpriteSpin;
(function (SpriteSpin) {
    var Utils;
    (function (Utils) {
        var canvas;
        var context;
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
        function detectSubsampling(img, width, height) {
            if (!detectionContext()) {
                return false;
            }
            if (width * height <= 1024 * 1024) {
                return false;
            }
            canvas.width = canvas.height = 1;
            context.fillStyle = '#FF00FF';
            context.fillRect(0, 0, 1, 1);
            context.drawImage(img, -width + 1, 0);
            try {
                var dat = context.getImageData(0, 0, 1, 1).data;
                return (dat[0] === 255) && (dat[1] === 0) && (dat[2] === 255);
            }
            catch (err) {
                console.error(err.message, err.stack);
                return false;
            }
        }
        Utils.detectSubsampling = detectSubsampling;
    })(Utils = SpriteSpin.Utils || (SpriteSpin.Utils = {}));
})(SpriteSpin || (SpriteSpin = {}));
"use strict";
var SpriteSpin;
(function (SpriteSpin) {
    var Utils;
    (function (Utils) {
        function getOuterSize(data) {
            var width = Math.floor(data.width || data.frameWidth || data.target.innerWidth());
            var height = Math.floor(data.height || data.frameHeight || data.target.innerHeight());
            return {
                aspect: width / height,
                height: height,
                width: width
            };
        }
        Utils.getOuterSize = getOuterSize;
        function getComputedSize(data) {
            var size = getOuterSize(data);
            if (typeof window.getComputedStyle !== 'function') {
                return size;
            }
            var style = window.getComputedStyle(data.target[0]);
            if (!style.width) {
                return size;
            }
            size.width = Math.floor(Number(style.width.replace('px', '')));
            size.height = Math.floor(size.width / size.aspect);
            return size;
        }
        Utils.getComputedSize = getComputedSize;
        function getInnerSize(data) {
            var width = Math.floor(data.frameWidth || data.width || data.target.innerWidth());
            var height = Math.floor(data.frameHeight || data.height || data.target.innerHeight());
            return {
                aspect: width / height,
                height: height,
                width: width
            };
        }
        Utils.getInnerSize = getInnerSize;
        function getInnerLayout(mode, inner, outer) {
            var isFit = mode === 'fit';
            var isFill = mode === 'fill';
            var isMatch = mode === 'stretch';
            var layout = {
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                overflow: 'hidden'
            };
            if (!mode || isMatch) {
                return layout;
            }
            var aspectIsGreater = inner.aspect >= outer.aspect;
            var width = inner.width;
            var height = inner.height;
            if (isFit && aspectIsGreater || isFill && !aspectIsGreater) {
                width = outer.width;
                height = outer.width / inner.aspect;
            }
            if (isFill && aspectIsGreater || isFit && !aspectIsGreater) {
                height = outer.height;
                width = outer.height * inner.aspect;
            }
            width = Math.floor(width);
            height = Math.floor(height);
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
"use strict";
var SpriteSpin;
(function (SpriteSpin) {
    var Utils;
    (function (Utils) {
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
            var result = { id: 0, sprites: [] };
            measureImage(image, options, result);
            var frames = options.frames;
            var framesX = Number(options.framesX) || frames;
            var framesY = Math.ceil(frames / framesX);
            var frameWidth = Math.floor(result.width / framesX);
            var frameHeight = Math.floor(result.height / framesY);
            var divisor = result.isSubsampled ? 2 : 1;
            for (var i = 0; i < frames; i++) {
                var x = (i % framesX) * frameWidth;
                var y = Math.floor(i / framesX) * frameHeight;
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
            var result = [];
            for (var id = 0; id < images.length; id++) {
                var sheet = measureSheet(images[id], { frames: 1, framesX: 1, detectSubsampling: options.detectSubsampling });
                sheet.id = id;
                result.push(sheet);
            }
            return result;
        }
        function measureImage(image, options, result) {
            var size = Utils.naturalSize(image);
            result.isSubsampled = options.detectSubsampling && Utils.detectSubsampling(image, size.width, size.height);
            result.width = size.width;
            result.height = size.height;
            result.sampledWidth = size.width / (result.isSubsampled ? 2 : 1);
            result.sampledHeight = size.height / (result.isSubsampled ? 2 : 1);
            return result;
        }
        function findSpecs(metrics, frames, frame, lane) {
            var spriteId = lane * frames + frame;
            var sheetId = 0;
            var sprite = null;
            var sheet = null;
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
            return { sprite: sprite, sheet: sheet };
        }
        Utils.findSpecs = findSpecs;
    })(Utils = SpriteSpin.Utils || (SpriteSpin.Utils = {}));
})(SpriteSpin || (SpriteSpin = {}));
"use strict";
var SpriteSpin;
(function (SpriteSpin) {
    var Utils;
    (function (Utils) {
        var img;
        function naturalSize(image) {
            if (image.naturalWidth) {
                return {
                    height: image.naturalHeight,
                    width: image.naturalWidth
                };
            }
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
"use strict";
var SpriteSpin;
(function (SpriteSpin) {
    var Utils;
    (function (Utils) {
        function indexOf(element, arr) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] === element) {
                    return i;
                }
            }
        }
        function noop() {
        }
        function preload(opts) {
            var src;
            var input = opts.source;
            if (typeof input === 'string') {
                src = [input];
            }
            else {
                src = input;
            }
            var images = [];
            var targetCount = (opts.preloadCount || src.length);
            var onInitiated = opts.initiated || noop;
            var onProgress = opts.progress || noop;
            var onComplete = opts.complete || noop;
            var count = 0;
            var completed = false;
            var firstLoaded = false;
            var tick = function () {
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
            for (var i = 0; i < src.length; i += 1) {
                var img = new Image();
                images.push(img);
                img.onload = img.onabort = img.onerror = tick;
                img.src = src[i];
            }
            onInitiated(images);
        }
        Utils.preload = preload;
    })(Utils = SpriteSpin.Utils || (SpriteSpin.Utils = {}));
})(SpriteSpin || (SpriteSpin = {}));
"use strict";
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
        function sourceArray(path, opts) {
            var fStart = 0, fEnd = 0, lStart = 0, lEnd = 0;
            var digits = opts.digits || 2;
            if (opts.frame) {
                fStart = opts.frame[0];
                fEnd = opts.frame[1];
            }
            if (opts.lane) {
                lStart = opts.lane[0];
                lEnd = opts.lane[1];
            }
            var i, j, temp;
            var result = [];
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
"use strict";
var SpriteSpin;
(function (SpriteSpin) {
    var Utils;
    (function (Utils) {
        function noop() {
        }
        Utils.noop = noop;
        function wrapConsole(type) {
            return console && console[type] ? function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return console.log.apply(console, args);
            } : noop;
        }
        Utils.log = wrapConsole('log');
        Utils.warn = wrapConsole('warn');
        Utils.error = wrapConsole('error');
        function toArray(value) {
            return Array.isArray(value) ? value : [value];
        }
        Utils.toArray = toArray;
        function clamp(value, min, max) {
            return (value > max ? max : (value < min ? min : value));
        }
        Utils.clamp = clamp;
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
        function prevent(e) {
            e.preventDefault();
            return false;
        }
        Utils.prevent = prevent;
        function bind(target, event, func) {
            if (func) {
                target.bind(event + '.' + SpriteSpin.namespace, function (e) {
                    func.apply(target, [e, target.spritespin('data')]);
                });
            }
        }
        Utils.bind = bind;
        function unbind(target) {
            target.unbind('.' + SpriteSpin.namespace);
        }
        Utils.unbind = unbind;
        function isFunction(fn) {
            return typeof fn === 'function';
        }
        Utils.isFunction = isFunction;
        function pixelRatio(context) {
            var devicePixelRatio = window.devicePixelRatio || 1;
            var backingStoreRatio = context.webkitBackingStorePixelRatio ||
                context.mozBackingStorePixelRatio ||
                context.msBackingStorePixelRatio ||
                context.oBackingStorePixelRatio ||
                context.backingStorePixelRatio || 1;
            return devicePixelRatio / backingStoreRatio;
        }
        Utils.pixelRatio = pixelRatio;
    })(Utils = SpriteSpin.Utils || (SpriteSpin.Utils = {}));
})(SpriteSpin || (SpriteSpin = {}));
"use strict";
var SpriteSpin;
(function (SpriteSpin) {
    SpriteSpin.registerApi({
        isPlaying: function () {
            return this.data.animation !== null;
        },
        isLooping: function () {
            return this.data.loop;
        },
        toggleAnimation: function () {
            this.data.animate = !this.data.animate;
            SpriteSpin.applyAnimation(this.data);
        },
        stopAnimation: function () {
            this.data.animate = false;
            SpriteSpin.applyAnimation(this.data);
        },
        startAnimation: function () {
            this.data.animate = true;
            SpriteSpin.applyAnimation(this.data);
        },
        loop: function (value) {
            this.data.loop = value;
            SpriteSpin.applyAnimation(this.data);
            return this;
        },
        currentFrame: function () {
            return this.data.frame;
        },
        updateFrame: function (frame) {
            SpriteSpin.updateFrame(this.data, frame);
            return this;
        },
        skipFrames: function (step) {
            var data = this.data;
            SpriteSpin.updateFrame(data, data.frame + (data.reverse ? -step : +step));
            return this;
        },
        nextFrame: function () {
            return this.skipFrames(1);
        },
        prevFrame: function () {
            return this.skipFrames(-1);
        },
        playTo: function (frame, options) {
            var data = this.data;
            options = options || {};
            if (!options.force && data.frame === frame) {
                return;
            }
            if (options.nearest) {
                var a = frame - data.frame;
                var b = frame > data.frame ? a - data.frames : a + data.frames;
                var c = Math.abs(a) < Math.abs(b) ? a : b;
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
"use strict";
var SpriteSpin;
(function (SpriteSpin) {
    var Fullscreen;
    (function (Fullscreen) {
        function pick(target, names) {
            for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
                var name_2 = names_1[_i];
                if (target[name_2] || name_2 in target) {
                    return name_2;
                }
            }
            return names[0];
        }
        var browser = {
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
        var changeEvent = browser.fullscreenchange + '.' + SpriteSpin.namespace + '-fullscreen';
        function unbindChangeEvent() {
            SpriteSpin.$(document).unbind(changeEvent);
        }
        function bindChangeEvent(callback) {
            unbindChangeEvent();
            SpriteSpin.$(document).bind(changeEvent, callback);
        }
        var orientationEvent = 'orientationchange.' + SpriteSpin.namespace + '-fullscreen';
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
            var oWidth = data.width;
            var oHeight = data.height;
            var oSource = data.source;
            var oSize = data.sizeMode;
            var oResponsive = data.responsive;
            var enter = function () {
                data.width = window.screen.width;
                data.height = window.screen.height;
                data.source = (opts.source || oSource);
                data.sizeMode = opts.sizeMode || 'fit';
                data.responsive = false;
                SpriteSpin.boot(data);
            };
            var exit = function () {
                data.width = oWidth;
                data.height = oHeight;
                data.source = oSource;
                data.sizeMode = oSize;
                data.responsive = oResponsive;
                SpriteSpin.boot(data);
            };
            bindChangeEvent(function () {
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
            fullscreenEnabled: fullscreenEnabled,
            fullscreenElement: fullscreenElement,
            exitFullscreen: exitFullscreen,
            toggleFullscreen: function (opts) {
                toggleFullscreen(this.data, opts);
            },
            requestFullscreen: function (opts) {
                requestFullscreen(this.data, opts);
            }
        });
    })(Fullscreen = SpriteSpin.Fullscreen || (SpriteSpin.Fullscreen = {}));
})(SpriteSpin || (SpriteSpin = {}));
"use strict";
(function (SpriteSpin) {
    var NAME = 'click';
    function click(e, data) {
        if (data.loading || !data.stage.is(':visible')) {
            return;
        }
        SpriteSpin.updateInput(e, data);
        var input = SpriteSpin.getInputState(data);
        var half, pos;
        var target = data.target, offset = target.offset();
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
"use strict";
(function (SpriteSpin) {
    var NAME = 'drag';
    function getState(data) {
        return SpriteSpin.getPluginState(data, NAME);
    }
    function dragStart(e, data) {
        var state = getState(data);
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
        var drag = getState(data);
        var input = SpriteSpin.getInputState(data);
        if (!SpriteSpin.is(data, 'dragging')) {
            return;
        }
        SpriteSpin.updateInput(e, data);
        if ((Math.abs(input.ddX) + Math.abs(input.ddY)) > data.scrollThreshold) {
            SpriteSpin.flag(data, 'dragging', false);
            SpriteSpin.resetInput(data);
            return;
        }
        e.preventDefault();
        var angle = 0;
        if (typeof data.orientation === 'number') {
            angle = (Number(data.orientation) || 0) * Math.PI / 180;
        }
        else if (data.orientation === 'horizontal') {
            angle = 0;
        }
        else {
            angle = Math.PI / 2;
        }
        var sn = Math.sin(angle);
        var cs = Math.cos(angle);
        var x = ((input.nddX * cs - input.nddY * sn) * data.sense) || 0;
        var y = ((input.nddX * sn + input.nddY * cs) * (data.senseLane || data.sense)) || 0;
        drag.frame += data.frames * x;
        drag.lane += data.lanes * y;
        var frame = Math.floor(drag.frame);
        var lane = Math.floor(drag.lane);
        SpriteSpin.updateFrame(data, frame, lane);
        SpriteSpin.stopAnimation(data);
    }
    function mousemove(e, data) {
        dragStart(e, data);
        drag(e, data);
    }
    SpriteSpin.registerPlugin('drag', {
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
        mousemove: mousemove,
        mouseleave: dragEnd,
        touchstart: dragStart,
        touchmove: drag,
        touchend: dragEnd,
        touchcancel: dragEnd
    });
})(SpriteSpin);
"use strict";
(function (SpriteSpin) {
    var NAME = 'hold';
    function getState(data) {
        return SpriteSpin.getPluginState(data, NAME);
    }
    function start(e, data) {
        if (SpriteSpin.is(data, 'loading') || SpriteSpin.is(data, 'dragging') || !data.stage.is(':visible')) {
            return;
        }
        SpriteSpin.updateInput(e, data);
        SpriteSpin.flag(data, 'dragging', true);
        data.animate = true;
        SpriteSpin.applyAnimation(data);
    }
    function stop(e, data) {
        SpriteSpin.flag(data, 'dragging', false);
        SpriteSpin.resetInput(data);
        SpriteSpin.stopAnimation(data);
    }
    function update(e, data) {
        if (!SpriteSpin.is(data, 'dragging')) {
            return;
        }
        SpriteSpin.updateInput(e, data);
        var input = SpriteSpin.getInputState(data);
        var half, delta;
        var target = data.target, offset = target.offset();
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
    function onFrame() {
        SpriteSpin.$(this).spritespin('api').startAnimation();
    }
    SpriteSpin.registerPlugin(NAME, {
        namw: NAME,
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
"use strict";
(function (SpriteSpin) {
    var NAME = 'swipe';
    function getState(data) {
        return SpriteSpin.getPluginState(data, NAME);
    }
    function getOption(data, name, fallback) {
        return data[name] || fallback;
    }
    function init(e, data) {
        var state = getState(data);
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
        var frame = data.frame;
        var lane = data.lane;
        SpriteSpin.updateFrame(data, frame, lane);
    }
    function end(e, data) {
        if (!SpriteSpin.is(data, 'dragging')) {
            return;
        }
        SpriteSpin.flag(data, 'dragging', false);
        var state = getState(data);
        var input = SpriteSpin.getInputState(data);
        var frame = data.frame;
        var lane = data.lane;
        var snap = state.snap;
        var fling = state.fling;
        var dS, dF;
        if (data.orientation === 'horizontal') {
            dS = input.ndX;
            dF = input.ddX;
        }
        else {
            dS = input.ndY;
            dF = input.ddY;
        }
        if (dS > snap || dF > fling) {
            frame = data.frame - 1;
        }
        else if (dS < -snap || dF < -fling) {
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
"use strict";
(function (SpriteSpin) {
    var $ = SpriteSpin.$;
    var floor = Math.floor;
    var NAME = '360';
    function onLoad(e, data) {
        data.stage.find('.spritespin-frames').detach();
        if (data.renderer === 'image') {
            $(data.images).addClass('spritespin-frames').appendTo(data.stage);
        }
    }
    function onDraw(e, data) {
        var specs = SpriteSpin.Utils.findSpecs(data.metrics, data.frames, data.frame, data.lane);
        var sheet = specs.sheet;
        var sprite = specs.sprite;
        if (!sheet || !sprite) {
            return;
        }
        var src = data.source[sheet.id];
        var image = data.images[sheet.id];
        if (data.renderer === 'canvas') {
            data.canvas.show();
            var w = data.canvas[0].width / data.canvasRatio;
            var h = data.canvas[0].height / data.canvasRatio;
            data.context.clearRect(0, 0, w, h);
            data.context.drawImage(image, sprite.sampledX, sprite.sampledY, sprite.sampledWidth, sprite.sampledHeight, 0, 0, w, h);
            return;
        }
        var scaleX = sprite.sampledWidth / data.stage.innerWidth();
        var scaleY = sprite.sampledHeight / data.stage.innerHeight();
        var top = Math.floor(-sprite.sampledX * scaleY);
        var left = Math.floor(-sprite.sampledY * scaleX);
        var width = Math.floor(sheet.sampledWidth * scaleX);
        var height = Math.floor(sheet.sampledHeight * scaleY);
        if (data.renderer === 'background') {
            data.stage.css({
                'background-image': "url('" + src + "')",
                'background-position': left + "px " + top + "px",
                'background-repeat': 'no-repeat',
                '-webkit-background-size': width + "px " + height + "px",
                '-moz-background-size': width + "px " + height + "px",
                '-o-background-size': width + "px " + height + "px",
                'background-size': width + "px " + height + "px"
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
        onLoad: onLoad,
        onDraw: onDraw
    });
})(SpriteSpin);
"use strict";
(function (SpriteSpin) {
    var NAME = 'blur';
    function getState(data) {
        return SpriteSpin.getPluginState(data, NAME);
    }
    function getOption(data, name, fallback) {
        return data[name] || fallback;
    }
    function init(e, data) {
        var state = getState(data);
        state.canvas = state.canvas || SpriteSpin.$("<canvas class='blur-layer'></canvas>");
        state.context = state.context || state.canvas[0].getContext('2d');
        state.steps = state.steps || [];
        state.fadeTime = Math.max(getOption(data, 'blurFadeTime', 200), 1);
        state.frameTime = Math.max(getOption(data, 'blurFrameTime', data.frameTime), 16);
        state.trackTime = null;
        state.cssBlur = !!getOption(data, 'blurCss', data.frameTime);
        var inner = SpriteSpin.Utils.getInnerSize(data);
        var outer = data.responsive ? SpriteSpin.Utils.getComputedSize(data) : SpriteSpin.Utils.getOuterSize(data);
        var css = SpriteSpin.Utils.getInnerLayout(data.sizeMode, inner, outer);
        state.canvas[0].width = data.width * data.canvasRatio;
        state.canvas[0].height = data.height * data.canvasRatio;
        state.canvas.css(css).show();
        state.context.scale(data.canvasRatio, data.canvasRatio);
        data.target.append(state.canvas);
    }
    function onFrame(e, data) {
        var state = getState(data);
        trackFrame(data);
        if (state.timeout == null) {
            loop(data);
        }
    }
    function trackFrame(data) {
        var state = getState(data);
        var ani = SpriteSpin.getAnimationState(data);
        var d = Math.abs(data.frame - ani.lastFrame);
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
    var toRemove = [];
    function removeOldFrames(frames) {
        toRemove.length = 0;
        for (var i = 0; i < frames.length; i += 1) {
            if (frames[i].alpha <= 0) {
                toRemove.push(i);
            }
        }
        for (var _i = 0, toRemove_1 = toRemove; _i < toRemove_1.length; _i++) {
            var item = toRemove_1[_i];
            frames.splice(item, 1);
        }
    }
    function loop(data) {
        var state = getState(data);
        state.timeout = window.setTimeout(function () { tick(data); }, state.frameTime);
    }
    function killLoop(data) {
        var state = getState(data);
        window.clearTimeout(state.timeout);
        state.timeout = null;
    }
    function applyCssBlur(canvas, d) {
        var amount = Math.min(Math.max((d / 2) - 4, 0), 1.5);
        var blur = "blur(" + amount + "px)";
        canvas.css({
            '-webkit-filter': blur,
            filter: blur
        });
    }
    function drawFrame(data, state, step) {
        if (step.alpha <= 0) {
            return;
        }
        var specs = SpriteSpin.Utils.findSpecs(data.metrics, data.frames, data.frame, data.lane);
        var sheet = specs.sheet;
        var sprite = specs.sprite;
        if (!sheet || !sprite) {
            return;
        }
        var src = data.source[sheet.id];
        var image = data.images[sheet.id];
        if (image.complete === false) {
            return;
        }
        state.canvas.show();
        var w = state.canvas[0].width / data.canvasRatio;
        var h = state.canvas[0].height / data.canvasRatio;
        state.context.clearRect(0, 0, w, h);
        state.context.drawImage(image, sprite.sampledX, sprite.sampledY, sprite.sampledWidth, sprite.sampledHeight, 0, 0, w, h);
    }
    function tick(data) {
        var state = getState(data);
        killLoop(data);
        if (!state.context) {
            return;
        }
        var d = 0;
        state.context.clearRect(0, 0, data.width, data.height);
        for (var _i = 0, _a = state.steps; _i < _a.length; _i++) {
            var step = _a[_i];
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
"use strict";
(function (SpriteSpin) {
    var max = Math.max;
    var min = Math.min;
    var NAME = 'ease';
    function getState(data) {
        return SpriteSpin.getPluginState(data, NAME);
    }
    function getOption(data, name, fallback) {
        return data[name] || fallback;
    }
    function init(e, data) {
        var state = getState(data);
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
        var state = getState(data);
        var samples = state.samples;
        var last;
        var lanes = 0;
        var frames = 0;
        var time = 0;
        for (var _i = 0, samples_1 = samples; _i < samples_1.length; _i++) {
            var sample = samples_1[_i];
            if (!last) {
                last = sample;
                continue;
            }
            var dt = sample.time - last.time;
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
        var state = getState(data);
        state.samples.push({
            time: new Date().getTime(),
            frame: data.frame,
            lane: data.lane
        });
        while (state.samples.length > state.maxSamples) {
            state.samples.shift();
        }
    }
    function killLoop(data) {
        var state = getState(data);
        if (state.handler != null) {
            window.clearTimeout(state.handler);
            state.handler = null;
        }
    }
    function loop(data) {
        var state = getState(data);
        state.handler = window.setTimeout(function () { tick(data); }, state.updateTime);
    }
    function tick(data) {
        var state = getState(data);
        state.lanes += state.laneStep;
        state.frames += state.frameStep;
        state.laneStep *= state.damping;
        state.frameStep *= state.damping;
        var frame = Math.floor(state.frame + state.frames);
        var lane = Math.floor(state.lane + state.lanes);
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
"use strict";
(function (SpriteSpin) {
    var NAME = 'gallery';
    function getState(data) {
        return SpriteSpin.getPluginState(data, NAME);
    }
    function getOption(data, name, fallback) {
        return data[name] || fallback;
    }
    function load(e, data) {
        var state = getState(data);
        state.images = [];
        state.offsets = [];
        state.frame = data.frame;
        state.speed = getOption(data, 'gallerySpeed', 500);
        state.opacity = getOption(data, 'galleryOpacity', 0.25);
        state.stage = getOption(data, 'galleryStage', SpriteSpin.$('<div></div>'));
        state.stage.empty().addClass('gallery-stage').prependTo(data.stage);
        var size = 0;
        for (var _i = 0, _a = data.images; _i < _a.length; _i++) {
            var image = _a[_i];
            var naturalSize = SpriteSpin.Utils.naturalSize(image);
            var scale = data.height / naturalSize.height;
            var img = $(image);
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
        var innerSize = SpriteSpin.Utils.getInnerSize(data);
        var outerSize = data.responsive ? SpriteSpin.Utils.getComputedSize(data) : SpriteSpin.Utils.getOuterSize(data);
        var layout = SpriteSpin.Utils.getInnerLayout(data.sizeMode, innerSize, outerSize);
        state.stage.css(layout).css({ width: size, left: state.offsets[state.frame] });
        state.images[state.frame].animate({ opacity: 1 }, state.speed);
    }
    function draw(e, data) {
        var state = getState(data);
        var input = SpriteSpin.getInputState(data);
        var isDragging = SpriteSpin.is(data, 'dragging');
        if (state.frame !== data.frame && !isDragging) {
            state.stage.stop(true, false).animate({ left: state.offsets[data.frame] }, state.speed);
            state.images[state.frame].animate({ opacity: state.opacity }, state.speed);
            state.frame = data.frame;
            state.images[state.frame].animate({ opacity: 1 }, state.speed);
            state.stage.animate({ left: state.offsets[state.frame] });
        }
        else if (isDragging || state.dX !== input.dX) {
            state.dX = input.dX;
            state.ddX = input.ddX;
            state.stage.stop(true, true).animate({ left: state.offsets[state.frame] + state.dX });
        }
    }
    SpriteSpin.registerPlugin(NAME, {
        name: NAME,
        onLoad: load,
        onDraw: draw
    });
})(SpriteSpin);
"use strict";
(function (SpriteSpin) {
    var NAME = 'panorama';
    function getState(data) {
        return SpriteSpin.getPluginState(data, NAME);
    }
    function onLoad(e, data) {
        var state = getState(data);
        var sprite = data.metrics[0];
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
        var width = Math.floor(sprite.sampledWidth * state.scale);
        var height = Math.floor(sprite.sampledHeight * state.scale);
        data.stage.css({
            'background-image': "url('" + data.source[sprite.id] + "')",
            'background-repeat': 'repeat-both',
            '-webkit-background-size': width + "px " + height + "px",
            '-moz-background-size': width + "px " + height + "px",
            '-o-background-size': width + "px " + height + "px",
            'background-size': width + "px " + height + "px"
        });
    }
    function onDraw(e, data) {
        var state = getState(data);
        var px = data.orientation === 'horizontal' ? 1 : 0;
        var py = px ? 0 : 1;
        var offset = data.frame % data.frames;
        var left = px * offset * state.scale;
        var top = py * offset * state.scale;
        data.stage.css({ 'background-position': left + "px " + top + "px" });
    }
    SpriteSpin.registerPlugin(NAME, {
        name: NAME,
        onLoad: onLoad,
        onDraw: onDraw
    });
})(SpriteSpin);
"use strict";
(function (SpriteSpin) {
    var NAME = 'zoom';
    function getState(data) {
        return SpriteSpin.getPluginState(data, NAME);
    }
    function getOption(data, name, fallback) {
        return data[name] || fallback;
    }
    function onInit(e, data) {
        var state = getState(data);
        state.source = getOption(data, 'zoomSource', data.source);
        state.doubleClickTime = getOption(data, 'zoomDoubleClickTime', 500);
        state.stage = state.stage || SpriteSpin.$("<div class='spritezoom-stage'></div>");
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
        var state = getState(data);
        if (state.stage) {
            state.stage.remove();
            delete state.stage;
        }
    }
    function updateInput(e, data) {
        e.preventDefault();
        SpriteSpin.flag(data, 'dragging', false);
        var cursor = SpriteSpin.Utils.getCursorPosition(e);
        var x = cursor.x / data.width;
        var y = cursor.y / data.height;
        var state = getState(data);
        if (state.oldX == null) {
            state.oldX = x;
            state.oldY = y;
        }
        if (state.currentX == null || state.currentY == null) {
            state.currentX = x;
            state.currentY = y;
        }
        var dx = x - state.oldX;
        var dy = y - state.oldY;
        state.oldX = x;
        state.oldY = y;
        if (e.type.match(/touch/)) {
            dx = -dx;
            dy = -dy;
        }
        state.currentX = SpriteSpin.Utils.clamp(state.currentX + dx, 0, 1);
        state.currentY = SpriteSpin.Utils.clamp(state.currentY + dy, 0, 1);
        SpriteSpin.updateFrame(data, data.frame, data.lane);
    }
    function onClick(e, data) {
        e.preventDefault();
        var state = getState(data);
        var clickTime = new Date().getTime();
        if (!state.clickTime) {
            state.clickTime = clickTime;
            return;
        }
        var timeDelta = clickTime - state.clickTime;
        if (timeDelta > state.doubleClickTime) {
            state.clickTime = clickTime;
            return;
        }
        state.clickTime = undefined;
        if (toggleZoom(data)) {
            updateInput(e, data);
        }
    }
    function onMove(e, data) {
        var state = getState(data);
        if (state.stage.is(':visible')) {
            updateInput(e, data);
        }
    }
    function onDraw(e, data) {
        var state = getState(data);
        var index = data.lane * data.frames + data.frame;
        var source = state.source[index];
        var spec = SpriteSpin.Utils.findSpecs(data.metrics, data.frames, data.frame, data.lane);
        var x = state.currentX;
        var y = state.currentY;
        if (x == null || y == null) {
            x = state.currentX = 0.5;
            y = state.currentY = 0.5;
        }
        if (source) {
            x = Math.floor(x * 100);
            y = Math.floor(y * 100);
            state.stage.css({
                'background-repeat': 'no-repeat',
                'background-image': "url('" + source + "')",
                'background-position': x + "% " + y + "%"
            });
        }
        else if (spec.sheet && spec.sprite) {
            var sprite = spec.sprite;
            var sheet = spec.sheet;
            var src = data.source[sheet.id];
            var left = -Math.floor(sprite.sampledX + x * (sprite.sampledWidth - data.width));
            var top_1 = -Math.floor(sprite.sampledY + y * (sprite.sampledHeight - data.height));
            var width = sheet.sampledWidth;
            var height = sheet.sampledHeight;
            state.stage.css({
                'background-image': "url('" + src + "')",
                'background-position': left + "px " + top_1 + "px",
                'background-repeat': 'no-repeat',
                '-webkit-background-size': width + "px " + height + "px",
                '-moz-background-size': width + "px " + height + "px",
                '-o-background-size': width + "px " + height + "px",
                'background-size': width + "px " + height + "px"
            });
        }
    }
    function toggleZoom(data) {
        var state = getState(data);
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
        toggleZoom: function () { toggleZoom(this.data); }
    });
})(SpriteSpin);
//# sourceMappingURL=spritespin.js.map