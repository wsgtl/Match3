import { _decorator, Component, Node } from 'cc';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { GameStorage } from '../../GameStorage_Match';
import { Button } from 'cc';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
import { ButtonLock } from '../../../Match_common/Decorator';
import { MoneyManger } from '../../manager/MoneyManger';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { delay } from '../../../Match_common/utils/TimeUtil';
import { Tween } from 'cc';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { LangStorage } from '../../../Match_common/localStorage/LangStorage';
import { v3 } from 'cc';
import { GameManger } from '../../manager/GameManager';
const { ccclass, property } = _decorator;

@ccclass('Money')
export class Money extends Component {
    @property(NumFont)
    num: NumFont = null;
    @property(Node)
    btnGet: Node = null;
    @property(Node)
    tip: Node = null;
    @property(Node)
    top: Node = null;
    @property(Node)
    moneyNode: Node = null;

    public canClick: boolean = true;
    public cb:Function;
    protected onLoad(): void {
        this.num.aligning = 1;
        this.showCurMoney();
        this.node.on(Node.EventType.TOUCH_START, this.onGet, this);
        this.btnGet.on(Button.EventType.CLICK, this.onGet, this);
        MoneyManger.instance.setMoneyNode(this);
    }
    showNum(num: number) {
        let n: string;

        // const xsd = num > 999.9 ? 4 : (num > 999 ? 3 : 2);
        n = FormatUtil.toXXDXX(num, 2,false);
        const str = LangStorage.getData().symbol +" "+ n;
        this.num.num = str;
        // const sc = str.length > 7 ? (7 / str.length) : 1;
        // this.num.node.scale = v3(sc, sc);
    }
    showCurMoney() {
        this.showNum(GameStorage.getMoney());
    }
    @ButtonLock(1)
    onGet() {
        if (!this.canClick || GameManger.instance.isAni) return;
        MoneyManger.instance.showDialog();
        this.cb?.();
    }

    showTips() {
        Tween.stopAllByTarget(this.tip);
        UIUtils.setAlpha(this.tip, 1);
        this.tip.active = true;
        ActionEffect.scale(this.tip, 0.3, 1, 0, "backOut");
        delay(4, this.tip).then(() => {
            ActionEffect.fadeOut(this.tip);
        })
    }
    /**设置按钮是否可点击 */
    setBtnInter(v: boolean) {
        this.btnGet.getComponent(Button).interactable = v;
    }
    showTop(v: boolean) {
        if (this.top)
            this.top.active = v;
    }
}


