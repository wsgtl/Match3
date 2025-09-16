import { _decorator, Component, Node } from 'cc';
import { delay } from '../../../Match_common/utils/TimeUtil';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { isVaild } from '../../../Match_common/utils/ViewUtil';
const { ccclass, property } = _decorator;

@ccclass('WaitShow')
export class WaitShow extends Component {
    @property(Number)
    time: number = 1.5;

    protected onLoad(): void {
        this.node.active = false;
        delay(this.time)
            .then(() => {
                if (!isVaild(this.node)) return;
                this.node.active = true;
                ActionEffect.fadeIn(this.node, 0.5);
            })
    }
}


