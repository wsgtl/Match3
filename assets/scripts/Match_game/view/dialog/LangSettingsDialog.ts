import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import { LangStorage } from '../../../Match_common/localStorage/LangStorage';
import { LangTag } from '../../../Match_common/native/LocalRate';
import { i18n } from '../../../Match_common/i18n/I18nManager';
const { ccclass, property } = _decorator;

@ccclass('LangSettingsDialog')
export class LangSettingsDialog extends DialogComponent {
    @property(Node)
    btnEn: Node = null;
    @property(Node)
    btnBr: Node = null;
    @property(Node)
    btnJp: Node = null;
    @property(Node)
    btnKr: Node = null;
    @property(Node)
    btnTh: Node = null;
    @property(Node)
    btnMy: Node = null;
    @property(Node)
    btnRu: Node = null;
    @property(Node)
    btnDe: Node = null;

    private cb: Function;
    show(parent: Node, args?: any): void {
        parent.addChild(this.node);
        this.cb = args.cb;
        this.init();
    }
    protected onDestroy(): void {
        this.cb?.();
    }
    init() {
        this.btnsShowGo();
        this.btnEn.on(Node.EventType.TOUCH_START, () => { this.setLang("en"); });
        this.btnBr.on(Node.EventType.TOUCH_START, () => { this.setLang("br"); });
        this.btnJp.on(Node.EventType.TOUCH_START, () => { this.setLang("jp"); });
        this.btnKr.on(Node.EventType.TOUCH_START, () => { this.setLang("kr"); });
        this.btnTh.on(Node.EventType.TOUCH_START, () => { this.setLang("th"); });
        this.btnMy.on(Node.EventType.TOUCH_START, () => { this.setLang("my"); });
        this.btnRu.on(Node.EventType.TOUCH_START, () => { this.setLang("ru"); });
        this.btnDe.on(Node.EventType.TOUCH_START, () => { this.setLang("de"); });
    }
    private btnsShowGo() {
        const lang = i18n.getLanguage();
        this.showGo(this.btnEn, "en", lang);
        this.showGo(this.btnBr, "br", lang);
        this.showGo(this.btnJp, "jp", lang);
        this.showGo(this.btnKr, "kr", lang);
        this.showGo(this.btnTh, "th", lang);
        this.showGo(this.btnMy, "my", lang);
        this.showGo(this.btnRu, "ru", lang);
        this.showGo(this.btnDe, "de", lang);
    }
    private showGo(btn: Node, tag: LangTag, curLang: string) {
        btn.getChildByName("go").active = tag == curLang;
    }
    private setLang(tag: LangTag) {
        const lang = i18n.getLanguage();
        if (lang != tag) {
            i18n.switchLang(tag);
            this.btnsShowGo();
        }
    }
    /**关闭动画 */
    async closeAni() {
        this.node.destroy();
    }
}


