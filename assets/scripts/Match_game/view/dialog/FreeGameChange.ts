import { _decorator, Component, Node } from 'cc';
import ViewComponent from '../../../Match_common/ui/ViewComponent';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { delay } from '../../../Match_common/utils/TimeUtil';
import { view } from 'cc';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { AudioManager } from '../../manager/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('FreeGameChange')
export class FreeGameChange extends ViewComponent {
    @property(Node)
    line:Node = null;
    @property(Node)
    left:Node = null;
    @property(Node)
    right:Node = null;
    cb:Function;
    chagneCb:Function;
    showStart(args?: any): void {
        this.cb = args.cb;
        this.chagneCb = args.chagneCb;
        this.ani();
}
    private async ani(){
        this.line.active = false;
        const bx = 540;
        this.left.x = -bx;
        this.right.x = bx;
        const h = view.getVisibleSize().y;
        if(h>2300){
            UIUtils.setHeight(this.left,h);
            UIUtils.setHeight(this.right,h);
            UIUtils.setHeight(this.line,h);
        }
        AudioManager.playEffect("closedoor");
        const d1 = 0.3;
        ActionEffect.moveTo(this.left,d1,0,0);
        await ActionEffect.moveTo(this.right,d1,0,0);
        this.line.active = true;
        AudioManager.vibrate(300,155);
        this.chagneCb();
        await delay(0.4);
        AudioManager.playEffect("opendoor");
        const d2 = 0.4;
        ActionEffect.fadeOut(this.line,0.1);
        ActionEffect.moveTo(this.left,d2,-bx,0);
        await ActionEffect.moveTo(this.right,d2,bx,0);
        this.node.destroy();
        this.cb();
    }
}


