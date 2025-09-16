import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import ViewComponent from '../../../Match_common/ui/ViewComponent';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { tween } from 'cc';
import { UIOpacity } from 'cc';
import { Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TipsBar')
export class TipsBar extends ViewComponent {
    @property(Node)
    bg: Node = null;
    @property(Label)
    tips: Label = null;


    

    show(parent:Node,args?:any){
        parent.addChild(this.node);
        this.tips.string = args.tips;
        this.tips.updateRenderData();
        UIUtils.setHeight(this.bg,UIUtils.getHeight(this.tips.node)+30);
        
        const op = this.node.getComponent(UIOpacity);
        Tween.stopAllByTarget(op);
        op.opacity = 255;
        
        tween(op)
        .to(args.duration,{opacity:0},{easing:"cubicIn"})
        .call(()=>{this.node.removeFromParent()})
        .start();
    }

}
