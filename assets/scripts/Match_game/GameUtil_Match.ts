


/**游戏相关常量和方法 */

import { Vec3 } from "cc";
import { v3 } from "cc";
import { v2 } from "cc";
import { Vec2 } from "cc";
import { GameStorage } from "./GameStorage_Match";
import { MathUtil } from "../Match_common/utils/MathUtil";
import { LangStorage } from "../Match_common/localStorage/LangStorage";

/**结算数据 */
export type GameOverData = {
   score: number,
   // isWin: boolean
}


/**卡片类别 */
export enum CardType {
   none = 0,
   c1,
   c2,
   c3,
   c4,
   c5,
   c6,
   c7,
   c8,
   c9,
   c10,
   c11,
   c12,
   c13,
}


/**奖励类别 */
export enum RewardType {
   none = 0,
   money = 1,//现金
   coin,//金币
   energy,//体力
}
/**奖池类型 */
export enum JakcpotType {
   none = 0,
   grand = 1,
   major,
   mini
}

/**限时奖励类型 */
export enum LimitType {
   none = 0,
   cash = 1,
   lotus,
}
/**提现卡类型 */
export enum PayType {
   paypal = 1,
   googleplay,
   steam,
   visa
}
export type LuckyRewardData = {
   type: RewardType,
   num: number,
   isOpen: boolean
}
export type RewardData = {
   type: RewardType,
   num: number,
}


export type CoinCashData = {
   coin: number,
   money: number,
}

/**移动数据 */
export type MoveData = {
   from:number,
   to?:number,
   tos?:number[],//支持连续移动
   changeType?:CardType//变换类型
}
/**新生成类型 */
export type CardCreateData = {
   index:number,
   type:CardType,
}

export namespace GameUtil {
   export const CardW: number = 160;//卡牌宽
   export const CardH: number = 160;//卡牌高
   export const AllRow: number = 6;//行数
   export const AllCol: number = 6;//列数
   export const MaxIdnex: number = AllRow * AllCol;
   /**底血量 */
   export const DiBlood: number = 3;
   /**出中奖池概率 */
   export const MajorPro: number = 0.1;
   /**出大奖池概率 */
   export const GrandPro: number = 0;
   /**兑换券收集到可提现数量 */
   export const CashWithdrawNum: number = 100;
   /**新手引导送大额钱 */
   export const GuideMoney: number = 50;
   /**3~5个免费游戏标可以有几次免费游戏 */
   export const FreeGameTimes: number[] = [5, 6, 7];
   /**看广告增加的免费游戏次数 */
   export const FreeGameAddTimes: number = 3;
   /**钱提现金额 */
   export const moneyCash: number[] = [500, 1000, 1500, 2000, 2500, 3000];
   const yi = 100000000;
   /**金币提现金额 */
   export const coinCash: CoinCashData[] = [{ coin: 3 * yi, money: 500 }, { coin: 6 * yi, money: 1000 }, { coin: 9 * yi, money: 1500 }, { coin: 12 * yi, money: 2000 }, { coin: 15 * yi, money: 2500 }, { coin: 18 * yi, money: 3000 }];



   export function getCashNum(bl: number = 1) {//获取最低提现金额
      const rate = LangStorage.getData().rate;
      // return Math.floor(rate * CashNum * bl);
      return Math.floor(rate * moneyCash[0] * bl);
   }

   export function getCurDay() {
      const ct = Date.now();
      // 转换为天数（1天 = 24小时 × 60分钟 × 60秒 × 1000毫秒）
      return Math.floor(ct / (24 * 60 * 60 * 1000));
      // return GameStorage.getDaily().testDay;//测试
   }

   export function getLevelTimes(lv: number) {
      // return 1;
      return (lv - 1) + 10;
   }
   export function getRandomCard() {
      return MathUtil.random(1, 13);
   }
   export function getRandomMiniCard() {
      return MathUtil.random(1, 5);
   }
   /**获取排除掉传入值的随机类型 */
   export function getRandomExcluderCard(e1:number,e2:number) {
      let c = [];
      for(let i=1;i<=5;i++){
         if(i==e1||i==e2)continue;
         c.push(i);
      }
      return c.getRandomItem();
   }

   /**坐标获取标号 */
   export function getIndex(x: number, y: number) {
      return x + y * AllCol;
   }
   /**标号获取坐标 */
   export function getPos(index: number): Vec2 {
      return v2(index % AllCol, ~~(index / AllCol));
   }
   /**标号获取真实坐标 */
   export function getPost(index: number): Vec3 {
      return v3(((index % AllCol) - 2.5) * CardW, ((~~(index / AllCol)) - 2.5) * CardH);
   }
   /**通过真实坐标获取标号 */
   export function getIndext(p: Vec3): number {
      return (Math.floor(p.x / CardW) + 3) + (Math.floor(p.y / CardH) + 3) * AllCol;
   }
   export function getStartY(){
      return getPost(MaxIdnex).y;
   }
   /**是否同一行 */
   export function isRow(i1: number, i2: number): boolean {
      return ~~(i1 / AllCol) == ~~(i2 / AllCol);
   }
   /**是否相邻 */
   export function isAdjoin(i1: number, i2: number){
      if(i1-1==i2||i1+1==i2)
         return isRow(i1,i2);
      if(i1-AllCol==i2||i1+AllCol==i2)
         return i2>=0&&i2<MaxIdnex;
   }
   /**是否超出 */
   export function isOver(index: number) {
      return index < 0 || index >= MaxIdnex;
   }



}



