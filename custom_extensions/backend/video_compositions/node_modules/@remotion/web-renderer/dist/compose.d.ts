export type Composable = HTMLCanvasElement;
export declare const compose: ({ composables, width, height, }: {
    composables: Composable[];
    width: number;
    height: number;
}) => OffscreenCanvas;
