import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import { EditBox } from 'cc';
import { GameStorage } from '../../GameStorage_Match';
import { Button } from 'cc';
import { ViewManager } from '../../manager/ViewManger';
import { i18n } from '../../../Match_common/i18n/I18nManager';
const { ccclass, property } = _decorator;

@ccclass('WithdrawMethodDialog')
export class WithdrawMethodDialog extends DialogComponent {
    @property([Node])
    btns: Node[] = [];
    @property(EditBox)
    eb: EditBox = null;
    @property(Node)
    btnSubmit: Node = null;

    show(parent: Node, args?: any): void {
        super.show(parent);
        const cb = args.cb;
        const closeCb = args.closeCb;
        this.showBtn();
        this.btns.forEach((v, i) => {
            v.on(Button.EventType.CLICK, () => {
                GameStorage.setPayType(i + 1);
                this.showBtn();
                cb();
            })
        })
        this.btnSubmit.on(Button.EventType.CLICK, this.onSubmit, this);
        this.btnClose.on(Button.EventType.CLICK, () => {
            // if (!this.eb.string)
                closeCb&&closeCb();
        });
        const id = GameStorage.getCardId();
        this.eb.string = id;
    }

    private showBtn() {
        const type = GameStorage.getPayType();
        this.btns.forEach((v, i) => {
            v.getChildByName("k").active = i + 1 == type;
        })
    }
    private onSubmit() {
        const id = this.eb.string;
        GameStorage.setCardId(id);
        // ViewManager.showTips("Account setup successful.");
        ViewManager.showTips(i18n.string("str_ass"));
    }
}


