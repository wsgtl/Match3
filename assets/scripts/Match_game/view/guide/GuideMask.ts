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
import { MoveMask } from './MoveMask';
import { delay } from '../../../Match_common/utils/TimeUtil';
import { Tween } from 'cc';
import { sp } from 'cc';
import { v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GuideMask')
export class GuideMask extends ViewComponent {
    @property(DialogBox)
    db: DialogBox = null;
    @property(Node)
    hand: Node = null;
    @property(sp.Skeleton)
    handSp: sp.Skeleton = null;
    @property(Node)
    content: Node = null;
    @property(Node)
    mask: Node = null;
    @property(MoveMask)
    moveMask: MoveMask = null;
    show(parent: Node, args?: any): void {
        parent.addChild(this.node);
        this.showAll(false, true);
        this.moveMask.init();
    }

    // showMask() {
    //     this.mask.active = true;
    //     ActionEffect.fadeIn(this.mask, 0.3);
    // }
    showTips(strIndex: number) {
        this.db.node.active = true;
        this.db.init(strIndex);
        this.db.ani();
    }


    async moveTo(node: Node, width: number, height: number) {
        this.moveMask.node.active = true;
        const tp = UIUtils.transformOtherNodePos2localNode(node, this.moveMask.node);
        await this.moveMask.moveTo(tp, width, height);
        return tp;
    }

    async showHand(from: Node, to: Node, isLoop: boolean) {
        if(!this.isShowHand||!isVaild(this.node)||!isVaild(to)||!isVaild(from))return;
        this.hand.active = true;
        const fp = UIUtils.transformOtherNodePos2localNode(from, this.node);
        const tp = UIUtils.transformOtherNodePos2localNode(to, this.node);
        this.hand.position = fp;
        await ActionEffect.fadeIn(this.hand,0.1);
        await ActionEffect.moveTo(this.hand, 0.4, tp.x, tp.y);
        if (!isLoop) return;
        ActionEffect.fadeOut(this.hand,0.3,true);
        await delay(0.3,this.hand)
        this.showHand(from, to, isLoop);
    }


    public isShowHand:boolean = false;
    hideHand() {
        Tween.stopAllByTarget(this.hand);
        this.hand.active = false;
    this.isShowHand = false;
    }
    async showMoneyNode(money: Money, width: number, height: number){
        money.cb=()=>{
            money.cb = null;
            this.node.destroy();
            GuideManger.passCashOutStep();
        }
        this.moveMask.node.active = true;
        const pos = UIUtils.transformOtherNodePos2localNode(money.node, this.moveMask.node);
        await this.moveMask.moveTo(v3(pos.x+40,pos.y+8), width, height);
        this.showHandSpine(pos.x+180,pos.y);
    }
    showHandSpine(x:number,y:number){
        this.handSp.node.active = true;
        this.handSp.node.x = x;
        this.handSp.node.y = y;
    }
    hideDb() {
        this.db.node.active = false;
    }
    showAll(v: boolean, isShowNode: boolean = false) {
        this.node.active = isShowNode;
        this.db.node.active = v;
        this.hand.active = v;
        this.moveMask.node.active = v;
    }


}


