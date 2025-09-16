import { _decorator, Label, CCString } from 'cc';
import { Component } from 'cc';
import { i18nBase } from './I18nManager';
import { i18n } from './I18nManager';

const { ccclass, property, type, menu, requireComponent } = _decorator;

@ccclass

@menu('多语言组件/LabelI18n')
@requireComponent(Label)
/**
 * 使用方式与Label无异
 * 一旦指定了{@link stringKey}属性，则在onload或者手动切换语言后，则会实时加载指定的字符串键覆盖原本设定的值
 */
export default class LabelI18n extends Component implements i18nBase {

    @property({ serializable: true })
    @type(CCString)
    stringKey: string = "";


    public start() {
        i18n.bindNode(this, { type: "label", stringKey: this.stringKey });
        this.show();
    }

    onDestroy() {
        i18n.unbind(this);
    }
    
    show() {
        if (!this.stringKey) return;
        const label = this.node.getComponent(Label);
        if (label)
            label.string = i18n.string(this.stringKey);
    }
}