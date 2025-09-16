import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import { LuckyRewardData, RewardType } from '../../GameUtil_Match';
import { CoinManger } from '../../manager/CoinManger';
import { MoneyManger } from '../../manager/MoneyManger';
import { AdHelper, adHelper } from '../../../Match_common/native/AdHelper';
import { ViewManager } from '../../manager/ViewManger';
import { Button } from 'cc';
import { delay } from '../../../Match_common/utils/TimeUtil';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { tween } from 'cc';
import { Animation } from 'cc';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { v3 } from 'cc';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
import { AudioManager } from '../../manager/AudioManager';
import { LangStorage } from '../../../Match_common/localStorage/LangStorage';
import { i18n } from '../../../Match_common/i18n/I18nManager';
import { CircleSpin } from '../aniComponent/CircleSpin';
import { MathUtil } from '../../../Match_common/utils/MathUtil';
const { ccclass, property } = _decorator;

@ccclass('LuckyDialog')
export class LuckyDialog extends DialogComponent {
    @property([Node])
    items: Node[] = [];
    @property(Node)
    btnOpen: Node = null;
    @property(Node)
    btnLeave: Node = null;
    @property(Node)
    big: Node = null;
    @property(NumFont)
    bigNum: NumFont = null;

    private cb: Function;
    show(parent: Node, args?: any): void {
        parent.addChild(this.node);
        this.cb = args.cb;
        this.btnOpen.on(Button.EventType.CLICK, this.onOpen, this);
        this.btnLeave.on(Button.EventType.CLICK, this.onLeave, this);

    }
    private data: LuckyRewardData[] = [];
    private isAniNow: boolean = false;
    init() {
        for (let i = 0; i < 3; i++) {
            let type = MathUtil.probability(0.2) ? RewardType.coin : RewardType.money;
            let num = type == RewardType.coin ? CoinManger.instance.getReward() : MoneyManger.instance.getReward(0.4);
            if (i == 2) {//大奖
                type = RewardType.money;
                num = MoneyManger.instance.getReward(2);
            }


            this.data[i] = { type, num, isOpen: false };
            this.items[i].on(Node.EventType.TOUCH_START, () => {
                if (this.isAniNow) return;
                const data = this.data[i];
                if (data.isOpen) return;
                adHelper.showRewardVideo("幸运盲盒界面",() => {
                    this.openReward(i);
                }, ViewManager.adNotReady)

            })
        }
        this.changeItemAni();
    }
    private async changeItemAni() {
        this.isAniNow = true;
        for (let i = 0; i < 3; i++) {
            this.showItem(i, true, false);
        }
        await delay(1.5);
        let time = 0.2;
        this.items.forEach((v, i) => {
            tween(v)
                .to(time, { x: 0 })
                .call(() => { this.showItem(i, false) })
                .start();
        })
        await delay(time + 0.2);
        const pos = [0, 1, 2].shuffle();
        for (let i = 0; i < 3; i++) {
            const x = this.getX(pos[i]);
            const v = this.items[i];
            tween(v)
                .to(time, { x: x })
                .call(() => {
                    if (i == 0) {
                        this.openReward(i);
                    } else {
                        this.showHand(i, true);
                    }
                })
                .start();
        }
        await delay(time);
        this.isAniNow = false;
    }
    private getX(i: number) {
        return (i - 1) * 350;
    }
    private async openReward(index: number) {
        AudioManager.playEffect("kaixiang", 2);
        
        const data = this.data[index];
        data.isOpen = true;
        if (data.type == RewardType.coin) {
            CoinManger.instance.addCoin(data.num);
        } else {
            MoneyManger.instance.addMoney(data.num);
        }
        const item = this.items[index];
        tween(item)
            .to(0.2, { y: 100 })
            .to(0.2, { y: 0 })
            .call(async() => {
                this.showItem(index, true);
                this.showHand(index, false);
                item.getChildByName("light").getComponent(CircleSpin).startAni();
                const isBig = index==2;
                AudioManager.vibrate(isBig?200:120,255);
                if (isBig) {//大奖
                    this.big.active = true;
                    AudioManager.playEffect("happy");
                    this.bigNum.num = LangStorage.getData().symbol + FormatUtil.toXXDXXxsd(data.num);
                    await ActionEffect.scale(this.big, 0.5, 1, 0, "backOut");
                    await delay(2.5);
                    ActionEffect.fadeOut(this.big, 0.1);
                }
            })
            .start();
       

    }
    private showItem(index: number, v: boolean, isShowLight: boolean = true) {
        const data = this.data[index];
        const item = this.items[index];
        item.getChildByName("sp").active = !v;
        item.getChildByName("close").active = !v;
        item.getChildByName("light").active = v && isShowLight;
        const num = item.getChildByName("num").getComponent(NumFont);
        num.node.active = v;
        num.aligning = 1;
        v && (num.num = (data.type == RewardType.money ? LangStorage.getData().symbol + FormatUtil.toXXDXXxsd(data.num) : data.num));

        item.getChildByName("r1").active = v && data.type == RewardType.money;
        item.getChildByName("r2").active = v && data.type == RewardType.coin;
    }
    private showHand(index: number, v: boolean) {
        const item = this.items[index];
        const hand = item.getChildByName("handAni");
        hand.active = v;
        hand.scale = v3(0.7, 0.7);
        if (v) {
            hand.getComponent(Animation).play();
        }
    }
    private onOpen() {
        if (this.isAniNow) return;
        let index = -1;
        for (let i = 0; i < 3; i++) {
            if (!this.data[i].isOpen) {
                index = i;
                break;
            }
        }
        if (index < 0) {
            // ViewManager.showTips("All rewards have been claimed. Please click Leave.");
            ViewManager.showTips(i18n.string("str_arhbc"));
            return;
        }
        adHelper.showRewardVideo("幸运盲盒界面",() => {
            this.openReward(index);
        }, ViewManager.adNotReady);

    }
    private onLeave() {
        if (this.isAniNow) return;
        this.cb();
        this.node.destroy();
        adHelper.timesToShowInterstitial();
    }

    /**开始动画 */
    async startAni() {
        this.isAni = true;
        this.content.active = false;
        ActionEffect.fadeIn(this.bg, 0.3);
        await delay(0.5);
        AudioManager.playEffect("stop");
        // AudioManager.playEffect("kaixiang", 2);
        this.content.active = true;
        ActionEffect.scale(this.content, 0.3, 1, 0, "backOut");
        this.isAni = false;

        this.btnLeave.active = false;
        delay(2.5).then(() => {
            this.btnLeave.active = true;
        })
        this.init();
    }
}


