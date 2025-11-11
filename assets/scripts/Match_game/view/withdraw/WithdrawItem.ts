import { SpriteFrame } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { PayType, WithdrawUtil } from './WithdrawUtil';
import { Button } from 'cc';
import { MoneyManger } from '../../manager/MoneyManger';
import { CoinManger } from '../../manager/CoinManger';
import { OrderData, WithdrawStorage } from './WithdrawStorage';
import { LangStorage } from '../../../Match_common/localStorage/LangStorage';
import { EventTracking } from '../../../Match_common/native/EventTracking';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
import { GameStorage } from '../../GameStorage_Match';
import { RewardType } from '../../GameUtil_Match';
import { ConfigConst } from '../../manager/ConfigConstManager';
const { ccclass, property } = _decorator;

@ccclass('WithdrawItem')
export class WithdrawItem extends Component {
    @property(NumFont)
    coinNumNode: NumFont = null;
    @property(NumFont)
    moneyNumNode: NumFont = null;
    @property(Node)
    btn: Node = null;
    @property(Node)
    normal: Node = null;
    @property(Sprite)
    jd: Sprite = null;
    @property(NumFont)
    jdNum: NumFont = null;
    @property(NumFont)
    timeNum: NumFont = null;
    @property(Node)
    activate: Node = null;
    @property(Sprite)
    pay: Sprite = null;
    @property([SpriteFrame])
    paySf: SpriteFrame[] = [];


    private index: number = 0;
    private moneyNum: number = 0;
    private coinNum: number = 0;
    private type: RewardType = 1;
    private canClick: boolean = false;
    private curOrder: OrderData;
    private isWaitActivate: boolean = false;//卡片是否为待激活
    private showMoneyAndCoinCb: Function;
    private showMethodCb: Function;
    protected onLoad(): void {
        this.btn.on(Button.EventType.CLICK, this.onWithdraw, this);
    }
    protected onDestroy(): void {
        // this.btn.off(Button.EventType.CLICK, this.onWithdraw, this);
    }
    init(cb: Function, showMethodCb: Function) {
        this.showMoneyAndCoinCb = cb;
        this.showMethodCb = showMethodCb;
    }
    /**钱提现item */
    setMoney(index: number) {
        this.type = RewardType.money;
        this.index = index;
        const d = WithdrawUtil.moneyCash[index];
        this.moneyNum = d * LangStorage.getData().rate;
        this.moneyNumNode.num = FormatUtil.toMoney(this.moneyNum);
        this.curOrder = WithdrawUtil.findInOrder(this.moneyNum, this.coinNum);
        if (this.curOrder) {
            this.setActivate();
        }

        this.coinNumNode.node.parent.active = false;
        this.btn.y = 0;

        this.setBtnCanClick();
        // const curMoney = GameStorage.getMoney();

        // if (d <= curMoney) {
        //     this.setBtnCanClick();
        // }
    }
    /**金币提现item */
    setCoin(index: number) {
        this.type = RewardType.coin;
        this.index = index;
        const d = WithdrawUtil.coinCash[index];
        this.moneyNum = d.money * LangStorage.getData().rate;
        this.coinNum = d.coin;
        this.curOrder = WithdrawUtil.findInOrder(this.moneyNum, this.coinNum);
        if (this.curOrder) {
            this.setActivate();
        }

        this.moneyNumNode.num = FormatUtil.toMoney(this.moneyNum);
        this.coinNumNode.num = d.coin;
        this.setBtnCanClick();
        //  if (d.coin <= GameStorage.getCoin()) {
        //     this.setBtnCanClick();
        // }
    }
    setBtnCanClick() {
        if (this.type == RewardType.coin) this.canClick = this.coinNum <= GameStorage.getCoin();
        else this.canClick = this.moneyNum <= GameStorage.getMoney();
        this.btn.getChildByName("btnGray").active = !this.canClick;
    }
    showPayIcon(type: PayType) {
        this.pay.spriteFrame = this.paySf[type - 1];
    }
    //提现
    onWithdraw() {
        if (!this.canClick) return;
        if (!WithdrawStorage.getCardId()) { this.showMethodCb(); return; }//没有填银行卡跳转弹窗
        if (this.type == RewardType.coin) CoinManger.instance.addCoin(-this.coinNum);
        else MoneyManger.instance.addMoney(-this.moneyNum);
        this.showMoneyAndCoinCb();
        const orders = WithdrawStorage.getOrder();
        const t = WithdrawUtil.getCurSecond();
        this.curOrder = {
            isActivate: false,
            status: 0,
            createTime: t,
            canActivateTime: t + WithdrawUtil.ActivateTimes,
            activateTime: 0,
            waitTime: 0,
            playTimes: 0,
            queue: 0,
            money: this.moneyNum,
            coin: this.coinNum
        };
        orders.inactive.push(this.curOrder);
        WithdrawStorage.saveLocal();
        this.setActivate();
        EventTracking.sendEventOrder("withdraw",this.curOrder);
    }
    /**设置为卡片待激活状态 */
    setActivate() {
        //先判断是否过期
        const cur = WithdrawUtil.getCurSecond();
        if (this.curOrder) {
            this.isWaitActivate = this.curOrder.canActivateTime > cur;
            if (!this.isWaitActivate) {//订单过期，返回钱或金币
                // const order = WithdrawStorage.getOrder();
                // for (let i = order.inactive.length - 1; i >= 0; i--) {
                //     const a = order.inactive[i];
                //     if (a.money == this.curOrder.money && a.coin == this.curOrder.coin) {//删除过期订单
                //         order.inactive.splice(i, 1);
                //         WithdrawStorage.saveLocal();
                //     }
                // }
                // if (this.curOrder.coin > 0) {//金币订单，返回金币
                //     CoinManger.instance.addCoin(this.curOrder.coin);
                // } else {//钱订单，返回钱
                //     MoneyManger.instance.addMoney(this.curOrder.money);
                // }
                // this.showMoneyAndCoinCb();
                this.outtimeBack();
            }
        } else {
            this.isWaitActivate = false;
        }
        this.showOrder();
    }
    private showOrder() {
        this.normal.active = !this.isWaitActivate;
        this.activate.active = this.isWaitActivate;
        if (this.isWaitActivate) {
            this.jdNum.num = this.curOrder.playTimes + "l" + ConfigConst.Other.ActivatePlay;
            this.jd.fillRange = this.curOrder.playTimes / ConfigConst.Other.ActivatePlay;
        }
    }
    protected update(dt: number): void {
        if (!this.isWaitActivate || !this.curOrder) return;
        if (WithdrawUtil.getCurSecond() >= this.curOrder.canActivateTime) {
            this.isWaitActivate = false;
            this.outtimeBack();
            this.showOrder();
            return;
        }
        this.timeNum.num = WithdrawUtil.colActivateTime(this.curOrder.canActivateTime);
    }
    /**订单过期返回钱或金币 */
    private outtimeBack() {
        const order = WithdrawStorage.getOrder();
        for (let i = order.inactive.length - 1; i >= 0; i--) {
            const a = order.inactive[i];
            if (a.money == this.curOrder.money && a.coin == this.curOrder.coin) {//删除过期订单
                order.inactive.splice(i, 1);
                WithdrawStorage.saveLocal();
            }
        }
        if (this.curOrder.coin > 0) {//金币订单，返回金币
            CoinManger.instance.addCoin(this.curOrder.coin);
        } else {//钱订单，返回钱
            MoneyManger.instance.addMoney(this.curOrder.money);
        }
        this.showMoneyAndCoinCb();
        EventTracking.sendEventOrder("timeout",this.curOrder);
        this.curOrder = null;
    }
}


