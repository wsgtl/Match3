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
import { ConfigConst } from '../../manager/ConfigConstManager';
const { ccclass, property } = _decorator;

@ccclass('RewardWinDialog')
export class RewardWinDialog extends DialogComponent {
    @property(Node)
    btnReceive: Node = null;
    @property(Node)
    btnClaim: Node = null;
    @property(Node)
    rewardNode: Node = null;
    @property(NumFont)
    num: NumFont = null;
    @property(NumFont)
    btnNum: NumFont = null;


    type: RewardType;
    cb: Function;
    private rewardNum: number = 0;//奖励数量
    private reciveNum: number = 0;//看广告领取奖励
    show(parent: Node, args?: any) {
        parent.addChild(this.node);

        this.cb = args.cb;
        this.type = args.type;
        this.rewardNum = args.rewardNum;
        this.reciveNum = this.rewardNum * ConfigConst.MoneyBls.PassAd;
        this.init();
        AudioManager.vibrate(100, 100);
    }
    init() {
        AudioManager.playEffect("happy1");
        this.num.num = "+" + this.getShowReward(this.rewardNum);
        this.btnNum.num = this.getShowReward(this.reciveNum);

        this.btnClaim.once(Button.EventType.CLICK, this.onBtnClaim, this);
        this.btnReceive.on(Button.EventType.CLICK, this.onBtnReceive, this);


        this.rewardNode.getChildByName("coin").active = this.type == RewardType.coin;
        this.rewardNode.getChildByName("money").active = this.type != RewardType.coin;
        this.content.getChildByName("kCoin").active = this.type == RewardType.coin;
        this.content.getChildByName("kMoney").active = this.type != RewardType.coin;
        
    }
    private getShowReward(n: number) {
        return this.type == RewardType.coin ? n : FormatUtil.toMoney(this.rewardNum);
    }

    onBtnClaim() {
        this.closeAni();
        this.addReward(this.rewardNum);
        adHelper.timesToShowInterstitial();

    }
    onBtnReceive() {
        adHelper.showRewardVideo("通关奖励弹窗", () => {
            this.addReward(this.reciveNum);
            this.closeAni();
        }, ViewManager.adNotReady)
    }
    private addReward(num: number) {
        this.type == RewardType.coin ? CoinManger.instance.addCoin(num, false, false) : MoneyManger.instance.addMoney(num, false, false);
        ViewManager.showRewardAni1(this.type, num, this.cb);
    }




}


