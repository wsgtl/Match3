// import { resources, sys } from "cc";
// import { BaseEventTarget } from "../BaseEventTarget";
// import Debugger from "../Debugger";
// import { LangStorage } from "../localStorage/LangStorage";

// const debug = Debugger('setup');

// export interface ILang {
//     readonly [key: string]: string;
// }

// export default class LangCtr extends BaseEventTarget {
    
//     private static instance: LangCtr;
//     public static getInstance() {
//         if (!this.instance) {
//             this.instance = new LangCtr();
//         }
//         return this.instance;
//     }

//     private lang: ILang;
//     private loadedLangTag: string;

//     /**
//      * 加载多语言文件
//      */
//      public loadLang(tag?: string): Promise<boolean> {
//         return new Promise<boolean>(resolve => {
//             let tagFileName = tag;
//             if (!tagFileName) {
//                 tagFileName = this.getLanguage();
//             }
//             debug.log('Try to set language : ', tagFileName);
//             if (this.loadedLangTag === tagFileName) {
//                 // 设定的语言与加载的语言一致，则无需重复加载
//                 resolve(true);
//                 return;
//             }
//             const last = this.loadedLangTag;
//             this.loadedLangTag = null; // 避免多处同时加载可能出现的错误
//             resources.load('locale/' + tagFileName, (err, jsonAsset: any) => {
//                 if (jsonAsset) {
//                     this.lang = jsonAsset.json;
//                     this.loadedLangTag = tagFileName;
//                     resolve(true);
//                 } else {
//                     // 不能因为加载语言失败导致游戏崩溃
//                     debug.warn(`加载${tagFileName}语言失败`);
//                     this.loadedLangTag = last;
//                     resolve(false);
//                 }
//             });
//         });
//     }

//     /**
//      * 设置语言,需要刷新下界面
//      * @param tag
//      */
//      public async setLanguage(tag: string, reload: boolean = true) {
//         debug.log('存储当前语言', tag);
//         LangStorage.setLocalLanguage(tag);
//         if (reload) await this.loadLang(tag);
//     }

//     /**
//      * 获取当前语言
//      */
//     public getLanguage(): string {
//         let tag = LangStorage.getLocalLanguage();
//         if (!tag) {
//             tag = SystemConf.getDefaultLanguage();
//             LangStorage.setLocalLanguage(tag);
//         }
//         // if(tag && tag !== 'en'){
//         //     tag = SystemConf.getDefaultLanguage();
//         //     LangStorage.setLocalLanguage(tag);
//         // }
//         return tag;
//     }

//     /**
//      * 获取系统可选语言
//      */
//      public getAllLanguage(): ILanguage[] {
//         return language;
//     }

//     /**
//      * 默认使用当前选中的语言
//      * @param key
//      * @param args
//      */
//     public getStringWithKey(key: string, ...args: string[]): string {
//         const strArr = key.split('.');
//         let string: any;
//         try {
//             for (let i = 0; i < strArr.length; i++) {
//                 const item = strArr[i];
//                 if (i === 0) {
//                     string = this.lang[item];
//                     if (typeof string !== 'object') {
//                         break;
//                     }
//                 } else {
//                     string = string[item]; // 存在content.warn   content.log 警告
//                 }
//             }
//             if (string && args && Array.isArray(args)) {
//                 args.forEach(arg => {
//                     string = string.replace('%s', arg);
//                 });
//             }
//             return string ? string : key;
//         } catch (error) {
//             return key;
//         }
//     }

//     /**
//      * 获取自定义设置
//      * @param key
//      */
//      public customGet(key: string): string {
//         return sys.localStorage.getItem(key);
//     }

//     /**
//      * 添加自定义设置
//      * @param key
//      * @param value
//      */
//     public customSet(key: string, value: string): void {
//         return sys.localStorage.setItem(key, value);
//     }
// }


