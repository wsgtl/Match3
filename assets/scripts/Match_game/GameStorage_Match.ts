import { BaseStorageNS, ITEM_STORAGE } from "../Match_common/localStorage/BaseStorage";
import { PayType, PropType } from "./GameUtil_Match";


/**
 * 系统设置类的缓存，不用加密p
 */
export namespace GameStorage {
    /**游戏信息 */
    const _gameData = {
        /**金币数 */
        coin: 100000,
        /**钱数 */
        money: 0,
        /**新手引导完成第几步 0：没完成 1：完成主页引导 2：完成游戏页引导 */
        guideStep: 0,
        /**道具数量 */
        prop:[3,3,3]
    }
    const key = ITEM_STORAGE.Game;
    /**
     * 保存游戏信息
     */
    export function saveLocal() {
        let tag = JSON.stringify(_gameData)
        BaseStorageNS.setItem(key, tag);
    }

    export function init() {
        let a = BaseStorageNS.getItem(key);
        let data = JSON.parse(a);
        for (let i in data) {
            if (_gameData[i] != undefined && data[i] != undefined)
                _gameData[i] = data[i];
        }
        this.saveLocal();
    }

    /**获取金币数 */
    export function getCoin() {
        return _gameData.coin;
    }
    /**增加金币数 */
    export function addCoin(num: number) {
        _gameData.coin += num;
        saveLocal();
        return _gameData.coin;
    }
    /**设置金币数 */
    export function setCoin(num: number) {
        _gameData.coin = num;
        saveLocal();
    }

    /**获取钱数 */
    export function getMoney() {
        return _gameData.money;
    }
    /**增加钱数 */
    export function addMoney(num: number) {
        _gameData.money += num;
        saveLocal();
        return _gameData.money;
    }
    /**设置钱数 */
    export function setMoney(num: number) {
        _gameData.money = num;
        saveLocal();
    }
    
    
    
    // /**提现卡类型 */
    // export function getPayType() {
    //     return _gameData.payType;
    // }
    // /**设置提现卡类型 */
    // export function setPayType(type: PayType) {
    //     _gameData.payType = type;
    //     saveLocal();
    // }
    // /**提现卡类型 */
    // export function getCardId() {
    //     return _gameData.cardId;
    // }
    // /**设置提现卡类型 */
    // export function setCardId(cardId: string) {
    //     _gameData.cardId = cardId;
    //     saveLocal();
    // }

    /**当前签到信息 */
    // export function getDaily() {
    //     // const day = _gameData.daily.weekDay;
    //     // const ld = _gameData.daily.lastDay;
    //     // const ct = Date.now();
    //     // // 转换为天数（1天 = 24小时 × 60分钟 × 60秒 × 1000毫秒）
    //     // const curDay = Math.floor(ct / (24 * 60 * 60 * 1000));
    //     // if (curDay - ld > 0) {
    //     //     _gameData.daily.lastDay = curDay;
    //     //     _gameData.daily.weekDay = day == 7 ? 1 : day + 1;
    //     //     saveLocal();
    //     // }
    //     return _gameData.daily;
    // }
    // /**签到 */
    // export function signin(lastDay: number) {
    //     _gameData.daily.lastDay = lastDay;
    //     _gameData.daily.isReceive = true;
    //     saveLocal();
    // }
    // /**下一天 */
    // export function nextDay(lastDay: number) {
    //     _gameData.daily.weekDay = _gameData.daily.weekDay == 7 ? 1 : _gameData.daily.weekDay + 1;
    //     _gameData.daily.isReceive = false;
    //     saveLocal();
    // }



    /**新手引导完成第几步 */
    export function getGuideStep() {
        return _gameData.guideStep;
    }
    /**设置新手引导完成第几步 */
    export function setGuideStep(step: number) {
        _gameData.guideStep = step;
        saveLocal();
    }
    /**获取道具数量 */
    export function getProp(){
        return _gameData.prop;
    }
    /**增加道具数量 */
    export function addProp(type:PropType,num:number){
        let n = _gameData.prop[type-1]??0;
        n+=num;
        _gameData.prop[type-1]=n;
        saveLocal();
    }
   
}