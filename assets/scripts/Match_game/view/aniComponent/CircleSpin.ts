import { _decorator, Component, Node } from 'cc';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
const { ccclass, property } = _decorator;

@ccclass('CircleSpin')
export class CircleSpin extends Component {
    @property(Number)
    speed: number = 100;

    private isSpin: boolean = true;
    update(deltaTime: number) {
        if (!this.isSpin) return;
        this.node.angle += deltaTime * this.speed;
    }
    async startAni() {
        await this.scaleAni();
        this.isSpin = true;
    }
    async scaleAni(duration: number = 0.4) {
        await ActionEffect.scale(this.node, duration, 1, 0, "backOut");
    }
}


