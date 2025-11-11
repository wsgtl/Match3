/*
 * Jsb.ts
 * 跨平台调用接口
 *
 * Created by alfred
 */

import { _decorator, sys, } from "cc"
import { EDITOR } from "cc/env"
import { CPlus } from "./CPlus"
import { P_Native } from "./P_Native"


const platform_dict = new Map([
    [sys.Platform.ANDROID,                  {name: 'ANDROID',       script: P_Native}],
    [sys.Platform.IOS,                      {name: 'IOS',           script: P_Native}],
    [sys.Platform.WIN32,                    {name: 'WIN32',         script: P_Native}],
    [sys.Platform.MACOS,                    {name: 'MACOS',         script: P_Native}],
    ["KS",                                  {name: 'KS',            script: null}],
    ["FB",                                  {name: 'FB',            script: null}],
])


export class Jsb {
    /** 是否原生平台 */
    static native (): boolean { return sys.isNative }

    /** 是否为移动平台 */
    static mobile (): boolean { return sys.isMobile }

    /** 是否编辑器 */
    static isEditor (): boolean { return EDITOR }

    /** 是否浏览器 */
    static browser (): boolean { return sys.isBrowser }

    /** 是否safari浏览器 */
    static safari (): boolean { return this.browser() && sys.browserType == sys.BrowserType.SAFARI }

    /** 是否chrome */
    static chrome (): boolean { return this.browser() && sys.browserType == sys.BrowserType.CHROME }

    /** 是否IE浏览器 */
    static ie (): boolean { return this.browser() && sys.browserType == sys.BrowserType.IE }

    /** 是否Edge浏览器 */
    static edge (): boolean { return this.browser() && sys.browserType == sys.BrowserType.EDGE }

    /** 是否为原生移动平台 */
    static mobileNative (): boolean { return sys.isNative && (sys.os == "iOS" || sys.os == "Android" || sys.os == "OHOS") }

    /** 是否为移动浏览器平台 */
    static mobileBrowser (): boolean { return sys.isBrowser && (sys.os == "iOS" || sys.os == "Android" || sys.os == "OHOS") }

    /** 是否ios */
    static ios (): boolean { return this.native() && sys.os == "iOS" }

    /** 是否安卓 */
    static android (): boolean { return this.native() && sys.os == "Android" }

    /** 是否mac系统 */
    static mac (): boolean { return this.native() && sys.os == "OS X" }

    /** 是否windows系统 */
    static windows (): boolean { return this.native() && sys.os == "Windows" }

    /** 是否桌面平台，包括windows，macos，linux */
    static desktop (): boolean { return this.native() && (sys.os == "Windows" || sys.os == "OS X" || sys.os == "Linux") }



    /* 平台名称 */
    static getPlatform() {
        if (window["ks"])
            return platform_dict.get("KS")
        if (window["FBInstant"])
            return platform_dict.get("FB")
        
        return platform_dict.get(sys.platform)
    }

    /* 判断是哪个平台 */
    static isPlatform(name: string) {
        return this.getPlatform().name == name
    }

    /**
     * 跨平台接口
     * 
     * @param methodName 方法名称
     * @param data 参数 若传递多个参数使用JSON字符串
     * @param cb 回调方法
     * @param isCPlus 该方法为C++平台接口
     */
    static callMethod(methodName: string, data: any = null, cb: Function = null, isCPlus: boolean = false) {
        if (isCPlus) {
            CPlus.callMethod(methodName, data, cb)
            return
        }

        let script = this.getPlatform().script
        if (script && typeof script.callMethod === "function") {
            script.callMethod(methodName, data, cb)
        }
    }
}
