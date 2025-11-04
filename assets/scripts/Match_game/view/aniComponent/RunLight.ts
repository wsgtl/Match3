import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RunLight')
export class RunLight extends Component {
    @property(Number)
    speed:number = 1;
    protected start(): void {
        this.node.getComponent(Sprite).customMaterial.setProperty('lightSpeed', this.speed);
    }
    private t = 0;
    update(deltaTime: number) {
        this.t += deltaTime;
        const sp = this.node.getComponent(Sprite);
        sp.customMaterial.setProperty('lightTime', this.t);
    }
}


