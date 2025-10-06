import type { DelayRenderOptions } from './delay-render.js';
type DelayRenderFn = (label?: string, options?: DelayRenderOptions) => number;
type ContinueRenderFn = (handle: number) => void;
export declare const useDelayRender: () => {
    delayRender: DelayRenderFn;
    continueRender: ContinueRenderFn;
};
export {};
