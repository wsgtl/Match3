import { _decorator, Component, Node } from 'cc';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
import { v3 } from 'cc';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
const { ccclass, property } = _decorator;

@ccclass('WinNum')
export class WinNum extends Component {
    @property(NumFont)
    winCoin: NumFont = null;
    @property(NumFont)
    winMoney: NumFont = null;


    public coinNum: number = 0;
    public moneyNum: number = 0;
    public addWinCoin(num: number) {
        const last = this.coinNum;
        this.coinNum += num;
        ActionEffect.numAddAni(last, this.coinNum, (n: number) => { this.showWinCoin(n) }, true);
        // this.showWinCoin(this.coinNum);
    }
    public addWinMoney(num: number) {
        const last = this.moneyNum;
        this.moneyNum += num;
        ActionEffect.numAddAni(last, this.moneyNum, (n: number) => { this.showWinMoney(n) });
        // this.showWinMoney(this.moneyNum);
    }
    public showWinCoin(num: number = 0) {
        // this.winCoin.node.parent.active = v;
        this.winCoin.num = "+" + num;
        this.showWinNodeScale(this.winCoin.node.parent);
    }
    public showWinMoney(moneyNum: number) {
        this.winMoney.num = "+" + FormatUtil.toXXDXXxsd(moneyNum);
        this.showWinNodeScale(this.winMoney.node.parent);
    }
    public showWinNormal() {
        this.winCoin.node.parent.active = false;
        this.winMoney.node.parent.active = false;
        this.node.scale = v3(1, 1, 1);
        this.winCoin.num = 0;
        this.winMoney.num = 0;
        this.coinNum = 0;
        this.moneyNum = 0;
    }
    public showWinNodeScale(node: Node) {
        this.node.active = true;
        node.active = true;
        let num = 0;
        if (this.winCoin.node.parent.active) num++;
        if (this.winMoney.node.parent.active) num++;
        const sc = num == 1 ? 1.5 : 1;//只有一个就变大显示
        ActionEffect.scale(this.node, 0.1, sc, this.node.scale.x);
    }
}


