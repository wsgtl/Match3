import { BaseStorageNS, ITEM_STORAGE } from "../../../Match_common/localStorage/BaseStorage"


export type OrderData = {
    /**是否已经激活 */
    isActivate: boolean,
    /**状态 1：排队 2：等待处理 3：失败 */
    status: number,
    /**创建时间 单位：秒*/
    createTime: number,
    /**可激活时间 */
    canActivateTime: number,
    /**激活时间 单位：秒 */
    activateTime: number,
    /**等待处理时间 单位：秒 */
    waitTime: number,
    /**玩了几次 */
    playTimes: number,
    /**排队 */
    queue: number,
    /**钱 */
    money: number,
    /**金币 */
    coin: number,
}
type WithdrawData = {
    /**点数 */
    points: number,
    /**是否到达过提现门槛 */
    isToCashOut: boolean,
    /**订单 */
    orders: {
        /**已激活订单 */
        activated: OrderData[],
        /**未激活订单 */
        inactive: OrderData[]
    },
    /**订单每个步骤记录次数埋点 */
    orderNum:{
        /**点击领取现金 */
        withdraw:number,
        /**进入排队 */
        queue:number,
        /**进入审核 */
        audit:number,
        /**订单失败返回 */
        failBackMoney:number
        /**订单超时返回 */
        timeout:number
    }
}
/**
 * 系统设置类的缓存，不用加密p
 */
export namespace WithdrawStorage {
    /**游戏信息 */
    const _withdrawData: WithdrawData = {
        /**点数 */
        points: 0,
        isToCashOut:false,
        /**订单 */
        orders: {
            /**已激活订单 */
            activated: [],
            /**未激活订单 */
            inactive: []
        },
        orderNum:{
            withdraw:0,
            queue:0,
            audit:0,
            failBackMoney:0,
            timeout:0
        }

    }
    const key = ITEM_STORAGE.WAITWITHDRWWS;
    /**
     * 保存游戏信息
     */
    export function saveLocal() {
        let tag = JSON.stringify(_withdrawData)
        BaseStorageNS.setItem(key, tag);
    }

    export function init() {
        let a = BaseStorageNS.getItem(key);
        let data = JSON.parse(a);
        for (let i in data) {
            if (_withdrawData[i] != undefined && data[i] != undefined)
                _withdrawData[i] = data[i];
        }
        saveLocal();
    }

    /**获取点数 */
    export function getPoints() {
        return _withdrawData.points;
    }
    /**增加点数 */
    export function addPoints(num: number) {
        _withdrawData.points += num;
        saveLocal();
        return _withdrawData.points;
    }
    /**是否到达过提现门槛 */
    export function getIsToCashOut() {
        return _withdrawData.isToCashOut;
    }
    /**设置是否到达过提现门槛 */
    export function setIsToCashOut() {
        _withdrawData.isToCashOut = true;
        saveLocal();
    }
    // /**创建订单 */
    // export function addOrder(order:OrderData){
    //     _withdrawData.orders.push(order);
    //     saveLocal();
    // }
    // /**删除订单 */
    // export function delOrder(order:OrderData){
    //     const os = _withdrawData.orders
    //     for(let i=os.length;i>=0;i--){
    //         const o = os[i];
    //         if(o==order){
    //             os.splice(i,1);
    //         }
    //     }
    //     saveLocal();
    // }
    /**获取订单 */
    export function getOrder() {
        return _withdrawData.orders;
    }
    /**获取订单每个步骤记录次数埋点 */
    export function getOrderNum() {
        return _withdrawData.orderNum;
    }


}