import { native } from "cc";
import { sys } from "cc";


/**获取国家码和汇率 */
export namespace LocalRate {
    /**获取国家码 */
    export function getCode() {
        return new Promise<CountryCode>(res => {
            if (sys.platform === sys.Platform.ANDROID) {
                native.jsbBridgeWrapper.addNativeEventListener("getCode", (code: string) => {
                    res(code as CountryCode);
                });
                native.jsbBridgeWrapper.dispatchEventToNative("locale");
            } else {
                return res("US");
            }
        })
    }
    /**获取汇率 */
    // export async function getRete(code: CountryCode): Promise<number> {
    //     if (code == "US") { return 1; }
    //     try{
    //         // 获取特定货币对的汇率
    //         const eurToUsd = await forex.from('EUR').to('USD').fetch();
    //         console.log('EUR to USD:', eurToUsd);
    //         return eurToUsd;
    //     }catch(e){
    //         console.log(e);
    //         return 0;
    //     }

    // }
    /**初始化获取国家码和汇率，只用一次，后续不会变 */
    export async function initCodeAndRate() {
        const code = await getCode();
        let data: CountryData = CountryDatas[code];
        if (!data) {
            data = CountryDatas.US;//默认美元
        }
        // const rate = await getRete(data.code);
        // if (rate)
        //     data.rate = rate;
        return data;
    }
    export function isSymbol(s: string) {
        return symbols.indexOf(s) > -1;
    }
    /**钱符号 */
    export const symbols: string[] = ["$", "R", "¥", "₩", "฿", "M", "S", "₽", "€", "C"]
}
/**多语言标志 */
export type LangTag = "en" | "br" | "jp" | "kr" | "th" | "my" | "ru" | "de";
/**国家码 */
export type CountryCode = "US" | "BR" | "JP" | "KR" | "TH" | "MY" | "SG" | "RU" | "DE" | "CA";
/**钱币符号 */
export enum MoneySymbol {
    US = "$",
    BR = "R$",
    JP = "¥",
    KR = "₩",
    TH = "฿",
    MY = "RM",
    SG = "S$",
    RU = "₽",
    DE = "€",
    CA = "C$",
}

export interface CountryData {
    lang: LangTag,
    /**汇率 */
    rate: number,
    /**符号 */
    symbol: MoneySymbol,
    /**国家码 */
    code: CountryCode
}
/**已适配国家码 */
export const CountryDatas: {
    [key in CountryCode]?: CountryData
} = {
    US: { lang: "en", rate: 1, symbol: MoneySymbol.US, code: "US" },
    BR: { lang: "br", rate: 5, symbol: MoneySymbol.BR, code: "BR" },
    // JP: { lang: "jp", rate: 143.66, symbol: MoneySymbol.JP, code: "JP" },
    // KR: { lang: "kr", rate: 1383.37, symbol: MoneySymbol.KR, code: "KR" },
    // TH: { lang: "th", rate: 32.82, symbol: MoneySymbol.TH, code: "TH" },
    // MY: { lang: "my", rate: 4.2355, symbol: MoneySymbol.MY, code: "MY" },
    // SG: { lang: "en", rate: 1.2936, symbol: MoneySymbol.SG, code: "SG" },
    // RU: { lang: "ru", rate: 80.91, symbol: MoneySymbol.RU, code: "RU" },
    // DE: { lang: "de", rate: 0.8828, symbol: MoneySymbol.DE, code: "DE" },
    // CA: { lang: "en", rate: 1.3819, symbol: MoneySymbol.CA, code: "CA" },
}