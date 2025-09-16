import { Sprite } from 'cc';
import { tween } from 'cc';
import { Material } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Dissolve')
export class Dissolve extends Component {
    @property(Material)
    mat:Material = null;
    /**溶解动画 */
    async ani(){
        return new Promise<void>(res=>{
            this.that = this;
            const sp = this.node.getComponent(Sprite);
            if(!sp.customMaterial)sp.customMaterial = this.mat;
            sp.customMaterial.copy(this.mat);
            this.val = 0;
            let all = 30;
            for(let i=0;i<=100;i++){
                this.scheduleOnce(()=>{
                    this.val = 0.3+0.7*i/all;
                    if(i==all){
                        res();
                    }
                },i*0.05);
            }
        })
      
    }
    private that:Dissolve;

    set val(v:number){
        const sp = this.node.getComponent(Sprite);
        sp.customMaterial.setProperty('dissolveThreshold', v);
    }
}


