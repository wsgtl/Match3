import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { delay, tweenPromise } from '../../../Match_common/utils/TimeUtil';
import { v3 } from 'cc';
import { AudioManager } from '../../manager/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('ShuffleProp')
export class ShuffleProp extends DialogComponent {
    @property(Node)
    wind: Node = null;
    @property(Node)
    shuffle: Node = null;

    /**开始动画 */
    async startAni() {

    }
    async ani(shuffle: Node,board:Node) {
        this.wind.scale=v3();
        this.content.y = UIUtils.transformOtherNodePos2localNode(board, this.node).y;
        const time = 0.3;
        this.shuffle.position = UIUtils.transformOtherNodePos2localNode(shuffle, this.shuffle);
        ActionEffect.fadeIn(this.bg, time);
        ActionEffect.scale(this.shuffle, time, 1, 0.44);
        await tweenPromise(this.shuffle, t => t.to(0.5, { position: v3() }, { easing: "backOut" }));
        AudioManager.vibrate(300,100);
        AudioManager.playEffect("shuffle");
        tweenPromise(this.shuffle, t => t.to(0.3, { angle:360,scale:v3() }));
        tweenPromise(this.wind, t => t.to(0.8, { angle:720,scale:v3(1.2,1.2) }));//风旋转
        await delay(0.5);
        this.closeAni();
    }
}


