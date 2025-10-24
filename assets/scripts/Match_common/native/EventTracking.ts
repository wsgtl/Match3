import { native } from "cc";
import { sys } from "cc";
import { BaseStorageNS, ITEM_STORAGE } from "../localStorage/BaseStorage";
import { OrderData, WithdrawStorage } from "../../Match_game/view/withdraw/WithdrawStorage";

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
        console.log("adjustEvent 上报关卡" + level);
        if (sys.platform === sys.Platform.ANDROID) {
            native.jsbBridgeWrapper.dispatchEventToNative("trackLevelEvent", level.toString());//adjust上报
        }

    }
    /**计算钱数量并上报钱值事件 */
    export function sendEventCoin(num: number) {
        // const rateNum: number = num / LangStorage.getData().rate;//要除以汇率
        // const arr = getCoinEvent();
        // for (let i = 0; i < CoinEvent.length; i++) {
        //     const cn = CoinEvent[i];
        //     if (rateNum >= cn) {
        //         if (arr.indexOf(cn) == -1) {//超过数值了，发送事件并记录钱值
        //             const data = { event_type: "coin_" + cn };
        //             sendEvent(data);
        //             setCoinEvent(cn);
        //         }s
        //     }
        // }

    }

    const key1 = ITEM_STORAGE.EventTracking;
    export function setCoinEvent(num: number) {
        const arr = getCoinEvent();
        arr.push(num);
        BaseStorageNS.setItem(key1, JSON.stringify(arr));
    }

    export function getCoinEvent(): number[] {
        const item = BaseStorageNS.getItem(key1);
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

    /**游戏信息 */
    const _eventData = {
        /**只上报一次事件*/
        one: {
            /**进入加载页 */
            loading: 0,
            /**玩家点击旋转 */
            spin: 0,
            /**玩家领取现钞 */
            getMoney: 0,
            /**点击现钞栏 */
            clickMoney: 0,
            /**从现钞页返回主页 */
            backHome: 0,
            /**big win点击抽现金 */
            bigwin: 0,
            /**开始免费游戏 */
            startFreeGame: 0,
            /**点击再来一次免费游戏 */
            againFreeGame: 0,
        }

    }
    const key = ITEM_STORAGE.EventTrackings;
    /**
     * 保存游戏信息
     */
    export function saveLocal() {
        let tag = JSON.stringify(_eventData)
        BaseStorageNS.setItem(key, tag);
    }

    export function init() {
        let a = BaseStorageNS.getItem(key);
        let data = JSON.parse(a);
        for (let i in data) {
            if (_eventData[i] != undefined && data[i] != undefined)
                _eventData[i] = data[i];
        }
        saveLocal();
    }
    /**只上报一次的事件 */
    export function sendOneEvent(name: string) {
        if (_eventData.one[name] == 0) {
            _eventData.one[name] = 1;
            saveLocal();
            sendEvent({ event_type: "newhand_" + name })
        }
    }
    /**上报提现订单事件 */
    export function sendEventOrder(name: string, order: OrderData) {
        const orderNum = WithdrawStorage.getOrderNum();
        if (typeof orderNum[name] === 'number') {
            orderNum[name] += 1;
            WithdrawStorage.saveLocal();
            sendEvent({ event_type: "order_" + name, money: order.money, coin: order.coin, times: orderNum[name] })
        }
    }
    /**上报加速提现订单事件 */
    export function sendEventOrderSpeedUp(name: string) {
        sendEvent({ event_type: "order_speedup_" + name })
    }

}