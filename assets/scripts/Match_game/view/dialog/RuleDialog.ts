import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import { PageView } from 'cc';
import { Button } from 'cc';
import { tweenPromise } from '../../../Match_common/utils/TimeUtil';
import { RewardType } from '../../GameUtil_Match';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
const { ccclass, property } = _decorator;

@ccclass('RuleDialog')
export class RuleDialog extends DialogComponent {
    @property(Node)
    views: Node = null;
    @property(Node)
    indicator: Node = null;
    // @property(Node)
    // btnBack:Node=null;
    @property(Node)
    btnLeft: Node = null;
    @property(Node)
    btnRight: Node = null;

    protected onLoad(): void {
        this.showBtns();
        this.btnLeft.on(Button.EventType.CLICK, () => { this.moveTo(this.index - 1) });
        this.btnRight.on(Button.EventType.CLICK, () => { this.moveTo(this.index + 1) });
        this.content.on(Node.EventType.TOUCH_START,this.touchStart,this);
        this.content.on(Node.EventType.TOUCH_MOVE,this.touchMove,this);
    }
    protected onDestroy(): void {
        
    }
    private index: number = 0;
    private getX(index: number) {
        return -index * 1080;
    }
    private async moveTo(i: number) {
        if (this.isAni) return;
        if(i<0||i>2)return;
        this.index = i;
        const x = this.getX(this.index);
        await tweenPromise(this.views, t => t.to(0.3, { x }))
        this.showBtns();
        this.isAni = false;
        this.tx = 0;
    }
    private showBtns() {
        this.btnLeft.active = this.index > 0;
        this.btnRight.active = this.index < 2;
        this.indicator.children.forEach((v,i)=>{
            v.getChildByName("dot").active = i==this.index;
        })
    }
    private tx=0;
    private touchStart(t){
        // if(this.isAni)return;
        this.tx = UIUtils.touchNodeLocation(this.views,t).x;
    }
    private touchMove(t){
        if(this.isAni||this.tx==0)return;
        const x = UIUtils.touchNodeLocation(this.views,t).x;
        const cha = this.tx-x;
        if(Math.abs(cha)>100){
            this.tx = 0;
            this.moveTo(this.index +(cha<0?-1:1));
        }
    }
}


