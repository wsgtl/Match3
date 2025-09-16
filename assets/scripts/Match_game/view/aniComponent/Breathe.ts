import { v3 } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Breathe')
export class Breath extends Component {
    @property(Number)
    time:number = 1;
    @property(Number)
    range:number = 0.025;

    private t=0;
    update(deltaTime: number) {
        this.t+=deltaTime;
        const sin = Math.sin((this.t/this.time)*Math.PI);
        const scale = 1+sin*this.range;
        this.node.scale = v3(scale,scale,1);
        // console.log("scale"+scale,"sin"+sin)
    }
}


