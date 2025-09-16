import { _decorator, Component, Node } from 'cc';
import ViewComponent from '../../../Match_common/ui/ViewComponent';
import { DialogBox } from './DialogBox';
import { GameManger } from '../../manager/GameManager';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { isVaild } from '../../../Match_common/utils/ViewUtil';
import { Vec3 } from 'cc';
import { Money } from '../component/Money';
import { Button } from 'cc';
import { GuideManger } from '../../manager/GuideManager';
import { BtnSpin } from '../component/BtnSpin';
const { ccclass, property } = _decorator;

@ccclass('GuideMask')
export class GuideMask extends ViewComponent {
    @property(DialogBox)
    db: DialogBox = null;
    @property(Node)
    hand: Node = null;
    @property(Node)
    content: Node = null;
    @property(Node)
    mask: Node = null;
    @property(Node)
    cash: Node = null;
    show(parent: Node, args?: any): void {
        parent.addChild(this.node);
    }

    showMask() {
        this.mask.active = true;
        ActionEffect.fadeIn(this.mask, 0.3);
    }
    showTips(strIndex: number) {
        this.db.node.active = true;
        this.db.init(strIndex);
        this.db.ani();
    }

   
    private cc: Node;
    private ccParent: Node;
    private ccPos: Vec3;
    private ccIndex: number;
    showSpin(cc: Node) {
        this.ccPos = cc.position.clone();
        this.cc = cc;
        this.ccParent = cc.parent;
        this.ccIndex = cc.getSiblingIndex();
        UIUtils.changeParent(cc, this.content);
        this.hand.active = true;
        this.hand.position = cc.position;
        this.hand.angle = 140;
        cc.getComponent(BtnSpin).guideCb = () => {
            console.log("spin引导")
            this.ccBack();
            this.showAll(false);
         }
        // cc.once(Node.EventType.TOUCH_END, () => {
        //    console.log("spin引导")
        //    this.ccBack();
        //    this.showAll(false);
        // })
    }
    ccBack() {
        if (isVaild(this.cc) && isVaild(this.ccParent)) {
            this.cc.position = this.ccPos;
            this.ccParent.insertChild(this.cc, this.ccIndex);
        }
    }

    


    private mn: Node;
    private mnParent: Node;
    private mnPos: Vec3;
    private mnIndex: number;
    showMoneyNode(mn: Node) {
        this.mnPos = mn.position.clone();
        this.mn = mn;
        this.mnParent = mn.parent;
        this.mnIndex = mn.getSiblingIndex();
        UIUtils.changeParent(mn, this.content);
        mn.once(Node.EventType.TOUCH_START, () => {
            this.mnBack();
            this.node.destroy();
            GuideManger.passGameStep();
        })

        this.hand.active = true;
        this.hand.y = mn.position.y;
        this.hand.x = 300;
        this.hand.angle = 0;

        this.cash.active = true;
        this.cash.x = 250;
        this.cash.y = mn.position.y - 300;

    }
    mnBack() {
        if (isVaild(this.mn) && isVaild(this.mnParent)) {
            this.mn.position = this.mnPos;
            this.mnParent.insertChild(this.mn, this.mnIndex);
        }
    }
    hideHand(){
        this.hand.active = false;
    }
    hideDb(){
        this.db.node.active = false;
    }
    showAll(v:boolean) {
        this.node.active = v;
        this.db.node.active = v;
        this.hand.active = v;
    }
    

}


