import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import { Button } from 'cc';
import { GameUtil, RewardData, RewardType } from '../../GameUtil_Match';
import { MathUtil } from '../../../Match_common/utils/MathUtil';
import { SpriteFrame } from 'cc';
import { CoinManger } from '../../manager/CoinManger';
import { MoneyManger } from '../../manager/MoneyManger';
import { instantiate } from 'cc';
import { Sprite } from 'cc';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
import { GameStorage } from '../../GameStorage_Match';
import { AffineTransform } from 'cc';
import { adHelper } from '../../../Match_common/native/AdHelper';
import { ViewManager } from '../../manager/ViewManger';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { delay } from '../../../Match_common/utils/TimeUtil';
import { AudioManager } from '../../manager/AudioManager';
import { tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LuckyGiftDialog')
export class LuckyGiftDialog extends DialogComponent {
    @property(Node)
    btnGet: Node = null;
    @property(Node)
    btnNt: Node = null;
    @property(Node)
    item: Node = null;
    @property(Node)
    itemContent: Node = null;
    @property([SpriteFrame])
    sf: SpriteFrame[] = [];
    @property(Node)
    zz: Node = null;
    @property(Node)
    sp: Node = null;

    cb: Function;
    private isFree: boolean = false;
    private rds: RewardData[] = [];
    private items: Node[] = [];
    show(parent: Node, args?: any): void {
        super.show(parent);
        this.cb = args.cb;
        this.btnGet.on(Button.EventType.CLICK, () => {
            if (this.isAni) return;
            this.isAni = true;
            if (this.isFree) {
                this.startDraw();
            } else {
                adHelper.showRewardVideo("金猪弹窗", () => { this.startDraw(); },
                    () => {
                        this.isAni = false;
                        ViewManager.adNotReady();
                    }
                );
            }
        })
        this.btnNt.on(Button.EventType.CLICK, () => {
            this.closeAni();
            adHelper.timesToShowInterstitial();
        })
        this.init();
        // AudioManager.playEffect("kaixiang", 2);
    }
    init() {
        for (let i = 0; i < 6; i++) {
            const index = MathUtil.random(0, 3);
            const type: RewardType = index == 0 ? RewardType.coin : RewardType.money;
            const num = type == RewardType.coin ? CoinManger.instance.getReward() : MoneyManger.instance.getReward(index / 2);
            const rd: RewardData = { type, num };
            this.rds[i] = rd;
            const it = instantiate(this.item);
            this.itemContent.addChild(it);
            it.x = this.getX(i);
            it.getComponent(Sprite).spriteFrame = this.sf[index];
            const itn = it.getChildByName("num").getComponent(NumFont);
            itn.aligning = 1;
            itn.num = "+" + FormatUtil.toXXDXX(num, 6, false);
            this.items[i] = it;
        }
        this.item.active = false;

        const day = GameStorage.getPig().day;
        const curDay = GameUtil.getCurDay();
        this.isFree = curDay > day;
        this.sp.active = !this.isFree;
    }
    private getX(i: number) {
        return (i - 2) * 216
    }
    private zzIndex: number = 2;
    /**开始抽奖 */
    private async startDraw() {
        const times = MathUtil.random(20, 25);
        const duration = 0.06;
        for (let i = 0; i < times; i++) {
            AudioManager.playEffect("jump");
            const a = this.items.shift();
            this.items.push(a);
            this.items.forEach((v, j) => {
                tween(v)
                    .by(duration, { x: -216 })
                    .call(() => { v.x = this.getX(j) })
                    .start();
            })
            await delay(duration);
        }

        const rd = this.rds[this.zzIndex];
        const it = this.items[this.zzIndex];

        AudioManager.playEffect("happy");
        await delay(0.7);
        AudioManager.playEffect("coin");
        await ActionEffect.scaleBigToSmall(it, 1.1, 1, 0.3);
        await ActionEffect.scaleBigToSmall(it, 1.1, 1, 0.3);
        await ActionEffect.scaleBigToSmall(it, 1.2, 0, 0.3);
        this.isAni = false;
        this.closeAni();
        const toNode = rd.type == RewardType.coin ? CoinManger.instance.getCoinNode().coinNode : MoneyManger.instance.getMoneyNode().moneyNode;
        GameStorage.setPigDay(GameUtil.getCurDay());//记录天数，保证每天第一次不用看广告可领取
        ViewManager.showRewardParticle(rd.type, it, toNode, () => {
            rd.type == RewardType.coin ? CoinManger.instance.addCoin(rd.num, false) : MoneyManger.instance.addMoney(rd.num, false);
        })
        this.cb();
    }

    // private async startDraw() {
    //     let fx = 1;
    //     const times = MathUtil.random(15, 20);
    //     for (let i = 0; i < times; i++) {
    //         let j = this.zzIndex + fx;
    //         if (j >= 4) { fx = -1; }
    //         else if (j <= 0) { fx = 1; }
    //         this.zzIndex = j;
    //         await ActionEffect.moveTo(this.zz, 0.03, this.getX(j), this.zz.y);
    //         await delay(0.03);
    //         AudioManager.playEffect("jump");
    //     }
    //     AudioManager.playEffect("coin");
    //     const rd = this.rds[this.zzIndex];
    //     const it = this.items[this.zzIndex];
    //     await ActionEffect.scaleBigToSmall(it, 1.2, 1, 0.2);
    //     this.isAni = false;
    //     this.closeAni();
    //     const toNode = rd.type == RewardType.coin ? CoinManger.instance.getCoinNode().coinNode : MoneyManger.instance.getMoneyNode().moneyNode;
    //     GameStorage.setPigDay(GameUtil.getCurDay());//记录天数，保证每天第一次不用看广告可领取
    //     ViewManager.showRewardParticle(rd.type, it, toNode, () => {
    //         rd.type == RewardType.coin ? CoinManger.instance.addCoin(rd.num) : MoneyManger.instance.addMoney(rd.num);
    //     })
    //     this.cb();
    // }


    /**开始动画 */
    async startAni() {
        this.isAni = true;
        this.content.active = false;
        ActionEffect.fadeIn(this.bg, 0.3);
        await delay(0.5);
        // AudioManager.playEffect("stop");
        AudioManager.playEffect("kaixiang", 2);
        this.content.active = true;
        ActionEffect.scale(this.content, 0.3, 1, 0, "backOut");
        this.isAni = false;
    }
}


