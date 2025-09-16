import { _decorator, Component, Node } from 'cc';
import ViewComponent from '../../../Match_common/ui/ViewComponent';
import { Button } from 'cc';
import { AudioManager } from '../../manager/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('AskTips')
export class AskTips extends ViewComponent {
    @property(Node)
    btnConfirm:Node = null;
    @property(Node)
    btnCancel:Node = null;

    hide(){
        this.node.destroy();
    }
    show(parent:Node,args?:any){
        parent.addChild(this.node);
        this.btnConfirm.on(Button.EventType.CLICK,()=>{ AudioManager.playEffect("btn"); args.confirmCb?.();this.hide();})
        this.btnCancel.on(Button.EventType.CLICK,()=>{AudioManager.playEffect("btn"); args.cancelCb?.();this.hide();})
    }

}


