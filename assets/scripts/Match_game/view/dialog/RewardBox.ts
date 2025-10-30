import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import { MoneyManger } from '../../manager/MoneyManger';
import { WithdrawUtil } from '../withdraw/WithdrawUtil';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
import { Button } from 'cc';
import { adHelper } from '../../../Match_common/native/AdHelper';
import { sp } from 'cc';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { delay } from '../../../Match_common/utils/TimeUtil';
import { ViewManager } from '../../manager/ViewManger';
import { RewardType } from '../../GameUtil_Match';
import { AudioManager } from '../../manager/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('RewardBox')
export class RewardBox extends DialogComponent {
    @property(Node)
    btnClaim: Node = null;
    @property(Node)
    btnMoreReward: Node = null;
    @property(NumFont)
    moreNumNode: NumFont = null;
    @property(NumFont)
    freeNumNode: NumFont = null;
    @property(Node)
    s2: Node = null;
    @property(sp.Skeleton)
    box: sp.Skeleton = null;

    private freeNum: number = 0;
    private moreNum: number = 0;
    private cb:Function;
    showStart(args?: any): void {
        this.cb = args.cb;
        this.freeNum = MoneyManger.instance.getReward(WithdrawUtil.MoneyBls.BoxFree);
        this.moreNum = MoneyManger.instance.getReward(WithdrawUtil.MoneyBls.Box);

        this.moreNumNode.num = FormatUtil.toMoney(this.moreNum);
        this.freeNumNode.num = "+" + FormatUtil.toMoney(this.freeNum);

        this.btnClaim.on(Button.EventType.CLICK, this.onClaim, this);
        this.btnMoreReward.on(Button.EventType.CLICK, this.onMore, this);


    }
    /**开始动画 */
    async startAni() {
        AudioManager.playEffect("openBox");
        // AudioManager.playEffect("next");
        this.s2.active = false;
        this.isAni = true;
        if (this.bg) ActionEffect.fadeIn(this.bg, 0.3);
        if (this.content) ActionEffect.scale(this.content, 0.3, 1, 0, "backOut");
        AudioManager.vibrate(600,50);
        ActionEffect.skAniOnce(this.box, "animation",true);
        await delay(0.9);
        AudioManager.vibrate(100,255);
        // AudioManager.playEffect("kaixiang");
        this.s2.active = true;
        this.isAni = false;
       
    }
    onClaim() {
        this.closeAni();
        this.addMoney(this.freeNum);
    }
    onMore() {
        adHelper.showRewardVideo("礼盒奖励弹窗", () => {
            this.closeAni();
            this.addMoney(this.moreNum);
        })
    }
    addMoney(num:number){
        MoneyManger.instance.addMoney(num,false);
        ViewManager.showRewardAni1(RewardType.money,num,this.cb);
    }
}


