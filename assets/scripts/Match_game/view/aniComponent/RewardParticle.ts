import { tween } from 'cc';
import { _decorator, Component, Node } from 'cc';
import ViewComponent from '../../../Match_common/ui/ViewComponent';
import { SpriteFrame } from 'cc';
import { Sprite } from 'cc';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { AudioManager } from '../../manager/AudioManager';
import { ButtonLock } from '../../../Match_common/Decorator';
import { instantiate } from 'cc';
import { MathUtil } from '../../../Match_common/utils/MathUtil';
const { ccclass, property } = _decorator;

@ccclass('RewardParticle')
export class RewardParticle extends ViewComponent {
    @property(Node)
    icon: Node = null;
    @property(Node)
    particle: Node = null;
    @property([SpriteFrame])
    sf: SpriteFrame[] = [];

    private cb: Function;
    private duration:number;
    show(parent: Node, args?: any): void {
        parent.addChild(this.node);
        this.cb = args.cb;
        const sp = this.sf[args.type - 1];
        if (sp)
            this.icon.getComponent(Sprite).spriteFrame = sp;
        else
            this.icon.active = false;
        this.duration = args.duration;
        this.ani(args.from, args.to,args.dubble);

    }
    ani(from: Node, to: Node,dubble:boolean) {
        const tp = UIUtils.transformOtherNodePos2localNode(to, this.node);
        const fp = UIUtils.transformOtherNodePos2localNode(from, this.node);
        this.node.position = fp;
        this.playEffect();
        tween(this.node)
            .to(this.duration, { position: tp })
            .call(() => { 
                this.node.destroy();
                this.cb();
             })
            .start();

        if(dubble){
            for(let i=0;i<5;i++){
                const icon=instantiate(this.icon);
                const particle=instantiate(this.particle);
                this.node.addChild(icon);
                this.node.addChild(particle);
                icon.x=MathUtil.random(-80,80);
                icon.y=MathUtil.random(-50,0);
                particle.x=MathUtil.random(-80,80);
                particle.y=MathUtil.random(-60,0);
            }
        }
    }
    @ButtonLock(0.1)
    private playEffect(){
        AudioManager.playEffect("clear");
    }


}


