import { view } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { Vec3 } from 'cc';
import { Vec2 } from 'cc';
import { tweenPromise } from '../../../Match_common/utils/TimeUtil';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { UITransform } from 'cc';
import { Size } from 'cc';
import { Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MoveMask')
export class MoveMask extends Component {
    @property(Node)
    up: Node = null;
    @property(Node)
    down: Node = null;
    @property(Node)
    left: Node = null;
    @property(Node)
    right: Node = null;
    @property(Button)
    click: Button = null;

    init() {
        const y = view.getVisibleSize().y;
        this.up.y = y / 2;
        this.down.y = -y / 2;
        this.left.y = y / 2;
        this.right.y = y / 2;
        UIUtils.setContentSize(this.left, new Size(0, y));
        UIUtils.setContentSize(this.right, new Size(0, y));
    }
    async moveTo(pos: Vec3 | Vec2, width: number, height: number, time: number = 0.3) {
        this.click.node.active = true;
        const bx = 540;
        tweenPromise(this.up, t => t.to(time, { y: pos.y + height / 2 }));
        tweenPromise(this.down, t => t.to(time, { y: pos.y - height / 2 }));
        tweenPromise(this.left, t => t.to(time, { y: pos.y + height / 2 }));
        tweenPromise(this.left.getComponent(UITransform), t => t.to(time, { width: pos.x - width / 2 + bx, height: height }));
        tweenPromise(this.right, t => t.to(time, { y: pos.y + height / 2 }));
        await tweenPromise(this.right.getComponent(UITransform), t => t.to(time, { width: bx - (pos.x + width / 2), height: height }));
        this.click.node.active = false;
    }
}


