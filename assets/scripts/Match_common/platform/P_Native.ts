/*
 * P_Native.ts
 * 原生平台接口
 *
 * Created by alfred
 */

import { native, } from 'cc';


export class P_Native {
    /* 回调map */
    static nativeCallMap : Map<string, Function> = new Map<string, Function>()

    /**
     * @param name 平台方法名称
     * @param args 参数
     * @param cb 回调方法
     */
    static callMethod(name: string, args: string = "", cb?: Function) {
        if (name == "initGame") {
            this.initGame()
            return
        }

        if (args && typeof args != "string") {
            console.error(`${name}"参数错误 参数类型必须是 string!!!"`)
            return
        }
        
        this.nativeCallMap.set(name, cb)
        native.bridge.sendToNative(name, args)
    }

    /**
     * 监听native回调cocos接口 (在程序启动的时候调用)
     * @param arg0 回调方法名
     * @param arg1 回调参数
     */
    static initGame() {
        native.bridge.onNative = (arg0: string, arg1: string) => {
            let callback = this.nativeCallMap.get(arg0)
            callback?.(arg1)
        }
    }
}