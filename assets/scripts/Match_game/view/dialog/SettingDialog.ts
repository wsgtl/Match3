import { _decorator, Component, Node } from 'cc';
import { SettingManger } from '../../manager/SettingManger';
import { ViewManager, ViewType } from '../../manager/ViewManger';
import { Button } from 'cc';
import { AudioManager } from '../../manager/AudioManager';
import { native } from 'cc';
import { sys } from 'cc';
import { NativeFun } from '../../../Match_common/native/NativeFun';
import { DialogComponent } from '../../../Match_common/ui/DialogComtnet';
import { LangTag } from '../../../Match_common/native/LocalRate';
import { i18n } from '../../../Match_common/i18n/I18nManager';
const { ccclass, property } = _decorator;

@ccclass('SettingDialog')
export class SettingDialog extends DialogComponent {
    @property(Node)
    btnPrivacy: Node = null;
    @property(Node)
    btnMusic: Node = null;
    @property(Node)
    btnSound: Node = null;
    @property(Node)
    btnShock: Node = null;
    @property(Node)
    btnEn: Node = null;
    @property(Node)
    btnBr: Node = null;
    protected onLoad(): void {
        SettingManger.instance.setDialog(this.node);
        this.btnMusic.on(Button.EventType.CLICK, this.onBtnMusic, this);
        this.btnPrivacy.on(Button.EventType.CLICK, this.onBtnPrivacy, this);
        this.btnSound.on(Button.EventType.CLICK, this.onBtnSound, this);
        this.btnShock.on(Button.EventType.CLICK, this.onBtnShock, this);
        this.showMute(this.btnMusic, AudioManager.getIsPlayBGM());
        this.showMute(this.btnSound, AudioManager.getIsPlay());
        this.showMute(this.btnShock, AudioManager.getIsShock());
        this.btnEn.on(Node.EventType.TOUCH_START, () => { this.setLang("en"); });
        this.btnBr.on(Node.EventType.TOUCH_START, () => { this.setLang("br"); });

        this.showGray();
    }
    onBtnHome() {
        ViewManager.showHome();
    }
    onBtnPrivacy() {//跳转隐私协议
        NativeFun.jumpWeb("https://sites.google.com/view/cjkvkk9081di83nbxxnsuhjsuui2q3/home");

    }
    onBtnMusic() {
        const mute = !AudioManager.getIsPlayBGM();
        AudioManager.setIsPlayBGM(mute);
        mute ? AudioManager.resumeBgm() : AudioManager.pauseBgm();
        this.showMute(this.btnMusic, mute);
    }
    onBtnSound() {
        AudioManager.setIsPlay(!AudioManager.getIsPlay());
        this.showMute(this.btnSound, AudioManager.getIsPlay());
    }
    onBtnShock() {
        AudioManager.setIsShock(!AudioManager.getIsShock());
        this.showMute(this.btnShock, AudioManager.getIsShock());
    }
    private showMute(node: Node, isHide: boolean) {
        node.getChildByName("close").active = !isHide;
    }
    protected onDestroy(): void {
        SettingManger.instance.setDialog(null);
    }

    private setLang(tag: LangTag) {
        const lang = i18n.getLanguage();
        if (lang != tag) {
            i18n.switchLang(tag);
            this.showGray();
        }
    }
    private showGray(){
        const tag = i18n.getLanguage();
        this.btnsShowGray(this.btnEn, tag, "en");
        this.btnsShowGray(this.btnBr, tag, "br");
    }
    private btnsShowGray(btn: Node, curLang: LangTag, tag: LangTag) {
        btn.getChildByName("gray").active = curLang != tag;
    }

}


