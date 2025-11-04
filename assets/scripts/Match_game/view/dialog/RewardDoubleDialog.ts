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
    @property([Node])
    icons: Node[] = [];
    @property(NumFont)
    num: NumFont = null;
    @property(NumFont)
    btnNum: NumFont = null;


    type: RewardType;
    cb: Function;
    private rewardNum: number = 0;//奖励数量
    private reciveNum: number = 0;//看广告奖励
    show(parent: Node, args?: any) {
        parent.addChild(this.node);
        
        this.cb = args.cb;
        this.type = args.type;
        this.reciveNum = args.rewardNum;
        this.rewardNum = this.reciveNum / 2;
        this.icons.forEach((v,i)=>{
            v.active = i+1==this.type;
        })
        this.init();
    }
    init() {
        AudioManager.playEffect("rewardShow");
        this.num.num = " +" + (this.type == RewardType.money ? FormatUtil.toMoney(this.rewardNum) : this.rewardNum);
        this.btnNum.num = this.type == RewardType.money ? FormatUtil.toMoney(this.reciveNum) : this.reciveNum;

        this.btnClaim.once(Button.EventType.CLICK, this.onBtnClaim, this);
        this.btnReceive.on(Button.EventType.CLICK, this.onBtnReceive, this);

        AudioManager.vibrate(100,100);

    }

    onBtnClaim() {
        this.closeAni();
        this.addReward(this.rewardNum);
        adHelper.timesToShowInterstitial();

    }
    onBtnReceive() {
        adHelper.showRewardVideo("多倍钱奖励弹窗", () => {
            this.addReward(this.reciveNum);
            this.closeAni();
        }, ViewManager.adNotReady)
    }
    private addReward(num: number) {
        this.type == RewardType.money ? MoneyManger.instance.addMoney(num, false,false) : CoinManger.instance.addCoin(num, false,false);
        ViewManager.showRewardAni1(this.type, num, this.cb);
    }




}


