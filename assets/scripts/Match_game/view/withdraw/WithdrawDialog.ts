import { _decorator, Component, Node } from 'cc';
import { Sprite } from 'cc';
import { Button } from 'cc';
import { ViewManager } from '../../manager/ViewManger';
import { Label } from 'cc';
import { instantiate } from 'cc';
import { view } from 'cc';
import { Widget } from 'cc';
import { PayType, WithdrawUtil } from './WithdrawUtil';
import { WithdrawItem } from './WithdrawItem';
import { Prefab } from 'cc';
import { OrderItem } from './OrderItem';
import { WithdrawStorage } from './WithdrawStorage';
import { ButtonLock } from '../../../Match_common/Decorator';
import { i18n } from '../../../Match_common/i18n/I18nManager';
import { BaseStorageNS, ITEM_STORAGE } from '../../../Match_common/localStorage/BaseStorage';
import { LangStorage } from '../../../Match_common/localStorage/LangStorage';
import { EventTracking } from '../../../Match_common/native/EventTracking';
import { NumFont } from '../../../Match_common/ui/NumFont';
import ViewComponent from '../../../Match_common/ui/ViewComponent';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
import { MathUtil } from '../../../Match_common/utils/MathUtil';
import { GameStorage } from '../../GameStorage_Match';
const { ccclass, property } = _decorator;

@ccclass('WithdrawDialog')
export class WithdrawDialog extends ViewComponent {
    @property(Node)
    top: Node = null;
    @property(Node)
    content: Node = null;
    @property(NumFont)
    numMoney: NumFont = null;
    @property(NumFont)
    numCoin: NumFont = null;
    @property(NumFont)
    numPoints: NumFont = null;
    @property(Node)
    btnBack: Node = null;
    @property(Node)
    btnCash: Node = null;
    @property(Node)
    btnCoin: Node = null;
    @property(Node)
    btnOrder: Node = null;
    @property(Node)
    btnEdit: Node = null;
    @property([Node])
    contents: Node[] = [];
    @property(Node)
    moneyCards: Node = null;
    @property(Node)
    coinCards: Node = null;
    @property(Node)
    orderCards: Node = null;
    @property(Node)
    strEa: Node = null;
    @property(Label)
    cardId: Label = null;
    @property(Node)
    strOrderTips: Node = null;
    @property(Prefab)
    wi: Prefab = null;
    @property(Prefab)
    orderItem: Prefab = null;
    @property(Sprite)
    jd: Sprite = null;
    @property(Node)
    hand: Node = null;

    private btns: Node[] = [];
    private type: PayType;
    // private withdrawNums = [GameUtil.getCashNum(), GameUtil.getCashNum(3)];
    show(parent: Node, args?: any): void {
        super.show(parent);
        this.fit();
        this.btns = [this.btnCash, this.btnCoin, this.btnOrder];
        this.btnBack.on(Button.EventType.CLICK, this.back, this);
        this.btnEdit.on(Button.EventType.CLICK, this.onEdit, this);
        this.strEa.parent.on(Node.EventType.TOUCH_START, this.onEdit, this);
        this.btnCash.getChildByName("btn").on(Button.EventType.CLICK, () => { this.showContent(0) });
        this.btnCoin.getChildByName("btn").on(Button.EventType.CLICK, () => { this.showContent(1) });
        this.btnOrder.getChildByName("btn").on(Button.EventType.CLICK, () => { this.showContent(2);this.hand.active = false; });
        this.showContent(args.isCoin ? 1 : 0);

        this.init();
    }
    private fit() {
        const h = view.getVisibleSize().y;
        if (h > 2100) {
            const cha = 50;
            this.top.getComponent(Widget).top += cha;
            this.content.getComponent(Widget).top += cha;
        }
    }
    private init() {
        
        // const symbol = LangStorage.getData().symbol;
        // const cur = GameStorage.getMoney();
        // this.numMoney.num = symbol + " " + FormatUtil.toXXDXX(cur, 2, false);
        WithdrawUtil.moneyCash.forEach((v, i) => {
            // let item = this.moneyCards.children[0];
            // if (i > 0) {
            //     item = instantiate(item);
            //     this.moneyCards.addChild(item);
            // }
            // item.getChildByName("num").getComponent(NumFont).num = symbol + " " + FormatUtil.toXXDXX(MoneyManger.instance.rate(v), 0, false);
            const item = instantiate(this.wi);
            item.getComponent(WithdrawItem).init(() => { this.showMoneyAndCoin() },()=>{this.showMethod()});
            item.getComponent(WithdrawItem).setMoney(i);
            this.moneyCards.addChild(item);
        })

        // const curCoin = GameStorage.getCoin();
        // this.numCoin.num = FormatUtil.toXXDXX(curCoin, 0, false);
        WithdrawUtil.coinCash.forEach((v, i) => {
            // let item = this.coinCards.children[0];
            // if (i > 0) {
            //     item = instantiate(item);
            //     this.coinCards.addChild(item);
            // }
            // item.getChildByName("num").getComponent(NumFont).num = symbol + " " + FormatUtil.toXXDXX(MoneyManger.instance.rate(v.money), 0, false);
            // item.getChildByName("coin").getChildByName("num").getComponent(NumFont).num = FormatUtil.toXXDXX(v.coin, 0, false);
            // const btn = item.getChildByName("btn");
            // if (v.coin <= curCoin) {
            //     btn.getChildByName("btnGray").active = false;
            //     btn.on(Button.EventType.CLICK, this.waitWithdraw, this);
            // } else {
            //     btn.getChildByName("btnGray").active = true;
            // }
            const item = instantiate(this.wi);
            item.getComponent(WithdrawItem).init(() => { this.showMoneyAndCoin() },()=>{this.showMethod()});
            item.getComponent(WithdrawItem).setCoin(i);
            this.coinCards.addChild(item);
        })

        const activated = WithdrawStorage.getOrder().activated;
        if (activated?.length) {
            activated.forEach(v => {
                const item = instantiate(this.orderItem);
                item.getComponent(OrderItem).init(v,() => { this.showMoneyAndCoin() });
                this.orderCards.addChild(item);
            })
            this.orderCards.insertChild(this.strOrderTips,-1);
            this.hand.active = true;
        }
        this.showPayIcon();
        // const cardId = this.showCardId();
        // if (!cardId)
        //     this.onEdit();

        this.showMoneyAndCoin();
    }
    private showMoneyAndCoin() {
        const symbol = LangStorage.getData().symbol;
        const cur = GameStorage.getMoney();
        this.numMoney.num = symbol + " " + FormatUtil.toXXDXX(cur, 2, false);
        const curCoin = GameStorage.getCoin();
        this.numCoin.num = FormatUtil.toXXDXX(curCoin, 0, false);

        const points = WithdrawStorage.getPoints();
        this.numPoints.num = points;

        const n = WithdrawUtil.getCashNum();
        const pro = cur/n;
        this.jd.fillRange = pro;
    
         this.moneyCards.children.forEach((v) => {
            v.getComponent(WithdrawItem)?.setBtnCanClick();
        })
        this.coinCards.children.forEach((v) => {
            v.getComponent(WithdrawItem)?.setBtnCanClick();
        })

    }
    private showPayIcon() {
        const type = GameStorage.getPayType();
        this.moneyCards.children.forEach((v) => {
            // v.getChildByName("pay").getComponent(Sprite).spriteFrame = this.paySf[type - 1];
            v.getComponent(WithdrawItem)?.showPayIcon(type);
        })
        this.coinCards.children.forEach((v) => {
            // v.getChildByName("pay").getComponent(Sprite).spriteFrame = this.paySf[type - 1];
            v.getComponent(WithdrawItem)?.showPayIcon(type);
        })
        this.orderCards.children.forEach((v) => {
            // v.getChildByName("pay").getComponent(Sprite).spriteFrame = this.paySf[type - 1];
            v.getComponent(OrderItem)?.showPayIcon(type);
        })
    }
    private showMethod() {
        ViewManager.showWithdrawalMethodDialog(() => {
            this.showPayIcon();
        }, () => { this.showCardId() })
    }
    private back() {
        EventTracking.sendOneEvent("backHome");
        this.node.destroy();
    }
    @ButtonLock(0.5)
    private onEdit() {
        this.showMethod();
    }
    private showContent(index: number) {
        this.btns.forEach((v, i) => {
            v.getChildByName("select").active = i == index;
        })
        this.contents.forEach((v, i) => {
            v.active = i == index;
        })
        this.numCoin.node.parent.active = index == 1;
        this.numMoney.node.parent.active = index != 1;
    }
    /**排队提现 */
    private waitWithdraw() {
        let args = BaseStorageNS.getItem(ITEM_STORAGE.WAITWITHDRWW);
        let num: number;
        if (!args) {
            num = MathUtil.random(20000, 50000);
        } else {
            const t = JSON.parse(args);
            num = t.num;
            const time = t.time;
            const cha = (Date.now() - time) / (1000 * 60);
            const curNum = Math.round(num - Math.min(100, cha * MathUtil.random(1, 3)));
            num = Math.max(MathUtil.random(30, 100), curNum);
        }
        BaseStorageNS.setItem(ITEM_STORAGE.WAITWITHDRWW, JSON.stringify({ num, time: Date.now() }));
        ViewManager.showTips(i18n.string("str_twcynt", num.toString()));
    }
    private showCardId() {
        const cardId = GameStorage.getCardId();
        this.strEa.active = !cardId;
        this.cardId.node.active = !!cardId;
        this.cardId.string = cardId;
        return cardId;
    }
}


