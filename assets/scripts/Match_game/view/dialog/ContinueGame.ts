import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import { Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ContinueGame')
export class ContinueGame extends DialogComponent {
    @property(Node)
    btnNewGame:Node = null;
    @property(Node)
    btnYes:Node = null;


    showStart(args?: any): void {
        this.btnNewGame.on(Button.EventType.CLICK,()=>{
            if(this.isAni)return;
            args.cb();
            this.closeAni();
        });
        this.btnYes.on(Button.EventType.CLICK,()=>{
            if(this.isAni)return;
            args.continueCb();
            this.closeAni();
        });
    }
}


