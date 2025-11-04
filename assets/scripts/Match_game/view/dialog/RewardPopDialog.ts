import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { RewardType } from '../../GameUtil_Match';
import { Button } from 'cc';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
import { CoinManger } from '../../manager/CoinManger';
import { MoneyManger } from '../../manager/MoneyManger';
import { ViewManager } from '../../manager/ViewManger';
import { AudioManager } from '../../manager/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('RewardPopDialog')
export class RewardPopDialog extends DialogComponent {
    @property(Node)
    btnClaim: Node = null;
    @property([Node])
    mc: Node[] = [];
    @property(NumFont)
    num: NumFont = null;

    private rewardNum: number = 0;
    private type: RewardType;
    private cb:Function;
    showStart(args?: any): void {
        this.cb = args.cb;
        this.type = args.type;
        this.rewardNum = args.rewardNum;

        this.btnClaim.on(Button.EventType.CLICK, this.onClaim, this);
        this.num.num = "+" + (this.type == RewardType.coin ? this.rewardNum : FormatUtil.toMoney(this.rewardNum));
        this.mc.forEach((v,i)=>{
            v.active = i+1==this.type;
        })
        AudioManager.playEffect("rewardShow");
        AudioManager.vibrate(100,100);
    }

    onClaim() {
        if (this.isAni) return;
        this.closeAni();
        if (this.type == RewardType.coin) {
            CoinManger.instance.addCoin(this.rewardNum,false,false);
        } else {
            MoneyManger.instance.addMoney(this.rewardNum,false,false);
        }
        ViewManager.showRewardAni1(this.type,this.rewardNum,this.cb);
        
    }
}


