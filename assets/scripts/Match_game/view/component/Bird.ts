import { _decorator, Component, Node } from 'cc';
import { CardType, GameUtil, PropType } from '../../GameUtil_Match';
import { SpriteFrame } from 'cc';
import { Sprite } from 'cc';
import { delay, tweenPromise } from '../../../Match_common/utils/TimeUtil';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { Label } from 'cc';
import { v3 } from 'cc';
import { MoneyManger } from '../../manager/MoneyManger';
import { WithdrawUtil } from '../withdraw/WithdrawUtil';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
import { Tween } from 'cc';
import { AudioManager } from '../../manager/AudioManager';
import { Button } from 'cc';
import { ButtonLock } from '../../../Match_common/Decorator';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { Vec2 } from 'cc';
import { ConfigConst } from '../../manager/ConfigConstManager';
import { CoinManger } from '../../manager/CoinManger';
const { ccclass, property } = _decorator;

@ccclass('Bird')
export class Bird extends Component {
    @property(Node)
    icon: Node = null;
    @property(Node)
    iconNode: Node = null;
    @property(Node)
    pp: Node = null;
    @property(Label)
    l: Label = null;
    @property(NumFont)
    moneyL: NumFont = null;
    @property([SpriteFrame])
    sf: SpriteFrame[] = [];

    type: CardType;
    init(type: CardType) {
        this.setType(type);
    }
    public setType(type: CardType, isAni: boolean = false) {
        this.type = type;
        if (isAni) {
            tweenPromise(this.icon, t => t
                .to(0.1, { scale: v3() })
                .call(() => {
                    this.icon.getComponent(Sprite).spriteFrame = this.sf[this.type - 1];
                    this.l.string = type + "";
                })
                .to(0.1, { scale: v3(1, 1) }, { easing: "backOut" })
            )
        } else {
            this.icon.getComponent(Sprite).spriteFrame = this.sf[this.type - 1];
            this.l.string = type + "";
        }



    }
    public async initAni(i: number, dropY: number) {
        const to = GameUtil.getPost(i);
        this.node.position = GameUtil.getPost(i + dropY * GameUtil.AllCol)
        await tweenPromise(this.node, t => t.to(Math.min(0.4, 0.1 * dropY), { position: to }))
    }
    /**变换位置 */
    async changeTo(i: number) {
        const pos = GameUtil.getPost(i);
        await tweenPromise(this.node, t => t.to(0.1, { position: pos }))
    }
    /**下坠 */
    async dropTo(i: number) {
        const pos = GameUtil.getPost(i);
        await tweenPromise(this.node, t => t.to(0.2, { position: pos }))
    }
    async moveTos(tos: number[]) {
        const allTime = Math.pow(tos.length, 1 / 2) * 0.15;
        const time = allTime / tos.length;
        // ActionEffect.alpha(this.node,0.1,0.5);
        for (let i = 0; i < tos.length; i++) {
            this.su();
            const pos = GameUtil.getPost(tos[i]);
            // if(i==tos.length-1){
            //     // tweenPromise(this.node, t => t.to(0.1, { scale: v3(0.5,0.5) }))  
            //     ActionEffect.alpha(this.node,0.1,0.5);
            // }
            await tweenPromise(this.node, t => t.to(time, { position: pos }))

        }
        // await tweenPromise(this.node, t => t.to(0.05, { scale: v3(1.2,1.2) }))  
        this.clearAni();
    }
    async clearAni() {
        await ActionEffect.scale(this.node, 0.1, 0);
        this.node.destroy();
    }
    async colorClearAni() {
        await tweenPromise(this.icon, t => t.to(0.1, { angle: 30 }).to(0.2, { angle: -30 }).to(0.1, { angle: 0 }))
        await this.clearAni();
    }
    async shuffleChange(type: CardType, i: number) {
        await ActionEffect.moveTo(this.node, 0.3, 0, 0);
        this.setType(type);
        const pos = GameUtil.getPost(i);
        await tweenPromise(this.node, t => t.to(0.2, { position: pos }));
    }
    public rewardNum: number = 0;
    setMoney() {
        this.moneyL.node.active = true;
        this.rewardNum = ConfigConst.isShowA ? CoinManger.instance.getPassReward() : MoneyManger.instance.getReward(ConfigConst.MoneyBls.Pass);
        this.moneyL.num = ConfigConst.isShowA ? this.rewardNum : FormatUtil.toMoney(this.rewardNum);
    }
    hideMoney() {
        this.moneyL.node.active = false;
        this.rewardNum = 0;
    }
    private isUseProp: boolean = false;
    /**使用道具状态 */
    async useProp() {
        if (this.isUseProp) return;
        this.isUseProp = true;
        while (this.isUseProp) {
            await tweenPromise(this.iconNode, t => t
                .to(0.05, { angle: -4 })
                .to(0.1, { angle: 4 })
                .to(0.05, { angle: 0 })
            )
        }
    }
    changeProp(prop: PropType) {
        if (!this.isUseProp) return;
        this.pp.active = true;
        for (let i = 0; i < 2; i++)
            this.pp.getChildByName("prop" + (i + 1)).active = (i + 1) == prop;
    }
    /**关闭使用道具状态 */
    closeUseProp() {
        this.pp.active = false;
        this.isUseProp = false;
        // Tween.stopAllByTarget(this.iconNode);
    }
    @ButtonLock(0.025)
    private su() {
        AudioManager.playEffect("du");
    }
    /**爆炸后冲击波位移 */
    public async bombMove(center: Node) {
        const cp = UIUtils.transformOtherNodePos2localNode(center, this.iconNode);
        const h = GameUtil.CardH;
        const ilen = cp.length() / h;
        if (ilen < 1) return;
        const time = Math.pow(ilen - 1, 0.5) * 0.15;
        await delay(time, this.node);
        const move = cp.normalize();
        const len = Math.pow(20 - ilen, 0.3) * 30;
        tweenPromise(this.iconNode, t => t
            .to(0.05, { position: v3(-move.x * len, -move.y * len), scale: v3(1.2, 1.2) })
            .to(0.15, { position: v3(), scale: v3(1, 1) })
        )
    }
    /**被颜色道具选中，并消除 */
    public async colorClear(node: Node) {
        this.iconNode.position = UIUtils.transformOtherNodePos2localNode(this.iconNode, node);

        node.addChild(this.iconNode);


        const bx = 0;
        const by = 0;
        const time = 0.03;
        const tx = 5;
        const ty = 15;
        await tweenPromise(this.icon, t => t
            .to(time, { position: v3(bx + tx, by + ty) })
            .to(time, { position: v3(bx + tx * 2, by) })
            .to(time, { position: v3(bx + tx, by + ty) })
            .to(time, { position: v3(bx, by) })

            .to(time, { position: v3(bx + tx, by + ty) })
            .to(time, { position: v3(bx + tx * 2, by) })
            .to(time, { position: v3(bx + tx, by + ty) })
            .to(time, { position: v3(bx, by) })

            .to(time, { position: v3(bx + tx, by + ty) })
            .to(time, { position: v3(bx + tx * 2, by) })
            .to(time, { position: v3(bx + tx, by + ty) })
            .to(time, { position: v3(bx, by) })

        )
        await this.clearAni();
    }

}


