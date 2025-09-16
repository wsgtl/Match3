import { native } from "cc";
import { sys } from "cc";
import { BaseStorageNS, ITEM_STORAGE } from "../localStorage/BaseStorage";
import { LocalRate } from "./LocalRate";
import { LangStorage } from "../localStorage/LangStorage";

export namespace EventTracking {
    /**上报事件 */
    export function sendEvent(data: Object) {
        const str = JSON.stringify(data);
        // console.log("上报",str);
        if (sys.platform === sys.Platform.ANDROID) {
            native.jsbBridgeWrapper.dispatchEventToNative("sendEvent", str);
        }
    }
    /**上报通过第几关 */
    export function sendEventLevel(level: number) {
        // const data = { event_type: "level_x", level };
        // sendEvent(data);
        console.log("adjustEvent 上报关卡"+level);
        if (sys.platform === sys.Platform.ANDROID) {
            native.jsbBridgeWrapper.dispatchEventToNative("trackLevelEvent", level.toString());//adjust上报
        }
        
    }
    /**计算钱数量并上报钱值事件 */
    export function sendEventCoin(num: number) {
        const rateNum: number = num / LangStorage.getData().rate;//要除以汇率
        const arr = getCoinEvent();
        for (let i = 0; i < CoinEvent.length; i++) {
            const cn = CoinEvent[i];
            if (rateNum >= cn) {
                if (arr.indexOf(cn) == -1) {//超过数值了，发送事件并记录钱值
                    const data = { event_type: "coin_" + cn };
                    sendEvent(data);
                    setCoinEvent(cn);
                }
            }
        }

    }

    const key = ITEM_STORAGE.EventTracking;
    export function setCoinEvent(num: number) {
        const arr = getCoinEvent();
        arr.push(num);
        BaseStorageNS.setItem(key, JSON.stringify(arr));
    }

    export function getCoinEvent(): number[] {
        const item = BaseStorageNS.getItem(key);
        let arr: number[];
        if (item) {
            arr = JSON.parse(item);
        }
        return arr ?? [];
    }

    const CoinEvent = [100, 150, 200, 250, 300, 400, 550, 700, 880, 1000];


     /**上报事件 */
    export function sendEventAdjust(data: Object) {
        const str = JSON.stringify(data);
        // console.log("上报",str);
        if (sys.platform === sys.Platform.ANDROID) {
            native.jsbBridgeWrapper.dispatchEventToNative("sendEvent", str);
        }
    }
}