import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { ViewManager } from '../../manager/ViewManger';
import { Coin } from './Coin';
import { Money } from './Money';
import { CoinManger } from '../../manager/CoinManger';
import { Progress } from './Progress';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { GameStorage } from '../../GameStorage_Match';
import { GameUtil, RewardType } from '../../GameUtil_Match';
import { tween } from 'cc';
import { GameManger } from '../../manager/GameManager';
import { AudioManager } from '../../manager/AudioManager';
import { i18n } from '../../../Match_common/i18n/I18nManager';
import { EventTracking } from '../../../Match_common/native/EventTracking';
const { ccclass, property } = _decorator;

@ccclass('Top')
export class Top extends Component {
    @property(Node)
    btnSetting: Node = null;
    @property(Node)
    btnRule: Node = null;

    @property(Coin)
    coinbg: Coin = null;
    @property(Money)
    moneybg: Money = null;


    protected onLoad(): void {
        this.btnRule.on(Button.EventType.CLICK, this.onRule, this);
        this.btnSetting.on(Button.EventType.CLICK, this.onSetting, this);
        CoinManger.instance.curTop = this;
        this.showBack(false);
    }

    onRule() {
        if (GameManger.instance.isAni){
            ViewManager.showTips(i18n.string("str_pstf"));
            return;
        }
        ViewManager.showRuleDialog();
    }
    onSetting() {
        if (GameManger.instance.isAni) {
            ViewManager.showTips(i18n.string("str_pstf"));
            return;
        }
        ViewManager.showSettings();
    }

    onBack() {
        this.cb?.();
        this.showBack(false);
    }

    private cb: Function;

    showBack(v: boolean, cb: Function = null) {
        this.cb = cb;
        this.btnRule.active = !v;
        this.btnSetting.active = !v;
        this.coinbg.canClick = !v;
        this.moneybg.canClick = !v;
    }

   
   
}


