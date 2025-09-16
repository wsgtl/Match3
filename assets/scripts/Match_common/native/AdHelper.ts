import { game } from "cc";
import { native } from "cc";
import { sys } from "cc";
import Debugger from "../Debugger";
import { dragonBones } from "cc";
import { delay } from "../utils/TimeUtil";
import { NativeFun } from "./NativeFun";
const debug = Debugger("AdHelper")

export class AdHelper {

    private _getRewardVideo: CallableFunction;//激励视频奖励回调
    private _getRewardVideoFail: CallableFunction;//激励视频广告失败回调



    constructor() {
        this.bindEventHandler();
    }
    public init() {
        this.loadRewardVideo();
        this.loadInterstitial();
        this.loadBanner();
    }

    private bindEventHandler() {
        if (sys.platform === sys.Platform.ANDROID) {
            native.jsbBridgeWrapper.addNativeEventListener("getRewardVideo", (arg: string) => {
                // debug.log("广告我已经获得了激励奖励")
                this._getRewardVideo?.(arg);//获得激励视频奖励
                this._getRewardVideoFail = null;
                this._getRewardVideo = null;
            });
            native.jsbBridgeWrapper.addNativeEventListener("getRewardVideoFail", (arg: string) => {
                debug.log("激励视频广告失败:" + arg);
                this._getRewardVideoFail?.(arg);//获得激励视频奖励
                this._getRewardVideoFail = null;
                this._getRewardVideo = null;
            });
            native.jsbBridgeWrapper.addNativeEventListener("gamePause", (arg: string) => {
                debug.log("游戏暂停 pause");
                game.pause();
            });
            native.jsbBridgeWrapper.addNativeEventListener("gameResume", (arg: string) => {
                debug.log("游戏恢复 resume");
                game.resume();
            });

        }
    }

    /**加载激励视频广告 */
    public loadRewardVideo() {
        if (sys.platform === sys.Platform.ANDROID) {
            native.jsbBridgeWrapper.dispatchEventToNative("loadRewardVideo");
        }
    }
    /**显示激励视频广告 */
    public showRewardVideo(placement:string,callback: CallableFunction, fail?: CallableFunction) {
        console.log("显示激励广告1")
        if (sys.platform === sys.Platform.ANDROID) {
            console.log("显示激励广告2")
            native.jsbBridgeWrapper.dispatchEventToNative("showRewardVideo","激励广告:"+placement);
            this._getRewardVideo = callback;
            this._getRewardVideoFail = fail ? fail : callback;

            // debug.log("激励视频广告失败:" );
            // callback?.();
        } else {//网页端直接回调
            callback?.();
            // fail(1);
        }

    }
    /**加载插屏广告 */
    public loadInterstitial() {
        if (sys.platform === sys.Platform.ANDROID) {
            native.jsbBridgeWrapper.dispatchEventToNative("loadInterstitial");

        }
    }
    /**显示插屏广告*/
    public showInterstitial(placement:string) {
        console.log("显示插屏广告1")
        if (sys.platform === sys.Platform.ANDROID) {
            console.log("显示插屏广告2")
            native.jsbBridgeWrapper.dispatchEventToNative("showInterstitial","插屏广告:"+placement);
        }
    }
    private interTime = 0;
    /**限定次数弹插屏广告 */
    public timesToShowInterstitial(t: number = 4) {
        this.interTime++;
        if (this.interTime >= t) {
            this.interTime = 0;
            const tip = `点击退出${t}次后展示插屏`;
            console.log(tip);
            this.showInterstitial(tip);
        }
    }
    /**加载横幅广告 */
    public loadBanner() {
        return;//暂时不能使用
        if (sys.platform === sys.Platform.ANDROID) {
            native.jsbBridgeWrapper.dispatchEventToNative("loadBanner");

        }
    }
    /**显示横幅广告*/
    public showBanner() {
        return;//暂时不能使用
        if (sys.platform === sys.Platform.ANDROID) {
            native.jsbBridgeWrapper.dispatchEventToNative("showBanner");
        }
    }
    /**隐藏横幅广告*/
    public hideBanner() {
        return;//暂时不能使用
        if (sys.platform === sys.Platform.ANDROID) {
            native.jsbBridgeWrapper.dispatchEventToNative("hideBanner");
        }
    }

}

export const adHelper = new AdHelper();