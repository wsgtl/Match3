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
import { delay, tweenPromise } from '../../../Match_common/utils/TimeUtil';
import { Vec3 } from 'cc';
import { GameStorage } from '../../GameStorage_Match';
import { tween } from 'cc';
import { AudioManager } from '../../manager/AudioManager';
import { TERRAIN_HEIGHT_BASE } from 'cc';
import { Button } from 'cc';
import { ButtonLock } from '../../../Match_common/Decorator';
const { ccclass, property } = _decorator;

@ccclass('RewardAni')
export class RewardAni extends ViewComponent {
    @property(Node)
    icon: Node = null;
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
        if (args.ani == 1) {
            this.ani1();
        } else if (args.ani == 2) {
            this.ani2(args.from, args.to);
        }

    }
    ani1() {
        const all = 15;
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
        AudioManager.playEffect("jump");
        for (let i = 0; i < all; i++) {
            const ic = instantiate(this.icon);
            this.node.addChild(ic);
            delay(0.02 * i).then(async () => {
                ic.active = true;
                // AudioManager.playEffect("jump");
                await ActionEffect.scale(ic, 0.1, 1, 0, "backOut");
                const toP = v3(MathUtil.random(50, 150) * MathUtil.randomOne(), MathUtil.random(-100, 0));
                const cp1 = v3(toP.x / 2, 400);
                await ActionEffect.bezierTo(ic, toP, cp1, 0.2);
                await delay(0.02 * i)
                const cp = v3(ic.x + MathUtil.randomOne() * 300, pos.y / 2);
                await ActionEffect.bezierTo(ic, pos, cp, 0.4);
                this.sound();
                // AudioManager.playEffect("ceil", 0.5);
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
    ani2(from: Node, to: Node) {
        const all = 6;

        if (!to) { this.node.destroy(); return; }
        const fp = from ? UIUtils.transformOtherNodePos2localNode(from, this.node) : v3();
        const tp = UIUtils.transformOtherNodePos2localNode(to, this.node);
        AudioManager.playEffect("jump");
        const sc = 0.6;
        for (let i = 0; i < all; i++) {
            const ic = instantiate(this.icon);
            this.node.addChild(ic);
            ic.position = fp;
            delay(0.01 * i).then(async () => {
                ic.active = true;
                // AudioManager.playEffect("jump");
                await ActionEffect.scale(ic, 0.1, sc, 0, "backOut");
                // const toP = v3(fp.x + MathUtil.random(50, 100) * MathUtil.randomOne(), fp.y + MathUtil.random(-60, 0));
                const toP = v3(fp.x + MathUtil.random(50, 100) * (i%2==1?1:-1), fp.y + MathUtil.random(-60, 0));
                const cp1 = v3((fp.x + toP.x) / 2, fp.y + 200);
                await ActionEffect.bezierTo(ic, toP, cp1, 0.2);
                await delay(0.02*i);
                await tweenPromise(ic, tw => tw.to(0.4, { position: tp }))
                // AudioManager.playEffect("ceil", 0.5);
                this.sound();
                ic.destroy();
                if (i == all - 1) {
                    this.cb?.();
                    this.node.destroy();
                }
            })
        }
    }

    private isSound:boolean = false;
    private async sound(){
        if(this.isSound)return;
        this.isSound = true;
        // const name = this.type==RewardType.money?"toMoney":"toCoin";
        const name = "toCoin";
        let i=5;
        while(i>0){
            i--;
            AudioManager.playEffect(name);
            await delay(0.15,this.node);
        }
         
    }
   
}


