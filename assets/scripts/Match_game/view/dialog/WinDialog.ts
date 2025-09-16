import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import { v3 } from 'cc';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { AudioManager } from '../../manager/AudioManager';
import { sp } from 'cc';
import { isVaild } from '../../../Match_common/utils/ViewUtil';
import { adHelper } from '../../../Match_common/native/AdHelper';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
import { MathUtil } from '../../../Match_common/utils/MathUtil';
import { Tween } from 'cc';
import { delay } from '../../../Match_common/utils/TimeUtil';
const { ccclass, property } = _decorator;

@ccclass('WinDialog')
export class WinDialog extends DialogComponent {
    @property(NumFont)
    num: NumFont = null;
    @property(sp.Skeleton)
    sk: sp.Skeleton = null;
    @property([sp.SkeletonData])
    skdata: sp.SkeletonData[] = [];

    private static lastAniTime: number = 0;
    start(): void {
        super.start();
        AudioManager.playEffect("win");
        this.bg.on(Node.EventType.TOUCH_START, () => {
            this.closeAni();
        });
    }
    private coinNum: number = 0;
    async ani(num: number) {
        this.coinNum = num;
        // this.num.num = "";
        this.num.num = 0;

        // const times = Math.max(20, Math.floor((num / 45555) * 20));
        // ActionEffect.numAddAni(0, num, (n: number) => { this.setNum(n); }, true, times, this.num.node);
        this.numAni();
        await ActionEffect.skAniOnce(this.sk, "start", true);
        ActionEffect.skAni(this.sk, "loop");

    }
    private isStopGf: boolean = false;
    /**滚分动画 */
    private async numAni() {
        const end = this.coinNum;
        const start = 0;
        const all = MathUtil.mm(Math.floor((end / 125553) * 20), 25, 60);
        const item = (end - start) / all;
        for (let i = 1; i <= all; i++) {
            let cur = i == all ? end : start + i * item;
            cur = Math.floor(cur);
            this.setNum(cur);
            if (i != all) {
                await delay(0.05, this.num.node);
                AudioManager.playEffect("gf1", 0.3);
            }

        }
        AudioManager.playEffect("coin");
        // this.isStopGf = true;
        this.closeAni();
    }
    /**关闭动画 */
    async closeAni() {
        if (this.isAni) return;
        this.isAni = true;
        if (!this.isStopGf) {
            this.setNum(this.coinNum);
            Tween.stopAllByTarget(this.num.node);
            AudioManager.playEffect("coin");
            await delay(1);
        }


        AudioManager.playEffect("darts");
        await ActionEffect.skAniOnce(this.sk, "end", true);
        await ActionEffect.fadeOut(this.node, 0.2);
        this.node.destroy();
        this.closeCb?.();
        if (MathUtil.probability(0.9)) {
            const cur = Date.now();
            const t = cur - WinDialog.lastAniTime;
            if (t > 180 * 1000) {//时间内不会重复弹
                adHelper.showInterstitial("大赢界面");
                WinDialog.lastAniTime = cur;
            }

        }

    }
    private setNum(n: number) {
        if (this.num) this.num.num = FormatUtil.toXXDXX(n, 0);
    }

    show(parent: Node, args?: any) {
        parent.addChild(this.node);
        this.closeCb = args.cb;
        const type = args.type;
        // const type = MathUtil.random(1,2);
        this.sk.skeletonData = this.skdata[type - 1];

        const path = ["root/all/all4/shengli_5/shengli_7", "root/all/x_001/x_005/x_030"][type - 1];
        const sockets = [new sp.SpineSocket(path, this.num.node.parent)];
        // this.sk.sockets.push(new sp.SpineSocket(path,this.num.node));//如果只是push(),就不会更新挂点
        this.sk.sockets = sockets;//必须整个挂点数组替换才能更新，如果只是push(),就不会更新挂点
        this.ani(args.num);
    }

}


