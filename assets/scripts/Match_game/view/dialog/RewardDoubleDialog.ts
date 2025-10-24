import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import { SpriteFrame } from 'cc';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { Sprite } from 'cc';
import { GameUtil, RewardType } from '../../GameUtil_Match';
import { MathUtil } from '../../../Match_common/utils/MathUtil';
import { Button } from 'cc';
import { adHelper } from '../../../Match_common/native/AdHelper';
import { GameStorage } from '../../GameStorage_Match';
import { CoinManger } from '../../manager/CoinManger';
import { MoneyManger } from '../../manager/MoneyManger';
import { ViewManager } from '../../manager/ViewManger';
import { AudioManager } from '../../manager/AudioManager';
import { GuideManger } from '../../manager/GuideManager';
import { LangStorage } from '../../../Match_common/localStorage/LangStorage';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
import { WithdrawUtil } from '../withdraw/WithdrawUtil';
const { ccclass, property } = _decorator;

@ccclass('RewardDoubleDialog')
export class RewardDoubleDialog extends DialogComponent {
    @property(Node)
    btnReceive: Node = null;
    @property(Node)
    btnClaim: Node = null;
    @property(NumFont)
    num: NumFont = null;
    @property(NumFont)
    btnNum: NumFont = null;


    type: RewardType;
    cb: Function;
    private rewardNum: number = 1;//奖励数量
    private reciveNum: number = 2;//看广告奖励
    show(parent: Node, args?: any) {
        parent.addChild(this.node);
        this.init();
        this.cb = args.cb;
    }
    init() {
        AudioManager.playEffect("reward", 2);
        // this.type = type;


        // this.showReciveNum(2);
        const data = LangStorage.getData();
        this.reciveNum = MoneyManger.instance.getReward(WithdrawUtil.MoneyBls.RewardAd);
        this.rewardNum = this.reciveNum/2;
        this.num.aligning = 1;
        this.num.num =  " +" + FormatUtil.toMoney(this.rewardNum);
        this.btnNum.num =   FormatUtil.toMoney(this.reciveNum);
        // this.showMoneyNode();

        this.btnClaim.once(Button.EventType.CLICK, this.onBtnClaim, this);
        this.btnReceive.on(Button.EventType.CLICK, this.onBtnReceive, this);



    }

    onBtnClaim() {
        this.closeAni();
        this.addReward(this.rewardNum);
        adHelper.timesToShowInterstitial();
        // if (GameStorage.getCurLevel() > 1) {//第二局后有概率弹插屏广告
        //     adHelper.timesToShowInterstitial();
        // }
    }
    onBtnReceive() {
        adHelper.showRewardVideo("多倍钱奖励弹窗", () => {
            this.addReward(this.reciveNum);
            this.closeAni();
        }, ViewManager.adNotReady)
    }
    private addReward(num: number) {
        // ViewManager.showRewardAni(1, num, this.cb);
        // const cb = this.cb;
        // ViewManager.showRewardParticle(RewardType.money, this.node, MoneyManger.instance.getMoneyNode().moneyNode, () => {
        //     // cb(num);
        //     MoneyManger.instance.addMoney(num, false);
        // })
        MoneyManger.instance.addMoney(num, false);
        ViewManager.showRewardAni1(RewardType.money,num,this.cb);
    }




}


