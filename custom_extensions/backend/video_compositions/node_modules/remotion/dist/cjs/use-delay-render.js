"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDelayRender = void 0;
const react_1 = require("react");
const delay_render_js_1 = require("./delay-render.js");
const use_remotion_environment_js_1 = require("./use-remotion-environment.js");
const useDelayRender = () => {
    const environment = (0, use_remotion_environment_js_1.useRemotionEnvironment)();
    const delayRender = (0, react_1.useCallback)((label, options) => {
        return (0, delay_render_js_1.delayRenderInternal)(environment, label, options);
    }, [environment]);
    const continueRender = (0, react_1.useCallback)((handle) => {
        (0, delay_render_js_1.continueRenderInternal)(handle, environment);
    }, [environment]);
    return { delayRender, continueRender };
};
exports.useDelayRender = useDelayRender;
