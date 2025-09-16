import { _decorator, Component, Node } from 'cc';
import { GameUtil } from '../../GameUtil_Match';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { ButtonLock } from '../../../Match_common/Decorator';
import { AudioManager } from '../../manager/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('LineAni')
export class LineAni extends Component {
    @property(Node)
    content:Node = null;
    @property([Node])
    lines: Node[] = [];
    @property([Node])
    fs: Node[] = [];
    protected onLoad(): void {
        this.content.active = false;
    }
    public isShow: boolean = false;
    async show(v:boolean) {
        if(!v){
            await ActionEffect.fadeOut(this.content,0.2);
        }else{
            ActionEffect.fadeIn(this.content,0.2);
        }
        this.content.active = v;
        this.isShow = v;    
    }
    private time = 0;
    protected update(dt: number): void {
        if (!this.isShow) return;
        this.time+=dt;
        if(this.time>=0.1){
            this.time=0;
            this.playLineAniEffect();
        }
        const lineY = dt * 3000;
        const fY = dt * 500;
        const lineBy = 575;
        const fBy = 60;
        this.lines.forEach((v, i) => {
            v.y -= lineY;
            if (v.y <= -lineBy) {
                v.y += lineBy * 2;
            }
        })
        this.fs.forEach((v, i) => {
            v.y -= fY;
            if (v.y <= -fBy) {
                v.y += fBy * 6;
            }
            UIUtils.setAlpha(v,(300-v.y)/300);
        })
    }
    @ButtonLock(0.15)
    private playLineAniEffect() {
        AudioManager.playEffect("nenliang");
    }
}


