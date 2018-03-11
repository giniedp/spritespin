/// <reference types="jquery" />
declare namespace SpriteSpin {
    const instances: {
        [key: string]: Instance;
    };
    /**
     * Registers a module implementation as an available extension to SpriteSpin.
     * Use this to add custom Rendering or Updating modules that can be addressed with the 'module' option.
     */
    function registerPlugin(name: any, plugin: any): any;
    function registerModule(name: any, plugin: any): void;
    /**
     *
     */
    class Api {
        data: Instance;
        constructor(data: Instance);
    }
    /**
     * Helper method that allows to extend the api with more methods.
     * Receives an object with named functions that are extensions to the API.
     */
    function registerApi(methods: {
        [key: string]: any;
    }): Api;
    function extendApi(methods: any): void;
    function getInputState(data: Instance): InputState;
    function getAnimationState(data: Instance): AnimationState;
    function getPluginState(data: Instance, name: string): any;
    function is(data: Instance, key: string): boolean;
    function flag(data: Instance, key: string, value: boolean): void;
    interface InputState {
        oldX: number;
        oldY: number;
        currentX: number;
        currentY: number;
        startX: number;
        startY: number;
        clickframe: number;
        clicklane: number;
        dX: number;
        dY: number;
        ddX: number;
        ddY: number;
        ndX: number;
        ndY: number;
        nddX: number;
        nddY: number;
    }
    /**
     * Updates the input state of the SpriteSpin data using the given mouse or touch event.
     */
    function updateInput(e: any, data: Instance): void;
    /**
     * Resets the input state of the SpriteSpin data.
     */
    function resetInput(data: Instance): void;
    interface AnimationState {
        lastFrame: number;
        lastLane: number;
        handler: number;
    }
    /**
     * Updates the frame number of the SpriteSpin data. Performs an auto increment if no frame number is given.
     */
    function updateFrame(data: Instance, frame: number, lane?: number): void;
    /**
     * Stops the running animation on given SpriteSpin data.
     */
    function stopAnimation(data: Instance): void;
    /**
     * Starts animation on given SpriteSpin data if animation is enabled.
     */
    function applyAnimation(data: Instance): void;
    type Callback = (e, data: Instance) => void;
    interface CallbackOptions {
        /**
         * Occurs when the plugin has been initialized, but before loading the source files.
         */
        onInit?: Callback;
        /**
         * Occurs when any source file has been loaded and the progress has changed.
         */
        onProgress?: Callback;
        /**
         * Occurs when all source files have been loaded and spritespin is ready to update and draw.
         */
        onLoad?: Callback;
        /**
         * Occurs when the frame number has been updated (e.g. during animation)
         */
        onFrame?: Callback;
        /**
         * Occurs when the frame number has changed.
         */
        onFrameChanged?: Callback;
        /**
         * Occurs when all update is complete and frame can be drawn
         */
        onDraw?: Callback;
        /**
         * Occurs when spritespin has been loaded and the first draw operation is complente
         */
        onComplete?: Callback;
    }
    type SizeMode = 'original' | 'fit' | 'fill' | 'stretch';
    type RenderMode = 'canvas' | 'image' | 'background';
    type Orientation = 'horizontal' | 'vertical';
    interface Options extends CallbackOptions {
        /**
         * The target element which should hold the spritespin instance. This is usually aready specified by the jQuery selector but can be overridden here.
         */
        target?: any;
        /**
         * Image URL or array of urls that should be used.
         */
        source: string | string[];
        /**
         * The display width in pixels. Width and height should match the aspect ratio of the frames.
         */
        width?: number;
        /**
         * The display height in pixels. Width and height should match the aspect ratio of the frames.
         */
        height?: number;
        /**
         * This is the number of frames for a full 360 rotation. If multiple lanes are used, each lane must have this amount of frames.
         */
        frames: number;
        /**
         * Number of frames in one row of a single sprite sheet.
         */
        framesX?: number;
        /**
         * Number of sequences.
         */
        lanes?: number;
        /**
         * Specifies how the frames are sized and scaled if it does not match the given
         * width and height dimensions.
         */
        sizeMode?: SizeMode;
        /**
         * The presentation module to use
         *
         * @deprecated please use plugins option instead
         */
        module?: string;
        /**
         * The interaction module to use
         *
         * @deprecated please use plugins option instead
         */
        behavior?: string;
        /**
         * Specifies the rendering mode.
         */
        renderer?: RenderMode;
        /**
         * The initial sequence number to play. This value is updated each frame and also represends the current lane number.
         */
        lane?: number;
        /**
         * Initial frame number. This value is updated each frame and also represends the current frame number.
         */
        frame?: number;
        /**
         * Time in ms between updates. e.g. 40 is exactly 25 FPS
         */
        frameTime?: number;
        /**
         * If true, starts the animation automatically on load
         */
        animate?: boolean;
        /**
         * If true, animation playback is reversed
         */
        reverse?: boolean;
        /**
         * If true, continues to play the animation in a loop without stopping.
         */
        loop?: boolean;
        /**
         * Stops the animation on that frame if `loop` is false.
         */
        stopFrame?: number;
        /**
         * If true, allows the user to drag the animation beyond the last frame and wrap over to the beginning.
         */
        wrap?: boolean;
        /**
         * If true, allows the user to drag the animation beyond the last sequence and wrap over to the beginning.
         */
        wrapLane?: boolean;
        /**
         * Sensitivity factor for user interaction
         */
        sense?: number;
        /**
         * Sensitivity factor for user interaction
         */
        senseLane?: number;
        /**
         * Preferred axis for user interaction
         */
        orientation?: Orientation | number;
        /**
         * If true, tries to detect whether the images are downsampled by the browser.
         */
        detectSubsampling?: boolean;
        /**
         * Number of pixels the user must drag within a frame to enable page scroll (for touch devices)
         */
        scrollThreshold?: number;
        /**
         * Number of images to preload. If nothing is set, all images are preloaded.
         */
        preloadCount?: number;
        /**
         * If true, display width can be controlled by CSS. width and height must still both be set and are used to calculate the aspect ratio.
         */
        responsive?: boolean;
        /**
         * Array of plugins to load
         */
        plugins?: any[];
    }
    interface Instance extends Options {
        /**
         * The unique spritespin instance identifier
         */
        id: string;
        /**
         * Array of all image urls
         */
        source: string[];
        /**
         * Array of all image elements
         */
        images: HTMLImageElement[];
        /**
         * The current preload progress state
         */
        progress: null | SpriteSpin.Utils.PreloadProgress;
        /**
         * Array with measurement information for each image
         */
        metrics: Utils.SheetSpec[];
        /**
         * The detected width of a single frame
         */
        frameWidth: number;
        /**
         * The detected height of a single frame
         */
        frameHeight: number;
        /**
         * Opaque state object. Plugins may store their information here.
         */
        state: any;
        /**
         * Is true during the preload phase
         */
        loading: boolean;
        /**
         * The target element
         */
        target: JQuery;
        /**
         * The inner stage element
         */
        stage: JQuery;
        /**
         * The inner canvas element
         */
        canvas: JQuery<HTMLCanvasElement>;
        /**
         * The 2D context of the canvas element
         */
        context: CanvasRenderingContext2D;
        /**
         * The pixel ratio of the canvas element
         */
        canvasRatio: number;
    }
    const $: any;
    /**
     * The namespace that is used to bind functions to DOM events and store the data object
     */
    const namespace = "spritespin";
    /**
     * Event names that are recognized by SpriteSpin. A module can implement any of these and they will be bound
     * to the target element on which the plugin is called.
     */
    const eventNames: string[];
    /**
     *
     */
    const callbackNames: string[];
    /**
     * Names of events for that the default behavior should be prevented.
     */
    const eventsToPrevent: string[];
    /**
     * Default set of SpriteSpin options. This also represents the majority of data attributes that are used during the
     * lifetime of a SpriteSpin instance. The data is stored inside the target DOM element on which the plugin is called.
     */
    const defaults: Options;
    /**
     * Replaces module names on given SpriteSpin data and replaces them with actual implementations.
     */
    function applyPlugins(data: Instance): void;
    /**
     * Applies css attributes to layout the SpriteSpin containers.
     */
    function applyLayout(data: Instance): void;
    /**
     * (re)binds all spritespin events on the target element
     */
    function applyEvents(data: Instance): void;
    /**
     * Runs the boot process. (re)initializes plugins, (re)initializes the layout, (re)binds events and loads source images.
     */
    function boot(data: Instance): void;
    /**
     * Initializes the target element with spritespin data.
     */
    function createOrUpdate(options: Options): void;
    /**
     * Stops running animation, unbinds all events and deletes the data on the target element of the given data object.
     */
    function destroy(data: Instance): void;
}
declare namespace SpriteSpin.Utils {
    function getCursorPosition(event: any): {
        x: any;
        y: any;
    };
}
declare namespace SpriteSpin.Utils {
    /**
     * Idea taken from https://github.com/stomita/ios-imagefile-megapixel
     * Detects whether the image has been sub sampled by the browser and does not have its original dimensions.
     * This method unfortunately does not work for images that have transparent background.
     */
    function detectSubsampling(img: HTMLImageElement, width: number, height: number): boolean;
}
declare namespace SpriteSpin.Utils {
    interface Layoutable {
        width?: number;
        height?: number;
        frameWidth?: number;
        frameHeight?: number;
        target: any;
        sizeMode?: SizeMode;
    }
    interface Layout {
        [key: string]: any;
        width: string | number;
        height: string | number;
        top: number;
        left: number;
        bottom: number;
        right: number;
        position: 'absolute';
        overflow: 'hidden';
    }
    interface SizeWithAspect {
        width: number;
        height: number;
        aspect: number;
    }
    /**
     *
     */
    function getOuterSize(data: Layoutable): SizeWithAspect;
    function getComputedSize(data: Layoutable): SizeWithAspect;
    /**
     *
     */
    function getInnerSize(data: Layoutable): SizeWithAspect;
    /**
     *
     */
    function getInnerLayout(mode: SizeMode, inner: SizeWithAspect, outer: SizeWithAspect): Layout;
}
declare namespace SpriteSpin.Utils {
    /**
     *
     */
    interface MeasureSheetOptions {
        frames: number;
        framesX?: number;
        detectSubsampling?: boolean;
    }
    /**
     *
     */
    interface SheetSpec {
        id: number;
        width: number;
        height: number;
        sprites: SpriteSpec[];
        sampledWidth?: number;
        sampledHeight?: number;
        isSubsampled?: boolean;
    }
    /**
     *
     */
    interface SpriteSpec {
        id: number;
        x: number;
        y: number;
        width: number;
        height: number;
        sampledX?: number;
        sampledY?: number;
        sampledWidth?: number;
        sampledHeight?: number;
    }
    /**
     * Measures the image frames that are used in the given data object
     */
    function measure(images: HTMLImageElement[], options: MeasureSheetOptions): SheetSpec[];
    function findSpecs(metrics: SheetSpec[], frames: number, frame: number, lane: number): {
        sprite: SpriteSpec;
        sheet: SheetSpec;
    };
}
declare namespace SpriteSpin.Utils {
    /**
     * gets the original width and height of an image element
     */
    function naturalSize(image: HTMLImageElement): {
        height: number;
        width: number;
    };
}
declare namespace SpriteSpin.Utils {
    interface PreloadOptions {
        source: string | string[];
        preloadCount?: number;
        initiated?: (images: HTMLImageElement[]) => void;
        progress?: (p: PreloadProgress) => void;
        complete?: (images: HTMLImageElement[]) => void;
    }
    interface PreloadProgress {
        index: number;
        loaded: number;
        total: number;
        percent: number;
    }
    function preload(opts: PreloadOptions): void;
}
declare namespace SpriteSpin.Utils {
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
    function sourceArray(path: any, opts: any): any[];
}
declare namespace SpriteSpin {
    const sourceArray: typeof Utils.sourceArray;
}
declare namespace SpriteSpin.Utils {
    function noop(): void;
    const log: (message?: any, ...optionalParams: any[]) => void;
    const warn: (message?: any, ...optionalParams: any[]) => void;
    const error: (message?: any, ...optionalParams: any[]) => void;
    function toArray<T>(value: T | T[]): T[];
    /**
     * clamps the given value by the given min and max values
     */
    function clamp(value: any, min: any, max: any): any;
    /**
     *
     */
    function wrap(value: any, min: any, max: any, size: any): any;
    /**
     * prevents default action on the given event
     */
    function prevent(e: any): boolean;
    /**
     * Binds on the given target and event the given function.
     * The SpriteSpin namespace is attached to the event name
     */
    function bind(target: any, event: any, func: any): void;
    /**
     * Unbinds all SpriteSpin events from given target element
     */
    function unbind(target: any): void;
    /**
     * Checks if given object is a function
     */
    function isFunction(fn: any): boolean;
    function pixelRatio(context: any): number;
}
declare namespace SpriteSpin {
}
declare namespace SpriteSpin.Fullscreen {
    interface Options {
        source?: string | string[];
        sizeMode?: SpriteSpin.SizeMode;
    }
    function exitFullscreen(): any;
    function fullscreenEnabled(): any;
    function fullscreenElement(): any;
    function isFullscreen(): boolean;
    function toggleFullscreen(data: SpriteSpin.Instance, opts: Options): void;
    function requestFullscreen(data: SpriteSpin.Instance, opts: Options): void;
}
