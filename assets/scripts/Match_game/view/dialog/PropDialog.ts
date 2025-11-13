import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import { GameUtil, PropType } from '../../GameUtil_Match';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { sprites } from '../../../Match_common/recycle/AssetUtils';
import { i18n } from '../../../Match_common/i18n/I18nManager';
import { SpriteFrame } from 'cc';
import { Sprite } from 'cc';
import { Button } from 'cc';
import { adHelper } from '../../../Match_common/native/AdHelper';
import { ViewManager } from '../../manager/ViewManger';
import { GameStorage } from '../../GameStorage_Match';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { delay, tweenPromise } from '../../../Match_common/utils/TimeUtil';
import { ConfigConst } from '../../manager/ConfigConstManager';
import { CoinManger } from '../../manager/CoinManger';
const { ccclass, property } = _decorator;

@ccclass('PropDialog')
export class PropDialog extends DialogComponent {
    @property(Node)
    title: Node = null;
    @property(Node)
    prop: Node = null;
    @property(Node)
    tips: Node = null;
    @property(NumFont)
    numNode: NumFont = null;
    @property(Node)
    btnClaim: Node = null;
    @property(Node)
    btns: Node = null;
    @property(NumFont)
    coinNum: NumFont = null;
    @property([SpriteFrame])
    sfs: SpriteFrame[] = [];

    type: PropType;
    cb: Function;

    showStart(args?: any): void {
        this.type = args.type;
        this.cb = args.cb;

        sprites.setTo(this.title, i18n.curLangPath("title_prop" + this.type));
        sprites.setTo(this.tips, i18n.curLangPath("str_prop" + this.type));
        this.prop.getComponent(Sprite).spriteFrame = this.sfs[this.type - 1];
        this.numNode.num = "x" + GameUtil.PropAddNum;
        this.btnClaim.on(Button.EventType.CLICK, this.onClaim, this);
        this.btns.getChildByName("btnAd").on(Button.EventType.CLICK, this.onClaim, this);
        this.btns.getChildByName("btnCoin").on(Button.EventType.CLICK, this.onClaimCoin, this);

        const isShowA = ConfigConst.isShowA;
        this.btnClaim.active = !isShowA;
        this.btns.active = isShowA;
        this.coinNum.num = GameUtil.PropCoin;
    }
    async onClaim() {
        if (this.isAni) return;
        adHelper.showRewardVideo("增加道具界面", () => {
            this.addProp();
        }, ViewManager.adNotReady);
        this.isAni = true;
        await delay(0.5);
        this.isAni = false;
    }
    async onClaimCoin() {//使用金币购买道具
        if (this.isAni) return;
        const cn = GameUtil.PropCoin;
        if (GameStorage.getCoin() < cn) {
            ViewManager.showTips(i18n.string("str_nogold"));
            return;
        }
        CoinManger.instance.addCoin(-cn,false);
        this.addProp();
    }
    private addProp() {
        GameStorage.addProp(this.type, GameUtil.PropAddNum);
        ActionEffect.scaleBigToSmall(this.prop, 1.3, 1, 0.4);
        tweenPromise(this.numNode.node, t => t
            .by(0.1, { y: 30 })
            .by(0.1, { y: -30 })
        )
        this.cb();
        this.closeAni();
    }
}


