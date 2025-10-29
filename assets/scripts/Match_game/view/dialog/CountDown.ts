import { SpriteFrame } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import { Sprite } from 'cc';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { delay } from '../../../Match_common/utils/TimeUtil';
import { AudioManager } from '../../manager/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('CountDown')
export class CountDown extends DialogComponent {
    @property(Node)
    light: Node = null;
    @property(Node)
    num: Node = null;
    @property([SpriteFrame])
    sf: SpriteFrame[] = [];

    private cb: Function;
    showStart(args?: any): void {
        this.cb = args.cb;

        this.countDown();
    }
    private async countDown() {
        let time = 3;
        while (time > 0) {
            AudioManager.playEffect("pop");
            this.num.getComponent(Sprite).spriteFrame = this.sf[time-1];
            ActionEffect.fadeOut(this.light,0.8,true);
            ActionEffect.scale(this.light,0.8,1.5,1);
            ActionEffect.scale(this.num,0.3,1,1.3);
            time--;
            await  delay(1,this.node);
        }
        AudioManager.playEffect("ring");
        this.cb();
        this.closeAni();
    }
}


