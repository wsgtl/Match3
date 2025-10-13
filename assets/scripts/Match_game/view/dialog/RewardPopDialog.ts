import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { RewardType } from '../../GameUtil_Match';
import { Button } from 'cc';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
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
    showStart(args?: any): void {
        this.type = args.type;
        this.rewardNum = args.rewardNum;

        this.btnClaim.on(Button.EventType.CLICK, this.onClaim, this);
        this.num.num = "+" + (this.type == RewardType.coin ? this.rewardNum : FormatUtil.toMoney(this.rewardNum));
    }

    onClaim() {
        if (this.isAni) return;
        this.closeAni();
        if (this.type == RewardType.coin) {

        } else {

        }
    }
}


