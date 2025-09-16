import { native } from "cc";
import { sys } from "cc";

/**调用原生功能 */
export namespace NativeFun {
    export function jumpWeb(url: string) {
        if (sys.platform === sys.Platform.ANDROID) {
            native.jsbBridgeWrapper.dispatchEventToNative("jumpWeb", url);
        }
    }
    /**震动
     * @param duration 震动时间,毫秒
     * @param amplitude 震动幅度
     */
    export function vibrate(duration: number, amplitude: number = -1) {
        if (sys.platform === sys.Platform.ANDROID) {
            const str = "{\"duration\":" + duration + ", \"amplitude\":" + amplitude + "}";
            native.jsbBridgeWrapper.dispatchEventToNative("vibrate", str);

        }
    }
    /**弹出h5游戏窗口*/
    export function showH5Game() {
        if (sys.platform === sys.Platform.ANDROID) {
            native.jsbBridgeWrapper.dispatchEventToNative("showH5Game");
        }
    }

}