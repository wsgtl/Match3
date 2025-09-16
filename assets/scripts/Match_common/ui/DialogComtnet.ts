import { _decorator, Component, Node } from 'cc';
import ViewComponent from './ViewComponent';
import { ActionEffect } from '../effects/ActionEffect';
import { Button } from 'cc';
import { delay } from '../utils/TimeUtil';
import { NativeFun } from '../native/NativeFun';
import { AudioManager } from '../../Match_game/manager/AudioManager';
const { ccclass, property } = _decorator;

export class DialogComponent extends ViewComponent {
    @property(Node)
    content: Node = null;
    @property(Node)
    bg: Node = null;
    @property(Node)
    btnClose: Node = null;

    isAni: boolean = false;
    closeCb:Function=null;
    start() {
        this.startAni();
        this.node.on(Node.EventType.TOUCH_START, () => { });
        this.btnClose && this.btnClose.on(Button.EventType.CLICK, this.closeAni, this);
    }
    /**开始动画 */
    async startAni() {
        const time = 0.3;
        if (this.bg) ActionEffect.fadeIn(this.bg, 0.3);
        if (this.content) ActionEffect.scale(this.content, 0.3, 1, 0, "backOut");
        if (this.bg || this.content) {
            this.isAni = true;
            await delay(time);
            this.isAni = false;
        }
    }
    /**关闭动画 */
    async closeAni() {
        if (this.isAni) return;
        // AudioManager.vibrate(1,155);
        this.isAni = true;
        await ActionEffect.fadeOut(this.node, 0.3);
        this.node.destroy();
        this.closeCb?.();
    }

}


