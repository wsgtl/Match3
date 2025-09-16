import { _decorator, Component, Node } from 'cc';
import ViewComponent from '../../../Match_common/ui/ViewComponent';
import { CoinManger } from '../../manager/CoinManger';
import { Button } from 'cc';
import { adHelper } from '../../../Match_common/native/AdHelper';
import { ViewManager } from '../../manager/ViewManger';
import { MoneyManger } from '../../manager/MoneyManger';
import { GameStorage } from '../../GameStorage_Match';
import { RewardType } from '../../GameUtil_Match';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { LangStorage } from '../../../Match_common/localStorage/LangStorage';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { i18n } from '../../../Match_common/i18n/I18nManager';
const { ccclass, property } = _decorator;

@ccclass('CoinDialog')
export class CoinDialog extends ViewComponent {
    @property(Node)
    btnFree: Node = null;
    @property(Node)
    btnMoney1: Node = null;
    @property(Node)
    btnMoney2: Node = null;
    cb: Function;
    show(parent: Node, args?: any): void {
        super.show(parent);
        this.cb = args.cb;
    }
    protected onLoad(): void {
        CoinManger.instance.curTop.showBack(true, () => { this.node.destroy(); })
        this.btnFree.on(Button.EventType.CLICK, () => {
            adHelper.showRewardVideo("加金币弹窗", () => {
                this.click(0, 3000, this.btnFree)
            }, ViewManager.adNotReady);
        });
        // this.btnMoney1.on(Button.EventType.CLICK, () => { this.click(this.money1(), 10000,this.btnMoney1) });
        // this.btnMoney2.on(Button.EventType.CLICK, () => { this.click(this.money2(), 50000,this.btnMoney2) });
        this.setMoneyBtn(this.btnMoney1, 10, 10000);
        this.setMoneyBtn(this.btnMoney2, 50, 50000);
    }
    private click(money: number, addCoin: number, node: Node) {
        if (GameStorage.getMoney() < money) {
            // ViewManager.showTips(`Your money is less than $${money}.`);
            ViewManager.showTips(i18n.string("str_ymilt", (LangStorage.getData().symbol + money)));
            return;
        }
        MoneyManger.instance.addMoney(-money,false);
        this.cb?.();
        this.cb = null;
        const from = node.parent.getChildByName("yb");
        const to = CoinManger.instance.getCoinNode().coinNode;
        ActionEffect.scaleBigToSmall(from, 1.2, 1, 0.2);
        ViewManager.showRewardParticle(RewardType.coin, from, to, () => { CoinManger.instance.addCoin(addCoin, false); }, 0.4);
    }
    private setMoneyBtn(btn: Node, money: number, coin: number) {
        const data = LangStorage.getData()
        const moneys = Math.floor(money * data.rate);
        const n = btn.getChildByName("num").getComponent(NumFont);
        n.num = data.symbol + " " + moneys;
        btn.on(Button.EventType.CLICK, () => { this.click(moneys, coin, btn) });
    }
}


