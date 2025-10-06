import type { RemotionEnvironment } from './remotion-environment-context.js';
export declare const DELAY_RENDER_CALLSTACK_TOKEN = "The delayRender was called:";
export declare const DELAY_RENDER_RETRIES_LEFT = "Retries left: ";
export declare const DELAY_RENDER_RETRY_TOKEN = "- Rendering the frame will be retried.";
export declare const DELAY_RENDER_CLEAR_TOKEN = "handle was cleared after";
export type DelayRenderOptions = {
    timeoutInMilliseconds?: number;
    retries?: number;
};
/**
 * Internal function that accepts environment as parameter.
 * This allows useDelayRender to control its own environment source.
 * @private
 */
export declare const delayRenderInternal: (environment: RemotionEnvironment, label?: string, options?: DelayRenderOptions) => number;
export declare const delayRender: (label?: string, options?: DelayRenderOptions) => number;
/**
 * Internal function that accepts environment as parameter.
 * @private
 */
export declare const continueRenderInternal: (handle: number, environment: RemotionEnvironment) => void;
export declare const continueRender: (handle: number) => void;
