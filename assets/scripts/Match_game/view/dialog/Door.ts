import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { delay, tweenPromise } from '../../../Match_common/utils/TimeUtil';
import { v3 } from 'cc';
import { ViewManager } from '../../manager/ViewManger';
const { ccclass, property } = _decorator;

@ccclass('Door')
export class Door extends DialogComponent {
    @property(Node)
    xz: Node = null;

    private cb: Function;
    showStart(args?: any): void {
        this.cb = args.cb;
    }
    /**开始动画 */
    async startAni() {
        const time = 0.3;
        ActionEffect.fadeIn(this.bg, 0.3);
        ActionEffect.scale(this.content, 0.3, 1, 0, "backOut");

        this.isAni = true;
        
        await delay(0.3);
        this.xz.active = true;
        this.xz.scale=v3();
        tweenPromise(this.xz,tw=>tw.to(1.2,{angle:-720,scale:v3(1,1,1)}))
        await delay(0.9);
        this.isAni = false;
        this.closeAni();
        ViewManager.showGoldRewardDialog(this.cb);
    }
}


