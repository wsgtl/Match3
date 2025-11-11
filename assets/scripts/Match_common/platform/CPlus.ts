/*
 * CPlus.ts
 * ts与C++交互
 *
 * Created by alfred
 */

import { sys } from "cc"


export class CPlus {
    /* 回调map */
    static cplusCallMap : Map<string, Function> = new Map<string, Function>()

    /**
     * ts调用C++
     * 
     * @param name 方法名称
     * @param data 参数 若传递多个参数使用JSON字符串
     * @param cb 回调方法
     */
    static callMethod(name: string, data: any = null, cb: Function = null) {
        if (!(sys.isNative && (sys.os == "iOS" || sys.os == "Android" || sys.os == "OHOS"))) {
            return
        }
        
        this.cplusCallMap.set(name, cb)
        
        // if (name == "test") {
        //     AutoBinds.MyTest.ins().init(data)
        // }
    }

    /**
     * C++回调ts
     * 
     * @param name 方法名称
     * @param data 参数 若传递多个参数使用&拼接
     */
    static onScript(name: string, data: string = "") {
        let callback = this.cplusCallMap.get(name)
        callback && callback(data)
    }
}

// 将 CPlus 注册为全局类，否则无法在 C++ 中被调用
window["CPlus"] = CPlus

