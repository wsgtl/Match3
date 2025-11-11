import { _decorator, Component, Node } from 'cc';
import { JakcpotType } from '../../GameUtil_Match';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { Button } from 'cc';
import { MoneyManger } from '../../manager/MoneyManger';
import { delay } from '../../../Match_common/utils/TimeUtil';
import { instantiate } from 'cc';
import { MathUtil } from '../../../Match_common/utils/MathUtil';
import { v3 } from 'cc';
import { tween } from 'cc';
import { isVaild } from '../../../Match_common/utils/ViewUtil';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
import { LangStorage } from '../../../Match_common/localStorage/LangStorage';
import { AudioManager } from '../../manager/AudioManager';
import { adHelper } from '../../../Match_common/native/AdHelper';
import { ViewManager } from '../../manager/ViewManger';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { CoinManger } from '../../manager/CoinManger';
import { WithdrawUtil } from '../withdraw/WithdrawUtil';
import { ConfigConst } from '../../manager/ConfigConstManager';
const { ccclass, property } = _decorator;

@ccclass('JackpotDialog')
export class JackpotDialog extends DialogComponent {
    @property(Node)
    yb: Node = null;
    @property(Node)
    ybs: Node = null;
    @property(Node)
    btnClaim: Node = null;
    @property(Node)
    btnNt: Node = null;
    @property(NumFont)
    num: NumFont = null;
    @property(NumFont)
    numBtn: NumFont = null;
    @property([Node])
    jackpots: Node[] = [];

    type: JakcpotType;
    coinNum: number;
    moneyNum:number;
    cb: Function
    show(parent: Node, args?: any) {
        parent.addChild(this.node);
        this.cb = args.cb;
        this.init(args.type, args.num);
    }
    init(type: JakcpotType, num: number) {
        // const data = LangStorage.getData();
        this.type = type;
        this.coinNum = num;
        this.jackpots.forEach((v, i) => {
            v.active = i + 1 == type;
        })
        this.num.aligning = 1;
        // this.num.num = data.symbol + FormatUtil.toXXDXX(num, 6);
        // this.num.num = FormatUtil.toXXDXX(num,0,false);
        this.moneyNum = MoneyManger.instance.getReward(ConfigConst.MoneyBls.Mini);
        const data = LangStorage.getData();
        // this.numBtn.num = data.symbol + " " + FormatUtil.toXXDXXxsd(this.moneyNum);
        this.numBtn.num = FormatUtil.toMoney(this.moneyNum);
        ActionEffect.numAddAni(0, num, (n: number) => {if(isVaild(this.node)) this.num.num = FormatUtil.toXXDXX(n, 0, false); }, true, 29, this.node);
        this.btnClaim.on(Button.EventType.CLICK, this.onClaim, this);
        this.btnNt.once(Button.EventType.CLICK, this.onNothink, this);
        this.ani();

    }
    /**开始动画 */
    async startAni() {
        UIUtils.setAlpha(this.node, 0);
        await delay(0.4);
        AudioManager.vibrate(400, 155);
        AudioManager.playEffect("happy1");
        UIUtils.setAlpha(this.node, 1);
        const time = 0.3;
        if (this.bg) ActionEffect.fadeIn(this.bg, 0.3);
        if (this.content) ActionEffect.scale(this.content, 0.3, 1, 0, "backOut");
        if (this.bg || this.content) {
            this.isAni = true;
            await delay(time);
            this.isAni = false;
        }
    }
    async ani() {
        // this.btnNt.active = false;
        // delay(1.5).then(() => {
        //     if (this.btnNt)
        //         this.btnNt.active = true;
        // })
        this.createYb();
    }
    async createYb() {
        // if (!isVaild(this.node)) return;
        // const yb = instantiate(this.yb);
        // yb.active = true;
        // yb.y = 1200 + MathUtil.random(0, 100);
        // yb.x = MathUtil.random(-400, 400);
        // const sc = MathUtil.random(10, 20) / 10;
        // yb.scale = v3(sc, sc);
        // yb.angle = MathUtil.random(0, 100);
        // this.ybs.addChild(yb);
        // const angle = MathUtil.randomOne() * MathUtil.random(100, 300);
        // tween(yb)
        //     .by(1, { y: -1200, angle: angle })
        //     .call(() => { yb.destroy(); })
        //     .start();
        // await delay(0.2, this.node);
        // this.createYb();
    }
    onClaim() {
        if(this.isAni)return;
        const jack = ["grand", "major", "mini"][this.type - 1];
        adHelper.showRewardVideo(jack + "奖池领取", () => {
            // MoneyManger.instance.addMoney(this.money);
            CoinManger.instance.addCoin(this.coinNum);
            // MoneyManger.instance.addMoney(this.moneyNum);
            this.cb(this.moneyNum);
            this.closeAni();
        }, ViewManager.adNotReady);

    }
    onNothink() {
        if(this.isAni)return;
        CoinManger.instance.addCoin(this.coinNum);
        this.closeAni();
        adHelper.timesToShowInterstitial();
        // this.cb();
    }
}

