import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import { Sprite } from 'cc';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { delay, tweenPromise } from '../../../Match_common/utils/TimeUtil';
import { v3 } from 'cc';
import { Bird } from '../component/Bird';
import { AudioManager } from '../../manager/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('ColorProp')
export class ColorProp extends DialogComponent {
    @property(Node)
    ball: Node = null;
    @property(Node)
    light: Node = null;
    @property(Node)
    board: Node = null;
    @property([Sprite])
    sds: Sprite[] = [];

    /**开始动画 */
    async startAni() {

    }
    async ani(ball: Node, groups: Bird[]) {
        const time = 0.3;
        
        AudioManager.playEffect("lightning");
        this.ball.position = UIUtils.transformOtherNodePos2localNode(ball, this.ball);
        ActionEffect.fadeIn(this.bg, time);
        ActionEffect.scale(this.ball, time, 1, 0.44);
        await tweenPromise(this.ball, t => t.to(0.5, { position: v3() }, { easing: "backOut" }));
        this.light.active = true;
        ActionEffect.scale(this.light, time, 1, 0, "backOut");
        await ActionEffect.fadeIn(this.light, 0.2);

        const bx = 0;
        const by = 0;
        const time1 = 0.05;
        const tx = 15;
        const ty = 15;
         tweenPromise(this.content, t => t
            .to(time1, { position: v3(bx + tx, by + ty) })
            .to(time1, { position: v3(bx + tx * 2, by) })
            .to(time1, { position: v3(bx + tx, by + ty) })
            .to(time1, { position: v3(bx, by) })

            .to(time1, { position: v3(bx + tx, by + ty) })
            .to(time1, { position: v3(bx + tx * 2, by) })
            .to(time1, { position: v3(bx + tx, by + ty) })
            .to(time1, { position: v3(bx, by) })

            .to(time1, { position: v3(bx + tx, by + ty) })
            .to(time1, { position: v3(bx + tx * 2, by) })
            .to(time1, { position: v3(bx + tx, by + ty) })
            .to(time1, { position: v3(bx, by) })

        )
        const sdt = 0.3;
        this.sds.forEach((v, i) => {
            const tr = v.fillStart == 0 ? 1 : -1;
            tweenPromise(v, tw => tw.to(sdt, { fillRange: tr }));
        })
        groups.forEach(v => v.colorClear(this.board));
        await delay(sdt + 0.1, this.node);
        this.closeAni();
    }

}


