


/**游戏相关常量和方法 */
import { OrderData, WithdrawStorage } from "./WithdrawStorage";
import { GameManger } from "../../manager/GameManager";
import { LangStorage } from "../../../Match_common/localStorage/LangStorage";
import { EventTracking } from "../../../Match_common/native/EventTracking";
import { FormatUtil } from "../../../Match_common/utils/FormatUtil";
import { MathUtil } from "../../../Match_common/utils/MathUtil";


/**提现卡类型 */
export enum PayType {
   paypal = 1,
   pix,
   pagbank,
   googleplay
}
export type CoinCashData = {
   coin: number,
   money: number,
}
/**金额控制表 */
export type MoneyControl = {
   // left:number,
   right: number,
   base: number,//基础钱
   min: number,//最低倍率
   max: number,//最高倍率
}
/**排队控制表 */
export type QueueControl = {
   left: number,
   cost: number,//前进10名消耗
}
/**等待时间控制表 */
export type WaitControl = {
   left: number,
   cost: number,//前进100分钟消耗
}
export namespace WithdrawUtil {
   /**激活订单需要玩多少次 */
   export const ActivatePlay: number = 500;
   // export const ActivatePlay: number = 10;
   /**激活订单限定时间 单位：秒*/
   export const ActivateTimes: number = 28 * 60 * 60;
   // export const ActivateTimes: number = 10;
   /**等待订单处理时间 单位：秒*/
   export const WaitTimes: number = 15 * 24 * 60 * 60;
   /**订单失败返回金额比例 */
   export const BackMoney: number = 1.2;
   /**每次消除增加点数 */
   export const AddPoints: number = 2;
   // export const AddPoints: number = 1000;
   /**每次前进排名 */
   export const OneQueue: number = 10;
   // export const OneQueue: number = 100;
   /**每次前进分钟数 */
   export const OneWait: number = 100;
   /**钱提现金额 */
   export const moneyCash: number[] = [500, 800, 1000];
   const yi = 10000000;
   /**金币提现金额 */
   export const coinCash: CoinCashData[] = [{ coin: 30 * yi, money: 500 }, { coin: 48 * yi, money: 800 }, { coin: 60 * yi, money: 1000 }];

   export function getCashNum(bl: number = 1) {//获取最低提现金额
      const rate = LangStorage.getData().rate;
      // return Math.floor(rate * CashNum * bl);
      return Math.floor(rate * moneyCash[0] * bl);
   }
   export function getCashNumAuto(money: number) {//获取提现金额
      const rate = LangStorage.getData().rate;
      for (let a of moneyCash) {
         const m = Math.floor(a * rate);
         if (m > money) return m;
      }
   }
   /**初始排位 */
   export function getQueueNum() {
      return MathUtil.random(6000, 8000);
   }
   /**获取当前秒数 */
   export function getCurSecond() {
      const ct = Date.now();
      return Math.floor(ct / 1000);
   }

   /**每次combo增加点数和激活订单次数 */
   export function comboToOrder() {
      const order = WithdrawStorage.getOrder();
      const t = getCurSecond();
      let sy = 0;
      let mo: OrderData;
      if (order?.inactive?.length) {
         for (let i = order.inactive.length - 1; i >= 0; i--) {
            const a = order.inactive[i];
            a.playTimes += 1;
            const _sy = ActivatePlay - a.playTimes;
            if (_sy > 0) {//计算还剩几次转动可提现
               if (!mo) {
                  sy = _sy;
                  mo = a;
               } else {
                  if (_sy < sy) {
                     sy = _sy;
                     mo = a;
                  }
               }
            }
            if (a.playTimes >= ActivatePlay && t <= a.canActivateTime) {
               order.inactive.splice(i, 1);//激活订单
               order.activated.push(a);
               a.activateTime = t;
               // a.waitTime = t + WaitTimes;
               a.queue = getQueueNum();
               a.status = 1;
               WithdrawStorage.saveLocal();
               EventTracking.sendEventOrder("queue", a);
            }
         }
         WithdrawStorage.saveLocal();
         // if (sy > 0) {
         //    GameManger.instance.tipCashOut(2, [sy.toString(), FormatUtil.toMoneyLabel(mo.money * LangStorage.getData().rate)])
         // }
      }
      if (order?.activated?.length) {
         WithdrawStorage.addPoints(AddPoints);
      }
   }
   /**计算到激活时间 */
   export function colActivateTime(time: number, colon: string = " _ ") {
      const second = time - getCurSecond();
      const hour = Math.floor(second / 3600).toString().padStart(2, "0");
      const minute = Math.floor((second % 3600) / 60).toString().padStart(2, "0");
      const seconds = Math.floor(second % 60).toString().padStart(2, "0");
      return hour + colon + minute + colon + seconds;
   }
   /**计算到等待处理时间 */
   export function colWaitTime(time: number, colon: string = " _ ") {
      const second = time - getCurSecond();
      // const day = Math.floor(second / 3600 / 24).toString().padStart(2, "0");
      // const hour = Math.floor((second / 3600) % 24).toString().padStart(2, "0");
      const hour = Math.floor(second / 3600).toString().padStart(2, "0");
      const minute = Math.floor((second % 3600) / 60).toString().padStart(2, "0");
      const seconds = Math.floor(second % 60).toString().padStart(2, "0");
      // return day + colon + hour + colon + minute + colon + seconds;
      return hour + colon + minute + colon + seconds;
   }
   /**找到未激活订单 */
   export function findInOrder(money: number, coin: number) {
      const inactive = WithdrawStorage.getOrder().inactive;
      if (!inactive) return;
      for (let a of inactive) {
         if (a.money == money && a.coin == coin)
            return a;
      }
   }
   /**转换秒数为年月日 */
   export function formatTimestamp(timestamp: number, colon: string = " l "): string {
      const date = new Date(timestamp * 1000);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return month + colon + day + colon + year;
   }
   /**每次进游戏随机减少排位 */
   export function queueSub() {
      const orders = WithdrawStorage.getOrder().activated;
      orders.forEach(v => {
         if (v.status == 1) {
            if (MathUtil.probability(0.3)) {
               v.queue = Math.max(0, v.queue - MathUtil.random(1, 3));
               if (v.queue == 0) {
                  orderWait(v);
               }
            }
         }
      })
      WithdrawStorage.saveLocal();
   }
   /**计算返还钱 */
   export function getBackMoney(order: OrderData) {
      return Math.floor(order.money * BackMoney);
   }
   /**进入等待处理阶段 */
   export function orderWait(order: OrderData) {
      EventTracking.sendEventOrder("audit", this.curOrder);
      order.status = 2;
      order.waitTime = getCurSecond() + WaitTimes;
   }
   /**进入失败阶段 */
   export function orderFial(order: OrderData) {
      order.status = 3;
   }

   /**钱控制数据 */
   export const MoneyControlData: MoneyControl[] = [
      { right: 250, base: 22, min: 1.2, max: 2 },
      { right: 350, base: 18, min: 1.2, max: 2 },
      { right: 400, base: 14, min: 1.2, max: 2 },
      { right: 450, base: 8, min: 1.2, max: 2 },
      { right: 475, base: 4, min: 1.2, max: 2 },
      { right: 490, base: 2, min: 1.2, max: 2 },
      { right: 495, base: 1, min: 1.2, max: 2 },
      { right: 498.5, base: 0.5, min: 1.2, max: 2 },
      { right: 499.5, base: 0.2, min: 1.2, max: 2 },
      { right: 499.9, base: 0.1, min: 1.2, max: 2 },
      { right: 500.1, base: 0.03, min: 1.2, max: 2 },

      { right: 650, base: 20, min: 1.2, max: 2 },
      { right: 710, base: 15, min: 1.2, max: 2 },
      { right: 740, base: 10, min: 1.2, max: 2 },
      { right: 770, base: 5, min: 1.2, max: 2 },
      { right: 785, base: 2.5, min: 1.2, max: 2 },
      { right: 794, base: 1, min: 1.2, max: 2 },
      { right: 797, base: 0.5, min: 1.2, max: 2 },
      { right: 799.1, base: 0.2, min: 1.2, max: 2 },
      { right: 799.7, base: 0.1, min: 1.2, max: 2 },
      { right: 800.1, base: 0.03, min: 1.2, max: 2 },

      { right: 850, base: 20, min: 1.2, max: 2 },
      { right: 910, base: 15, min: 1.2, max: 2 },
      { right: 940, base: 10, min: 1.2, max: 2 },
      { right: 970, base: 5, min: 1.2, max: 2 },
      { right: 985, base: 2.5, min: 1.2, max: 2 },
      { right: 994, base: 1, min: 1.2, max: 2 },
      { right: 997, base: 0.5, min: 1.2, max: 2 },
      { right: 999.1, base: 0.2, min: 1.2, max: 2 },
      { right: 999.7, base: 0.1, min: 1.2, max: 2 },
      { right: 1000.1, base: 0.03, min: 1.2, max: 2 },

      { right: 999999999999, base: 2.5, min: 1.2, max: 2 },
   ];
   /**每个场景钱倍率 */
   export const MoneyBls = {
      RewardAd: 1,//广告
      RewardFree: 0.3,//免费
      Bubble: 1,//气泡
      GoldReward: 0.2,//彩金
      Pass: 0.02,//通关三消奖励
      Mini: 2,//mini
      PassAd:2,//通关奖励看广告倍数
      BoxFree:0.5,//礼包免费
      Box: 2,//礼包
      Slot: 1.3,//老虎机钱
   }

   /**排队消耗数据 */
   export const QueueControlData: QueueControl[] = [
      { left: 4000, cost: 10 },
      { left: 3000, cost: 20 },
      { left: 2000, cost: 30 },
      { left: 1000, cost: 40 },
      { left: 500, cost: 50 },
      { left: 300, cost: 60 },
      { left: 200, cost: 70 },
      { left: 150, cost: 80 },
      { left: 100, cost: 90 },
      { left: 0, cost: 100 },
   ];
   /**等待消耗数据 */
   export const WaitControlData: WaitControl[] = [
      { left: 15000, cost: 10 },
      { left: 12000, cost: 20 },
      { left: 10000, cost: 30 },
      { left: 6500, cost: 40 },
      { left: 5500, cost: 50 },
      { left: 5000, cost: 60 },
      { left: 0, cost: 100 },
   ];



}



