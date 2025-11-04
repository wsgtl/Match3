import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Star')
export class Star extends Component {
    @property(Number)
    speed:number = 1;
    protected start(): void {
        this.node.getComponent(Sprite).customMaterial.setProperty('sparkleSpeed', this.speed);
    }
    private t = 0;
    update(deltaTime: number) {
        this.t += deltaTime;
        const sp = this.node.getComponent(Sprite);
        sp.customMaterial.setProperty('lightTime', this.t);
    }
}


