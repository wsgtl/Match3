import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import ViewComponent from '../../../Match_common/ui/ViewComponent';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { tween } from 'cc';
import { Sprite } from 'cc';
import { delay, tweenPromise } from '../../../Match_common/utils/TimeUtil';
import { ViewManager } from '../../manager/ViewManger';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { AudioManager } from '../../manager/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('GoldRewardChange')
export class GoldRewardChange extends ViewComponent {
    @property(Node)
    bg: Node = null;
    @property(Node)
    di: Node = null;
    @property(Node)
    lotus: Node = null;
    @property(Node)
    light: Node = null;
    @property(Node)
    circle: Node = null;

    private cb: Function;
    showStart(args?: any): void {
        this.cb = args.cb;
        this.ani();
    }

    async ani() {
        AudioManager.vibrate(100,255);
        AudioManager.playEffect("goldChange");
        this.circle.active = false;
        UIUtils.setAlpha(this.light,0);
        ActionEffect.fadeIn(this.bg, 0.8);


        ActionEffect.scale(this.lotus, 0.6, 1, 0, "backOut");
        ActionEffect.moveTo(this.lotus, 0.3, 0, 100);
        const sp = this.di.getComponent(Sprite);
        sp.fillRange = 0;
        tweenPromise(sp,t=>t.to(0.4, { fillRange: 1 }));
        // tween(sp)
        //     .to(0.4, { fillRange: 1 })
        //     .start();
        delay(0.3, this.node).then(() => {
            ActionEffect.fadeIn(this.light, 0.3);
            ActionEffect.scale(this.light, 0.5, 1.2, 0, "backOut");
        })
        await delay(0.8, this.node);
        ActionEffect.scale(this.light, 0.6, 0);
        ActionEffect.angle(this.light, -100, 0.6);
        await delay(0.2, this.node);
        ViewManager.showGoldRewardDialog(this.cb);
        this.circle.active = true;
        ActionEffect.angle(this.circle, -500, 1,"quadIn");
        ActionEffect.scale(this.circle, 1, 3, 0);
        await delay(0.7);

        await ActionEffect.fadeOut(this.node, 0.3);
        this.node.destroy();

    }
}


