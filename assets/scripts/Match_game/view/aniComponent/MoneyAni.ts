import { _decorator, Component, Node } from 'cc';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { Sprite } from 'cc';
import { delay } from '../../../Match_common/utils/TimeUtil';
import { SpriteFrame } from 'cc';
import { v3 } from 'cc';
import { sp } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MoneyAni')
export class MoneyAni extends Component {
    @property(Node)
    light:Node = null;
    @property(Sprite)
    money: Sprite = null;
    @property(sp.Skeleton)
    sk: sp.Skeleton = null;
    @property([SpriteFrame])
    sf: SpriteFrame[] = [];
    start() {
        // this.node.active = false;
        const a = this.sk.animation;
        delay(3).then(()=>{
            this.sk.setAnimation(1,"ring");
        })
       
        console.log("动画"+a);
    }

    async ani() {
        this.node.active = true;
        // this.money.spriteFrame = this.sf[0];
        // this.light.scale = v3();
        // await ActionEffect.fadeIn(this.node, 0.5);
        // ActionEffect.scale(this.light,0.6,1,0,"backOut");
        // await this.moneyAni();
        // // await ActionEffect.playAni(this.money,6,0.06,true);
        // ActionEffect.scale(this.light,0.5,0,1,"backOut");
        // await ActionEffect.fadeOut(this.node, 0.7);
        // this.node.active = false;

        //   return new Promise<void>(res=>{
        //     this.sk.setAnimation(1,"zhibi");
        //     // this.sk.animation="zhibi";
        //     // this.sk.setToSetupPose();
        //     this.sk.loop = false;
        //     this.sk.setCompleteListener(()=>{
        //         res();
        //         this.node.active = false;
        //     })
        // })
    }
    private async moneyAni() {
        // return new Promise<void>(res=>{
        //     this.sk.animation="zhibi";
        //     this.sk.setToSetupPose();
        //     this.sk.setCompleteListener(()=>{
        //         res();
        //     })
        // })

        // for (let i = 0; i < 21; i++) {
        //     this.money.spriteFrame = this.sf[i];
        //     await delay(0.025);
        // }
    }
}


