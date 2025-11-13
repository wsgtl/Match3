import { RichText } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { delay, tweenPromise } from '../../../Match_common/utils/TimeUtil';
import { MathUtil } from '../../../Match_common/utils/MathUtil';
import { isVaild } from '../../../Match_common/utils/ViewUtil';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { LangStorage } from '../../../Match_common/localStorage/LangStorage';
import { WithdrawUtil } from '../withdraw/WithdrawUtil';
import { i18n } from '../../../Match_common/i18n/I18nManager';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { GameUtil } from '../../GameUtil_Match';
import { ConfigConst } from '../../manager/ConfigConstManager';
const { ccclass, property } = _decorator;

@ccclass('Bulletin')
export class Bulletin extends Component {
    @property(Node)
    bulletin: Node = null;
    @property(RichText)
    text: RichText = null;

    protected start(): void {
        if(ConfigConst.isShowA)return;//A面去掉提现公告
        this.showBulletin();
    }
    private async showBulletin() {
        await delay(MathUtil.random(10,20),this.node);
        if (!isVaild(this.node)) return;
        this.bulletin.x = 1200;
        const p = "Player_" + GameUtil.gerRandomId();
        const money = LangStorage.getData().symbol + " " + WithdrawUtil.moneyCash[GameUtil.calPropBackType([0.6,0.3,0.1])];
        // this.text.string = "<b><outline color=#cf5014 width=1>" + i18n.string("str_bulletin", p, money);
        this.text.string = "<b>" + i18n.string("str_bulletin", p, money);
        UIUtils.setWidth(this.bulletin, Math.max(724, UIUtils.getWidth(this.text.node) + 60));
        await ActionEffect.moveTo(this.bulletin, 10, -1200, 0);
        this.showBulletin();

    }
}


