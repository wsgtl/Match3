import { Node } from "cc";
import { ViewManager } from "./ViewManger";
import { GameStorage } from "../GameStorage_Match";
import { Coin } from "../view/component/Coin";
import { isVaild } from "../../Match_common/utils/ViewUtil";
import { Top } from "../view/component/Top";
import { MathUtil } from "../../Match_common/utils/MathUtil";
import { ActionEffect } from "../../Match_common/effects/ActionEffect";

export class CoinManger {
    public static _instance: CoinManger = null;
    public static get instance(): CoinManger {
        if (!this._instance) {
            this._instance = new CoinManger();
        }
        return this._instance;
    }
    public curTop: Top;
    private _curDialog: Node = null;
    private _curCoin: Coin = null;
    /**记录当前弹窗，防止显示多个 */
    public setDialog(cur: Node) {
        this._curDialog = cur;
    }
    /**记录当前金币节点 */
    public setCoinNode(cur: Coin) {
        this._curCoin = cur;
    }
    /**获取当前金币节点 */
    public getCoinNode() {
        return this._curCoin;
    }
    /**显示弹窗 */
    public showDialog() {
        if (!this._curDialog) {//已经有弹窗不显示
            ViewManager.showCoinDialog(null);
        }
    }
    /**增加金币 */
    public addCoin(num: number, isShow: boolean = true) {
        const last = GameStorage.getCoin();
        const cur = GameStorage.addCoin(num);
        if (isShow) {//立即显示
            if (isVaild(this._curCoin)) {
                this._curCoin.showCurCoin();
            }
        }else{
            ActionEffect.numAddAni(last,cur,(n:number)=>{this.showNum(n)},true);
        }
    }
    public showNum(num: number) {
        if (isVaild(this._curCoin)) {
            this._curCoin.showNum(num);
        }
    }
    public showCurNum() {
        if (isVaild(this._curCoin)) {
            this._curCoin.showCurCoin();
        }
    }
    /**获取奖励金币 */
    public getReward() {
        return MathUtil.random(5, 20) * 1000;
    }
}