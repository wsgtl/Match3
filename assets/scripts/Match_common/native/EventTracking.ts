import { native } from "cc";
import { sys } from "cc";
import { BaseStorageNS, ITEM_STORAGE } from "../localStorage/BaseStorage";
import { OrderData, WithdrawStorage } from "../../Match_game/view/withdraw/WithdrawStorage";
import { ConfigConst } from "../../Match_game/manager/ConfigConstManager";

export namespace EventTracking {
    /**上报事件 */
    export function sendEvent(data: Object) {
        data["ab_test"] = ConfigConst.getAbTest();
        const str = JSON.stringify(data);
        // console.log("上报",str);
        if (sys.platform === sys.Platform.ANDROID) {
            native.jsbBridgeWrapper.dispatchEventToNative("sendEvent", str);
        }
    }




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
            /**进入提现指引 */
            guideHome: 0,
            /**提现指引页点击按钮 */
            guideHomeClick: 0,
            /**成功进行第一次消除操作 */
            clear1: 0,
            /**奖励关完成一次消除操作 */
            clearPass1: 0,
            /**进入提现页 */
            toCashPage: 0,
            /**从提现页返回主页 */
            backHome: 0,
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
            sendEvent({ event_type: "order_" + name, money: order.money, coin: order.coin, times: orderNum[name]})
        }
    }
    /**上报加速提现订单事件 */
    export function sendEventOrderSpeedUp(name: string) {
        sendEvent({ event_type: "order_speedup_" + name })
    }

}