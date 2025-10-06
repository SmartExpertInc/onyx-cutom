"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compose = void 0;
const compose = ({ composables, width, height, }) => {
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Could not get context');
    }
    // TODO: Consider z-index
    for (const composable of composables) {
        context.drawImage(composable, 0, 0);
    }
    return canvas;
};
exports.compose = compose;
