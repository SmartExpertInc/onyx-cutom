"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForReady = void 0;
const waitForReady = (timeoutInMilliseconds) => {
    const { promise, resolve, reject } = Promise.withResolvers();
    const start = Date.now();
    const interval = setInterval(() => {
        if (window.remotion_renderReady === true) {
            resolve(true);
            clearInterval(interval);
            return;
        }
        if (window.remotion_cancelledError !== undefined) {
            reject(window.remotion_cancelledError);
            clearInterval(interval);
            return;
        }
        if (Date.now() - start > timeoutInMilliseconds + 3000) {
            // TODO: Error message should be just as good
            reject(new Error(Object.values(window.remotion_delayRenderTimeouts)
                .map((d) => d.label)
                .join(', ')));
            clearInterval(interval);
        }
    }, 50);
    return promise;
};
exports.waitForReady = waitForReady;
