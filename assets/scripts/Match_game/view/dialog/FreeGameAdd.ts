import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import { Button } from 'cc';
import { delay, tweenPromise } from '../../../Match_common/utils/TimeUtil';
import { isVaild } from '../../../Match_common/utils/ViewUtil';
import { tween } from 'cc';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { Sprite } from 'cc';
import { AudioManager } from '../../manager/AudioManager';
import { v3 } from 'cc';
import { GameManger } from '../../manager/GameManager';
import { GameUtil } from '../../GameUtil_Match';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { adHelper } from '../../../Match_common/native/AdHelper';
import { ViewManager } from '../../manager/ViewManger';
const { ccclass, property } = _decorator;

@ccclass('FreeGameAdd')
export class FreeGameAdd extends DialogComponent {
    @property(NumFont)
    numNode: NumFont = null;
    @property(Node)
    btnAdd: Node = null;
    @property(Node)
    btnNt: Node = null;
    @property(Sprite)
    btnMask: Sprite = null;
    @property([Node])
    aniNodes: Node[] = [];


    private cb: Function;
    show(parent: Node, args?: any): void {
        super.show(parent);

        this.cb = args.cb;
        this.numNode.num = GameUtil.FreeGameAddTimes;
        this.btnAdd.on(Button.EventType.CLICK, this.onAdd, this);
        this.btnNt.on(Button.EventType.CLICK, this.onNt, this);


        AudioManager.playEffect("reward", 2);
    }
    async onAdd() {
        if (this.isAni) return;
        this.isAni = true;
        adHelper.showRewardVideo("免费游戏增加次数弹窗",async ()=>{
            GameManger.instance.freegameTimes = GameUtil.FreeGameAddTimes;
            await this.closeAni();
            this.cb?.();
        },()=>{
            ViewManager.adNotReady();
            this.isAni = false;
        })
       
        
    }
    async onNt() {
        if (this.isAni) return;
        this.isAni = true;
        await this.closeAni();
        this.cb?.();
    }

    /**开始动画 */
    async startAni() {
        // AudioManager.playEffect("gufen");
        this.isAni = true;
        if (this.bg) ActionEffect.fadeIn(this.bg, 0.3);
        const waitTimes = [0, 0.2, 0.25, 0.3, 0.4, 0.4,0.4];//各个动画节点等待出现时机
        const bigs = [1.3,1.2,1.2,1.2,1.2,1.1,1.1];//各个动画节点最大
        this.aniNodes.forEach(async (v, i) => {
            v.scale = v3();
            await delay(waitTimes[i]);
            // ActionEffect.scale(v, 0.4, 1, 0, "backOut");
            // ActionEffect.scaleBigToSmall(v,1.2,1,0.6);
            ActionEffect.scaleBigToSmall(v,bigs[i],1,0.6);
        })
        await delay(1, this.node);
        this.isAni = false; 
        // this.waitBtn();
    }
    /**关闭动画 */
    async closeAni() {
        this.btnAdd.getComponent(Button).interactable=false;
        // if (this.isAni) return;
        // this.isAni = true;
        ActionEffect.fadeOut(this.bg, 1);
        const waitTimes = [0.4, 0.3, 0.25, 0.2, 0, 0,0];//各个动画节点等待出现时机
        this.aniNodes.forEach(async (v, i) => {
            await delay(waitTimes[i]);
            ActionEffect.scale(v, 0.4, 0, 1, "backIn");
        })
        await delay(1, this.node);
        
        this.node.destroy();
        this.closeCb?.();
    }
    // async waitBtn(){
    //     const duration = 3;
    //     tweenPromise(this.btnMask, t => t.to(duration, { fillRange: 1 })).then(async () => {
    //         if (isVaild(this.node)) {
    //             await this.closeAni();
    //             this.cb?.();
    //         }
    //     })
    // }
}


