import { _decorator, Component, Node } from 'cc';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { Button } from 'cc';
import { GameStorage } from '../../GameStorage_Match';
import { delay } from '../../../Match_common/utils/TimeUtil';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
import { ViewManager } from '../../manager/ViewManger';
import { tween } from 'cc';
import { v3 } from 'cc';
import { GameManger } from '../../manager/GameManager';
import { i18n } from '../../../Match_common/i18n/I18nManager';
import { GameUtil, RewardType } from '../../GameUtil_Match';
import { MoneyManger } from '../../manager/MoneyManger';
import { WithdrawUtil } from '../withdraw/WithdrawUtil';
const { ccclass, property } = _decorator;

@ccclass('BtnMoneys')
export class BtnMoneys extends Component {
    @property(NumFont)
    time: NumFont = null;
    @property(Node)
    icon: Node = null;
    @property(Node)
    hand: Node = null;
    public curTime = 0;
    start() {
        // this.curTime = GameStorage.getPig().pigTime;
        this.node.on(Button.EventType.CLICK, () => {
            if(this.curTime>0)return;
            if(GameManger.instance.isAni){
                ViewManager.showTips(i18n.string("str_pstf"));
                return;
            }
            
        ViewManager.showRewardPop(RewardType.money,MoneyManger.instance.getReward(WithdrawUtil.MoneyBls.RewardFree),()=>{
                this.curTime=GameUtil.GetMoneyTime;
            });
        })
        this.showTime();
        this.countDown();
    }

    private async countDown() {
        if (this.curTime > 0) {
            this.curTime--;
            this.showTime();
            // GameStorage.setPigTime(this.curTime);
            this.hand.active = false;
        }else{
            this.hand.active = true;
            this.breathAni();
        }
        await delay(1, this.node);
        this.countDown();
    }
    private showTime(){
        // const str = FormatUtil.mColonS(this.curTime, "：");
        const str = Math.round(this.curTime)+" _";
        this.time.num = str;
    }
    private breathAni(){
        tween(this.icon)
        .to(0.5,{scale:v3(0.9,0.9,1)})
        .to(0.5,{scale:v3(1,1,1)})
        .start();
    }
}


