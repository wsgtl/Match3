import { view } from 'cc';
import { instantiate } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { MathUtil } from '../../../Match_common/utils/MathUtil';
import { v3 } from 'cc';
import { SpriteFrame } from 'cc';
import { Sprite } from 'cc';
import { tween } from 'cc';
import { delay } from '../../../Match_common/utils/TimeUtil';
import { isVaild } from '../../../Match_common/utils/ViewUtil';
import { Widget } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FountainAni')
export class FountainAni extends Component {
    @property(Node)
    icon: Node = null;
    @property(Node)
    coin: Node = null;
    @property(Node)
    launch: Node = null;
    @property([SpriteFrame])
    sf: SpriteFrame[] = [];
    @property(Boolean)
    isMain: boolean = false;
    private h: number = 1800;
    protected onLoad(): void {
        const size = view.getVisibleSize();
        this.h += size.y - 1920;
        if(this.isMain){
            this.launch.getComponent(Widget).bottom=700;
            this.oneTime =0.1;
        }
    }
    private oneTime = 0.02;
    private t = this.oneTime;
    protected update(dt: number): void {
        this.t -= dt;
        if (this.t <= 0) {
            this.t = this.oneTime;
            if(this.isMain)
                this.iconFlyMain();
            else
                this.iconFly();
        }

    }
    private async iconFly() {
        const isCoin = MathUtil.randomBool();
        const ic = isCoin ? instantiate(this.coin) : instantiate(this.icon);
        // ic.getComponent(Sprite).spriteFrame = this.sf.getRandomItem();
        const sc = isCoin?1: 1.6;
        ic.scale = v3(sc, sc, 1);
        this.launch.addChild(ic);
        const fx = MathUtil.randomOne();
        ic.x = fx * MathUtil.random(-50, 200);
        const long = MathUtil.probability() ? 0.5 : 1;
        const baseH = this.h * long;
        const end = v3(fx * MathUtil.random(400, 600), baseH - MathUtil.random(600, 900));
        const duration = long + MathUtil.random(5, 7) / 10;
        ic.angle = MathUtil.random(-90, 90);
        ActionEffect.angle(ic, fx * MathUtil.random(300, 600), duration);
        delay(duration - 0.1).then(() => {
            ActionEffect.fadeOut(ic, 0.1);
        })
        await ActionEffect.bezier3To(ic, v3(0, baseH + 500), v3(fx * 400, baseH + 500), end, duration);
        if (isVaild(ic))
            ic?.destroy();

    }
    private async iconFlyMain() {
        const isCoin = MathUtil.randomBool();
        const ic = isCoin ? instantiate(this.coin) : instantiate(this.icon);
        // ic.getComponent(Sprite).spriteFrame = this.sf.getRandomItem();
        const sc = isCoin?1: 1.6;
        ic.scale = v3(sc, sc, 1);
        this.launch.addChild(ic);
        const fx = MathUtil.randomOne();
        ic.x = fx * MathUtil.random(50, 400);
        const long = 0.5;
        const baseH = this.h * long;
        const end = v3(fx * MathUtil.random(400, 600), baseH - MathUtil.random(600, 900));
        const duration = long + MathUtil.random(5, 7) / 10;
        ic.angle = MathUtil.random(-90, 90);
        ActionEffect.angle(ic, fx * MathUtil.random(300, 600), duration);
        delay(duration - 0.1).then(() => {
            ActionEffect.fadeOut(ic, 0.1);
        })
        await ActionEffect.bezier3To(ic, v3(0, baseH + 500), v3(fx * 400, baseH + 500), end, duration);
        if (isVaild(ic))
            ic?.destroy();

    }
}


