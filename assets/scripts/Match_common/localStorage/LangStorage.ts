import { CountryData, LocalRate } from '../native/LocalRate';
import { BaseStorageNS, ITEM_STORAGE } from './BaseStorage';

/**
 * 系统设置类的缓存，不用加密
 */
export namespace LangStorage {
    const LangData = {
        lang: "en",
        //国家码
        code: "US",
        //汇率
        rate: 1,
        /**符号 */
        symbol: "$"
    }
    /**
     * 保存游戏信息
     */
    export function saveLocal() {
        let tag = JSON.stringify(LangData)
        BaseStorageNS.setItem(ITEM_STORAGE.LANGUAGE, tag);
    }

    export async function init() {
        let a = BaseStorageNS.getItem(ITEM_STORAGE.LANGUAGE);
        if (!a) {//第一次进游戏就直接获取国家码和汇率，其他国家全部是美元
            const d = await LocalRate.initCodeAndRate();
            LangData.code = d.code;
            LangData.rate = d.rate;
            LangData.lang = d.lang;
            LangData.symbol = d.symbol;
            this.saveLocal();
            return;
        }
        try {
            let data = JSON.parse(a);
            for (let i in data) {
                if (LangData[i] != undefined && data[i] != undefined)
                    LangData[i] = data[i];
            }
            this.saveLocal();
        } catch (e) {
            this.saveLocal();
        }

    }
    /**
     * 设置语言
     * @param tag
     */
    export function setLocalLanguage(tag: string) {
        LangData.lang = tag;
        saveLocal();
        // BaseStorageNS.setItem(ITEM_STORAGE.LANGUAGE, tag);
    }

    export function getLocalLanguage(): string {
        return LangData.lang;
        // return BaseStorageNS.getItem(ITEM_STORAGE.LANGUAGE);
    }
    /**获取多语言信息 */
    export function getData() {
        return LangData;
    }
    /**设置国家码 */
    export function setCode(code: string) {
        LangData.code = code;
        saveLocal();
    }
    /**设置汇率 */
    export function setRate(rate: number) {
        LangData.rate = rate;
        saveLocal();
    }
}
