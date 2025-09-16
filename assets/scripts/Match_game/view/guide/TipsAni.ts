import { tween } from 'cc';
import { Tween } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TipsAni')
export class TipsAni extends Component {
    protected onLoad(): void {
       this.init();
    }
    public init(){
        const sp = this.node.getComponent(Sprite);
        if(!sp)return;
        sp.fillType = Sprite.FillType.VERTICAL;
        sp.fillStart = 1;
        sp.fillRange = 0;
    }
    public startAni(duration:number=1){
        const sp = this.node.getComponent(Sprite);
        if(!sp)return;
        tween(sp)
        .to(duration,{fillRange:-1})
        .start();
    }
    public stopAni(){
        Tween.stopAllByTarget(this.node.getComponent(Sprite));
    }
}


