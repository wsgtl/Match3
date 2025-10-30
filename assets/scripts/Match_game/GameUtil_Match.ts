


/**游戏相关常量和方法 */

import { Vec3 } from "cc";
import { v3 } from "cc";
import { v2 } from "cc";
import { Vec2 } from "cc";
import { GameStorage } from "./GameStorage_Match";
import { MathUtil } from "../Match_common/utils/MathUtil";
import { LangStorage } from "../Match_common/localStorage/LangStorage";
import { EditBoxComponent } from "cc";

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
   c14,
}


/**奖励类别 */
export enum RewardType {
   none = 0,
   money = 1,//现金
   coin,//金币
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
/**颜色 */
export enum ColorType {
   g = 1,
   y,
   b,
   r,
   g1,
   p,
   pink
}
/**道具 */
export enum PropType {
   none = 0,
   bomb,//炸弹道具
   color,//颜色道具
   shuffle,//打乱道具
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
   from: number,
   to?: number,
   tos?: number[],//支持连续移动
   changeType?: CardType//变换类型
}
/**新生成类型 */
export type CardCreateData = {
   index: number,
   type: CardType,
}

export namespace GameUtil {
   /**是否是测试模式 */
   export const IsTest: boolean = true;
   export const CardW: number = 170;//卡牌宽
   export const CardH: number = 170;//卡牌高
   export const AllRow: number = 6;//行数
   export const AllCol: number = 6;//列数
   export const MaxIdnex: number = AllRow * AllCol;
   /**底血量 */
   export const DiBlood: number = 3;
   /**颜色数量 */
   export const ColorNum: number = 7;
   /**出中奖池概率 */
   export const MajorPro: number = 0.1;
   /**出大奖池概率 */
   export const GrandPro: number = 0;
   /**通关奖励时间 */
   export const PassRewardTime: number = 30;
   /**主页送钱倒计时时间 */
   export const GetMoneyTime: number = 10;
   /**每次观看广告增加的道具数 */
   export const PropAddNum: number = 5;
   /**3~5个免费游戏标可以有几次免费游戏 */
   export const FreeGameTimes: number[] = [5, 6, 7];
   /**看广告增加的免费游戏次数 */
   export const FreeGameAddTimes: number = 3;
   /**钱提现金额 */
   export const moneyCash: number[] = [500, 1000, 1500, 2000, 2500, 3000];
   /**连击进度条总数 */
   export const CombosProgress: number = 80;
   /**连击礼物百分比 */
   export const ComboGifts: number[] = [0.3, 0.6, 1];
   /**老虎机中钱和金币概率 */
   export const SlotProbability: number[] = [0.25, 0.4, 0.35];
   const yi = 100000000;
   /**附近八个位置 */
   export const Nearby8: number[] = [-1, 1, AllCol, -AllCol, AllCol - 1, AllCol + 1, -AllCol - 1, -AllCol + 1];
   /**炸弹位置纠正 */
   export const BombPos: number[] = [1, 1, 2, 3, 4, 4];
   /**新手引导牌面 */
   export const GuideBoard: number[] = [
      1, 2, 1, 3, 4, 5,
      2, 1, 3, 4, 1, 2,
      1, 4, 2, 1, 4, 3,
      5, 2, 1, 2, 4, 6,
      6, 2, 1, 2, 3, 5,
      1, 3, 2, 3, 4, 3,
   ]


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
      return MathUtil.random(1, 14);
   }
   export function getRandomMiniCard() {
      return MathUtil.random(1, 5);
   }
   /**获取排除掉传入值的随机类型 */
   export function getRandomExcluderCard(e1: number, e2: number) {
      let c = [];
      for (let i = 1; i <= 5; i++) {
         if (i == e1 || i == e2) continue;
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
   /**标号获取任务栏真实坐标 */
   export function getPostask(index: number): Vec3 {
      return v3(((index % AllCol) - 2.5) * 38, 7 + ((~~(index / AllCol)) - 2.5) * 37);
   }
   /**通过真实坐标获取标号 */
   export function getIndext(p: Vec3): number {
      return (Math.floor(p.x / CardW) + 3) + (Math.floor(p.y / CardH) + 3) * AllCol;
   }
   export function getStartY() {
      return getPost(MaxIdnex).y;
   }
   /**是否同一行 */
   export function isRow(i1: number, i2: number): boolean {
      return ~~(i1 / AllCol) == ~~(i2 / AllCol);
   }
   /**是否相邻 */
   export function isAdjoin(i1: number, i2: number) {
      if (i1 - 1 == i2 || i1 + 1 == i2)
         return isRow(i1, i2);
      if (i1 - AllCol == i2 || i1 + AllCol == i2)
         return i2 >= 0 && i2 < MaxIdnex;
   }
   /**是否超出 */
   export function isOver(index: number) {
      return index < 0 || index >= MaxIdnex;
   }
   /**获取该类型颜色 */
   export function getColor(type: CardType): ColorType {
      return ((type - 1) % ColorNum) + 1;
   }

   /**根据数组概率，返回对应类型 */
   export function calPropBackType(arr: number[]) {
      let pa = 0;
      const pro = Math.random();
      for (let i = 0; i < arr.length; i++) {
         pa += arr[i];
         if (pro <= pa) {
            return i;
         }
      }
   }
}



