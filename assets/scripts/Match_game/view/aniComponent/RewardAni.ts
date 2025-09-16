import { SpriteFrame } from 'cc';
import { _decorator, Component, Node } from 'cc';
import ViewComponent from '../../../Match_common/ui/ViewComponent';
import { RewardType } from '../../GameUtil_Match';
import { Sprite } from 'cc';
import { instantiate } from 'cc';
import { MoneyManger } from '../../manager/MoneyManger';
import { CoinManger } from '../../manager/CoinManger';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { v3 } from 'cc';
import { MathUtil } from '../../../Match_common/utils/MathUtil';
import { delay } from '../../../Match_common/utils/TimeUtil';
import { Vec3 } from 'cc';
import { GameStorage } from '../../GameStorage_Match';
import { tween } from 'cc';
import { AudioManager } from '../../manager/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('RewardAni')
export class RewardAni extends ViewComponent {
    @property(Node)
    icon: Node = null;
    @property(Node)
    light: Node = null;
    @property([SpriteFrame])
    sf: SpriteFrame[] = [];

    type: RewardType;
    /**增加的奖励 */
    num: number;
    cb: Function;
    show(parent: Node, args?: any): void {
        parent.addChild(this.node);
        this.type = args.type;
        this.num = args.num;
        this.cb = args.cb;
        this.icon.getComponent(Sprite).spriteFrame = this.sf[this.type - 1];
        if (this.type == RewardType.cash)
            this.cashAni();
        else
            this.ani();
    }
    ani() {
        const all = 10;
        const time = 0.5;
        let toNode: Node;
        let trueNum: number;
        let ins: MoneyManger | CoinManger
        if (this.type == RewardType.money) {
            ins = MoneyManger.instance;
            trueNum = GameStorage.getMoney();
            const m = ins.getMoneyNode();
            if (m) {
                toNode = m.node.getChildByName("money");
            }
        } else {
            ins = CoinManger.instance;
            trueNum = GameStorage.getCoin();
            const m = ins.getCoinNode();
            if (m) {
                toNode = m.node.getChildByName("coin");
            }
        }
        const startNum = trueNum - this.num;
        const item = this.num / all;
        if (!toNode) { this.node.destroy(); return; }
        const pos = UIUtils.transformOtherNodePos2localNode(toNode, this.node);
        for (let i = 0; i < all; i++) {
            const ic = instantiate(this.icon);
            this.node.addChild(ic);
            delay(0.05 * i).then(async () => {
                ic.active = true;
                AudioManager.playEffect("jump");
                await ActionEffect.scale(ic, 0.1, 1, 0, "backOut");
                const toP = v3(MathUtil.random(100, 200) * MathUtil.randomOne(), MathUtil.random(-100, 0));
                const cp1 = v3(toP.x / 2, 400);
                await ActionEffect.bezierTo(ic, toP, cp1, 0.3);
                await delay(0.05 * i)
                const cp = v3(ic.x + MathUtil.randomOne() * 300, pos.y / 2);
                await ActionEffect.bezierTo(ic, pos, cp, 0.5);
                AudioManager.playEffect("ceil",0.5);
                const sn = Math.floor(startNum + (i + 1) * item);
                ins.showNum(sn);
                ic.destroy();
                if (i == all - 1) {
                    this.cb?.();
                    this.node.destroy();
                    ins.showCurNum();
                }
            })
        }
    }
    async lightAni(){
        this.light.active = true;
        await ActionEffect.scale(this.light,0.5,1,0,"backOut");
        ActionEffect.fadeOut(this.light,1);
    }
    async cashAni() {
        AudioManager.playEffect("switch");
        this.icon.active = true;
        await ActionEffect.moveBy(this.icon,0.4,0,800);
        this.node.destroy();
        this.cb?.(); 
    }
}


