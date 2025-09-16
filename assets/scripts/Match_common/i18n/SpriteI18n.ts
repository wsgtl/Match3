import { _decorator, assetManager, CCString, Sprite } from 'cc';
import { Component } from 'cc';
import { i18n, i18nBase } from './I18nManager';
import { sprites } from '../recycle/AssetUtils';

const { ccclass, property, type, menu, requireComponent } = _decorator;
@ccclass
@menu('多语言组件/SpriteI18n')
@requireComponent(Sprite)
/**
 * 使用方式与Sprite无异
 * 一旦指定了{@link spriteFramePath}属性，则在onload或者手动切换语言后，则会实时加载指定的路径的图片资源覆盖原本设定的值
 */
export default class SpriteI18n extends Component implements i18nBase {

    @property({ serializable: true, displayName: '多语言资源路径', tooltip: '设置后，会自动加载当前所选语言下对应路径的资源图。在编辑模式下，如果没有指定该属性，则会自动根据当前所设置的spriteFrame获取对应的多语言资源路径进行赋值' })
    @type(CCString)
    spriteFramePath: string | null = "";

    public start() {
        this.show();
        i18n.bindNode(this, { type: "sprite", path: this.spriteFramePath });
    }

    onDestroy() {
        i18n.unbind(this);
    }

    show() {
        const sprite = this.node.getComponent(Sprite);
        if (!this.spriteFramePath) {
            if (sprite?.spriteFrame) {
                const resources = assetManager.getBundle('resources');
                if (resources) {
                    const pathInfo: any = resources.getAssetInfo(sprite.spriteFrame._uuid);
                    const path: string = pathInfo.path;
                    if (path) {
                        const start = i18n.basePath(i18n.defaultLanguage);
                        const regExp = new RegExp(`${start}/(\\S*)/spriteFrame`);
                        const match = path.match(regExp);
                        if (match && match.length > 1)
                            this.spriteFramePath = path.match(regExp)[1];
                    }
                }
            }
        }
        if (this.spriteFramePath) {
            sprites.setTo(sprite, i18n.curLangPath(this.spriteFramePath));
        }
    }

}