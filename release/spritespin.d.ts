declare namespace SpriteSpin {
    const instances: {
        [key: string]: Instance;
    };
    function registerPlugin(name: any, plugin: any): any;
    function registerModule(name: any, plugin: any): void;
    class Api {
        data: Instance;
        constructor(data: Instance);
    }
    function registerApi(methods: {
        [key: string]: any;
    }): Api;
    function extendApi(methods: any): void;
    function getInputState(data: Instance): InputState;
    function getAnimationState(data: Instance): AnimationState;
    function getPluginState(data: Instance, name: string): any;
    function is(data: Instance, flag: string): boolean;
    function flag(data: Instance, flag: string, value: boolean): void;
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
    function updateInput(e: any, data: Instance): void;
    function resetInput(data: Instance): void;
    interface AnimationState {
        lastFrame: number;
        lastLane: number;
        handler: number;
    }
    function updateFrame(data: Instance, frame: number, lane?: number): void;
    function stopAnimation(data: Instance): void;
    function applyAnimation(data: Instance): void;
    type Callback = (e, data: Instance) => void;
    interface CallbackOptions {
        onInit?: Callback;
        onProgress?: Callback;
        onLoad?: Callback;
        onFrame?: Callback;
        onDraw?: Callback;
        onComplete?: Callback;
    }
    type SizeMode = 'original' | 'fit' | 'fill' | 'stretch';
    type RenderMode = 'canvas' | 'image' | 'background';
    type Orientation = 'horizontal' | 'vertical';
    interface Options extends CallbackOptions {
        target?: any;
        source: string | string[];
        width?: number;
        height?: number;
        frames: number;
        framesX?: number;
        lanes?: number;
        sizeMode?: SizeMode;
        module?: string;
        behavior?: string;
        renderer?: RenderMode;
        lane?: number;
        frame?: number;
        frameTime?: number;
        animate?: boolean;
        reverse?: boolean;
        loop?: boolean;
        stopFrame?: number;
        wrap?: boolean;
        wrapLane?: boolean;
        sense?: number;
        senseLane?: number;
        orientation?: Orientation;
        detectSubsampling?: boolean;
        scrollThreshold?: number;
        preloadCount?: number;
        responsive: boolean;
        plugins: any[];
    }
    interface Instance extends Options {
        id: string;
        source: string[];
        images: HTMLImageElement[];
        target: any;
        metrics: Utils.SheetSpec[];
        frameWidth: number;
        frameHeight: number;
        state: any;
        loading: boolean;
        stage: any;
        canvas: any;
        context: CanvasRenderingContext2D;
        canvasRatio: number;
    }
    const $: any;
    const namespace = "spritespin";
    const eventNames: string[];
    const callbackNames: string[];
    const eventsToPrevent: string[];
    const defaults: Options;
    function applyPlugins(data: Instance): void;
    function applyLayout(data: Instance): void;
    function applyEvents(data: Instance): void;
    function boot(data: Instance): void;
    function createOrUpdate(options: Options): void;
    function destroy(data: Instance): void;
}
declare namespace SpriteSpin.Utils {
    function getCursorPosition(event: any): {
        x: any;
        y: any;
    };
}
declare namespace SpriteSpin.Utils {
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
    function getOuterSize(data: Layoutable): SizeWithAspect;
    function getComputedSize(data: Layoutable): SizeWithAspect;
    function getInnerSize(data: Layoutable): SizeWithAspect;
    function getInnerLayout(mode: SizeMode, inner: SizeWithAspect, outer: SizeWithAspect): Layout;
}
declare namespace SpriteSpin.Utils {
    interface MeasureSheetOptions {
        frames: number;
        framesX?: number;
        detectSubsampling?: boolean;
    }
    interface SheetSpec {
        id: number;
        width: number;
        height: number;
        sprites: SpriteSpec[];
        sampledWidth?: number;
        sampledHeight?: number;
        isSubsampled?: boolean;
    }
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
    function measure(images: HTMLImageElement[], options: MeasureSheetOptions): SheetSpec[];
    function findSpecs(metrics: SheetSpec[], frames: number, frame: number, lane: number): {
        sprite: SpriteSpec;
        sheet: SheetSpec;
    };
}
declare namespace SpriteSpin.Utils {
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
    function clamp(value: any, min: any, max: any): any;
    function wrap(value: any, min: any, max: any, size: any): any;
    function prevent(e: any): boolean;
    function bind(target: any, event: any, func: any): void;
    function unbind(target: any): void;
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
