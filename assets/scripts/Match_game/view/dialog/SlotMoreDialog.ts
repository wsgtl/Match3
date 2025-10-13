import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import { Button } from 'cc';
import { ViewManager } from '../../manager/ViewManger';
const { ccclass, property } = _decorator;

@ccclass('SlotMoreDialog')
export class SlotMoreDialog extends DialogComponent {
    @property(Node)
    btnClaim:Node = null;

    protected onLoad(): void {
        this.btnClaim.on(Button.EventType.CLICK,this.onClaim,this);
    }
    protected onDestroy(): void {
        this.btnClaim.off(Button.EventType.CLICK,this.onClaim,this);
    }
    onClaim(){
        if(this.isAni)return;
        this.closeAni();
        ViewManager.showSlotDialog(null);
    }
}


