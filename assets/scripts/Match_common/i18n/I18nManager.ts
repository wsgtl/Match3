import { SpriteFrame, Node } from "cc";
import { AssetReference } from "../recycle/Recycler";
import { Component } from "cc";
import Debugger from "../Debugger";
import { resources } from "cc";
import { LangStorage } from "../localStorage/LangStorage";
import { sprites } from "../recycle/AssetUtils";
import { BaseStorageNS } from "../localStorage/BaseStorage";
import { LangTag } from "../native/LocalRate";

const debug = Debugger('I18nManager');


export interface ILang {
    readonly [key: string]: string;
}
class I18nManager {
    private static _i18n: I18nManager | null = null;

    static instance(): I18nManager {
        if (!I18nManager._i18n) {
            I18nManager._i18n = new I18nManager();
        }
        return I18nManager._i18n;
    }
    private _refs = new Map<Node, I18nObject>();

    private loadedLangTag: LangTag;
    private lang: ILang;
    get defaultLanguage(): LangTag {
        return 'en';
    }

    get root(): string {
        return 'lang';
    }
    basePath(lang: LangTag) {
        return `${this.root}/${lang}`;
    }

    defaultPath() {
        return this.basePath(this.defaultLanguage);
    }
    // 获取指定路径的国际化真实路径
    path(name: string) {
        return `${this.defaultPath()}/${name}`;
    }
    /**获取当前保存语言指定路径 */
    curLangPath(name: string) {
        return `${this.basePath(this.getLanguage())}/${name}`;
    }
    //     /**
    //  * 获取指定路径的国际化真实路径
    //  * 末尾不会主动拼装/spriteFrame
    //  * @param name
    //  * @param normal
    //  */
    //     path(name: string, normal: boolean = false) {
    //         if (!name || !name.length) return null;
    //         if (name.indexOf('/') === 0) {
    //             // eslint-disable-next-line no-param-reassign
    //             name = name.replace('/', '');// 只需要替换第一个
    //         }
    //         let sf = '/spriteFrame';
    //         if (name.substring(name.length - sf.length, name.length) === sf) {
    //             sf = '';
    //         }
    //         if (!normal) {
    //             const i18n = this.language.tag;
    //             let realPath = `${this.basePath(i18n)}/${name}`;
    //             const info = resources.getInfoWithPath(`${realPath}${sf}`, SpriteFrame);
    //             if (!info && i18n !== this.defaultLanguage) {// 找不到指定语言的资源图时，使用默认语言图进行加载
    //                 debug.warn(`maybe spriteFrame without of the language-${i18n} in ${realPath}`);
    //                 realPath = `${this.basePath(this.defaultLanguage)}/${name}`;
    //             }
    //             return realPath;
    //         }
    //         return `${this.defaultPath()}/${name}`;
    //     }

    unbind(owner: Component) {
        const node: Node = owner.node;
        this._refs?.delete(node);
    }

    bindNode(owner: Component, obj: I18nObject): Node {
        const refs = this._refs;
        const node: Node = owner.node;
        refs.set(node, obj);
        // if (!node || !node.isValid) {
        //     if (refs && refs.has(node))
        //         refs.delete(node);
        //     return null;
        // }
        // if (!refs.has(node)) {// 如果引用中没有该Node 则为其绑定onDestroy方法
        //     node.once(Node.EventType.NODE_DESTROYED, () => {
        //         if (refs && refs.has(node))
        //             refs.delete(node);
        //     });
        // }
        // let objs = refs.get(node);
        // if (!objs) {
        //     objs = [obj];
        // } else if (!objs.find(o => o.callback === obj.callback)) {
        //     objs.push(obj);
        // }
        // refs.set(node, objs);
        return node;
    }


    /**
     * 加载多语言文件
     */
    public loadLang(tag?: LangTag): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            let tagFileName = tag;
            if (!tagFileName) {
                tagFileName = this.getLanguage();
            }
            debug.log('Try to set language : ', tagFileName);
            if (this.loadedLangTag === tagFileName) {
                // 设定的语言与加载的语言一致，则无需重复加载
                resolve(true);
                return;
            }
            const last = this.loadedLangTag;
            this.loadedLangTag = null; // 避免多处同时加载可能出现的错误
            resources.load('lang/' + tagFileName, (err, jsonAsset: any) => {
                if (jsonAsset) {
                    this.lang = jsonAsset.json;
                    this.loadedLangTag = tagFileName;
                    resolve(true);
                } else {
                    // 不能因为加载语言失败导致游戏崩溃
                    debug.warn(`加载${tagFileName}语言失败`);
                    this.loadedLangTag = last;
                    resolve(false);
                }
            });
        });
    }

    /**
     * 获取当前语言
     */
    public getLanguage(): LangTag {
        let tag = LangStorage.getLocalLanguage();
        if (!tag) {
            tag = this.defaultLanguage;
            LangStorage.setLocalLanguage(tag);
        }
        return tag as LangTag;
    }
    /**
 * 默认使用当前选中的语言
 * @param key
 * @param args
 */
    public getStringWithKey(key: string, ...args: string[]): string {
        const strArr = key.split('.');
        let string: any;
        try {
            for (let i = 0; i < strArr.length; i++) {
                const item = strArr[i];
                if (i === 0) {
                    string = this.lang[item];
                    if (typeof string !== 'object') {
                        break;
                    }
                } else {
                    string = string[item]; // 存在content.warn   content.log 警告
                }
            }
            if (string && args && Array.isArray(args)) {
                args.forEach(arg => {
                    string = string.replace('%s', arg);
                });
            }
            return string ? string : key;
        } catch (error) {
            return key;
        }
    }

    /**获取多语言字符串 */
    string(key: string, ...args: string[]) {
        return this.getStringWithKey(key, ...args);
    }

    /**切换语言 */
    async switchLang(tag: LangTag) {
        LangStorage.setLocalLanguage(tag);
        await this.loadLang(tag);
        this._refs.forEach((obj, node) => {
            if (obj.type === "label") {
                const n = node.getComponent("LabelI18n") as any;
                n?.show();
            } else if (obj.type === "sprite") {
                const n = node.getComponent("SpriteI18n") as any;
                n?.show();
            }
        })
    }

}

interface I18nObject {
    type: string,// 'sprite','label'
    path?: string,// sprite的资源路径 type 为'sprite'时生效
    callback?: (sp: AssetReference<SpriteFrame>) => void,// sprite的回调方法
    stringKey?: string,// label的字符串key type 为'label'时生效
    stringArgs?: string[]// label的字符串填充值 type 为'label'时生效    
}

export interface i18nBase {
    show(): void;
}

// 导出 I18nManager 的实例  
export const i18n = I18nManager.instance();