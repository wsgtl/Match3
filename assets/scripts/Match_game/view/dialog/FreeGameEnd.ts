import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import { Button } from 'cc';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
import { LangStorage } from '../../../Match_common/localStorage/LangStorage';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { delay, tweenPromise } from '../../../Match_common/utils/TimeUtil';
import { v3 } from 'cc';
import { Sprite } from 'cc';
import { isVaild } from '../../../Match_common/utils/ViewUtil';
import { AudioManager } from '../../manager/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('FreeGameEnd')
export class FreeGameEnd extends DialogComponent {
    @property(NumFont)
    coin: NumFont = null;
    @property(NumFont)
    money: NumFont = null;
    @property(Node)
    btnCollect: Node = null;
    @property(Sprite)
    btnMask: Sprite = null;
    @property([Node])
    aniNodes: Node[] = [];

    private cb: Function;
    private coinNum: number;
    private moneyNum: number;
    show(parent: Node, args?: any): void {
        super.show(parent);
        this.coinNum = args.coin;
        this.moneyNum = args.money;
        this.cb = args.cb;

        this.coin.num = "";
        this.money.num = "";

        this.btnCollect.on(Button.EventType.CLICK, this.onCollect, this);
    }
    private numAni() {
        ActionEffect.numAddAni(0, this.coinNum, (n: number) => {
            this.coin.num = FormatUtil.toXXDXX(n, 0);
        }, true, 20);
        ActionEffect.numAddAni(0, this.moneyNum, (n: number) => {
            this.money.num = LangStorage.getData().symbol + " " + FormatUtil.toXXDXXxsd(n);
        }, false, 10);

    }
    async onCollect() {
        if (this.isAni) return;
        this.isAni = true;
        this.btnCollect.getComponent(Button).interactable=false;
        await this.closeAni();
        this.cb?.();
    }
    /**开始动画 */
    async startAni() {
        AudioManager.playEffect("gufen");
        this.isAni = true;
        if (this.bg) ActionEffect.fadeIn(this.bg, 0.3);
        const waitTimes = [0, 0.2, 0.25, 0.3, 0.3, 0.4, 0.4];//各个动画节点等待出现时机
        const bigs = [1.3, 1.2, 1.2, 1.2, 1.3, 1.1, 1.1];//各个动画节点最大
        this.aniNodes.forEach(async (v, i) => {
            v.scale = v3();
            await delay(waitTimes[i]);
            ActionEffect.scaleBigToSmall(v, bigs[i], 1, 0.6);
        })
        delay(0.5).then(() => {
            this.numAni();
        })
        await delay(1, this.node);
        this.isAni = false;
        this.waitBtn();
    }
    /**关闭动画 */
    async closeAni() {
        // if (this.isAni) return;
        // this.isAni = true;
        ActionEffect.fadeOut(this.bg, 1);
        const waitTimes = [0.4, 0.3, 0.25, 0.2, 0, 0];//各个动画节点等待出现时机
        this.aniNodes.forEach(async (v, i) => {
            await delay(waitTimes[i]);
            ActionEffect.scale(v, 0.4, 0, 1, "backIn");
        })
        await delay(1, this.node);

        this.node.destroy();
        this.closeCb?.();
    }
    async waitBtn() {
        const duration = 3;
        tweenPromise(this.btnMask, t => t.to(duration, { fillRange: 1 })).then(async () => {
            if (isVaild(this.node)) {
                this.onCollect();
            }
        })
    }
}

