import { v3 } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BreatheUpDown')
export class BreatheUpDown extends Component {
    @property(Number)
    time: number = 1;
    @property(Number)
    range: number = 0;
    @property(Number)
    moveY: number = 5;

    private t = 0;
    public baseY: number = 0;
    protected onLoad(): void {
        this.baseY = this.node.y;
    }
    update(deltaTime: number) {
        this.t += deltaTime;

        const sin = Math.sin((this.t / this.time) * Math.PI);
        this.node.y = this.baseY + this.moveY * sin;
        if (this.range > 0) {
            const scale = 1 + sin * this.range;
            this.node.scale = v3(scale, scale, 1);
        }

    }
}


