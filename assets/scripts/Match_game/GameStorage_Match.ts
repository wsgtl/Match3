import { BaseStorageNS, ITEM_STORAGE } from "../Match_common/localStorage/BaseStorage";
import { PayType } from "./GameUtil_Match";


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
        /**兑换券数 */
        cash: 0,
        /**宝箱进度 */
        treasure: 0,
        /**葫芦进度 */
        lotus: 0,
        /**提现卡类型 */
        payType: 1,
        /**提现卡号 */
        cardId: "",
        /**体力 */
        energy: {
            /**体力值 */
            energy: 0,
            /**上次体力更新时间 */
            time: 0,
        },
        /**猪礼物 */
        pig: {
            /**猪礼物倒计时 */
            pigTime: 0,
            /**猪礼物上次领取奖励天数 */
            day: 0,
        },
        /**限时活动 */
        limit: {
            /**莲花两个 */
            lotus: 0,
            /**钱标两个 */
            cash: 0,
            /**上次免费领取奖励天数 */
            day: 0,
        },
        /**当前关卡 */
        curLevel: 1,
        /**当前关卡第几次 */
        curLevelTime: 0,
        /**上一关卡 */
        lastLevel: 1,
        /**新手引导完成第几步 0：没完成 1：完成主页引导 2：完成游戏页引导 */
        guideStep: 0,
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
    /**获取兑换券 */
    export function getCash() {
        return _gameData.cash;
    }
    /**增加兑换券 */
    export function addCash(num: number) {
        _gameData.cash += num;
        saveLocal();
    }
    /**获取宝箱进度 */
    export function getTreasure() {
        return _gameData.treasure;
    }
    /**设置宝箱进度 */
    export function setTreasure(num: number) {
        _gameData.treasure = num;
        saveLocal();
    }
    /**获取葫芦进度 */
    export function getLotus() {
        return _gameData.lotus;
    }
    /**设置葫芦进度 */
    export function setLotus(num: number) {
        _gameData.lotus = num;
        saveLocal();
    }
    /**当前关卡等级 */
    export function getCurLevel() {
        return _gameData.curLevel;
    }
    /**存储下一关 */
    export function nextLevel() {
        _gameData.curLevel += 1;
        saveLocal();
    }
    /**当前关卡第几次 */
    export function getCurLevelTimes() {
        return _gameData.curLevelTime;
    }
    /**存储下一关 */
    export function setLevelTime(t: number) {
        _gameData.curLevelTime = t;
        saveLocal();
    }
    /**上一关卡等级 */
    export function getLastLevel() {
        return _gameData.lastLevel;
    }
    /**存储上一关 */
    export function setLastLevel(level: number) {
        _gameData.lastLevel = level;
        saveLocal();
    }
    /** 当前猪礼物 */
    export function getPig() {
        return _gameData.pig;
    }
    /**存储猪礼物倒计时 */
    export function setPigTime(time: number) {
        _gameData.pig.pigTime = time;
        saveLocal();
    }
    /**存储猪礼物上次领取天数 */
    export function setPigDay(day: number) {
        _gameData.pig.day = day;
        saveLocal();
    }
    /**限时活动 */
    export function getLimit() {
        return _gameData.limit;
    }
    /**限时活动莲花两个次数 */
    export function setLimitLotus(num: number) {
        _gameData.limit.lotus = num;
        saveLocal();
    }
    /**限时活动钱标两个奖励次数 */
    export function setLimitCash(num: number) {
        _gameData.limit.cash = num;
        saveLocal();
    }
    /**限时活动上次免费奖励天数 */
    export function setLimitDay(day: number) {
        _gameData.limit.day = day;
        saveLocal();
    }
    /**提现卡类型 */
    export function getPayType() {
        return _gameData.payType;
    }
    /**设置提现卡类型 */
    export function setPayType(type: PayType) {
        _gameData.payType = type;
        saveLocal();
    }
    /**提现卡类型 */
    export function getCardId() {
        return _gameData.cardId;
    }
    /**设置提现卡类型 */
    export function setCardId(cardId: string) {
        _gameData.cardId = cardId;
        saveLocal();
    }

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
    /**获取体力值 */
    export function getEnergy() {
        return _gameData.energy;
    }
    /**设置体力值 */
    export function setEnergy(v: number) {
        _gameData.energy.energy = v;
        saveLocal();
    }
    /**刷新体力值时间 */
    export function setEnergyTime(v: number) {
        _gameData.energy.time = v;
        saveLocal();
    }

}