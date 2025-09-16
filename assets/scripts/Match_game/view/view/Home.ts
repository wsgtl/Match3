import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { ViewManager } from '../../manager/ViewManger';
import ViewComponent from '../../../Match_common/ui/ViewComponent';
import { adHelper } from '../../../Match_common/native/AdHelper';
import { GameUtil } from '../../GameUtil_Match';
import { GuideManger } from '../../manager/GuideManager';
import { NativeFun } from '../../../Match_common/native/NativeFun';
import { ButtonLock } from '../../../Match_common/Decorator';
const { ccclass, property } = _decorator;

@ccclass('Home')
export class Home extends ViewComponent {
    @property(Node)
    btnStart: Node = null;
    @property(Node)
    dialogNode: Node = null;
    @property(Node)
    upDialogNode: Node = null;
    @property(Node)
    btnSignin: Node = null;
    @property(Node)
    btnCash: Node = null;
    @property(Node)
    btnTask: Node = null;
    @property(Node)
    btnH5: Node = null;
    @property(Node)
    btnShop: Node = null;

    show(parent: Node, args?: any) {
        parent.addChild(this.node);

        // adHelper.init();
        ViewManager.setDialogNode(this.dialogNode);
        ViewManager.setUpDialogNode(this.upDialogNode);
    }
    onLoad() {
        this.btnStart.on(Button.EventType.CLICK, this.onStart,this);

    }
    @ButtonLock(1)
    onStart(){
        ViewManager.showGameView()
    }



}


