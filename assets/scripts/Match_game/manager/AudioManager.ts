import { AudioClip, Node } from "cc";
import { resources } from "cc";
import { AudioSource } from "cc";
import { delay } from "../../Match_common/utils/TimeUtil";
import { destroyNode, isVaild } from "../../Match_common/utils/ViewUtil";
import Debugger from "../../Match_common/Debugger";
import { sys } from "cc";
import { MathUtil } from "../../Match_common/utils/MathUtil";
import { AudioStorage } from "../../Match_common/localStorage/AudioStorage";
import { NativeFun } from "../../Match_common/native/NativeFun";

export namespace AudioManager {
    const debug = Debugger('AudioManager');
    let bgmNode: AudioSource;
    /**音量 0-1*/
    let volume: number = 0.5;


    export function getIsPlayBGM() {
        return AudioStorage.getIsPlayBGM();
    }
    export function setIsPlayBGM(v: boolean) {
        return AudioStorage.setIsPlayBGM(v);
    }
    export function getIsPlay() {
        return AudioStorage.getIsPlay();
    }
    export function setIsPlay(v: boolean) {
        return AudioStorage.setIsPlay(v);
    }
    export function getIsShock() {
        return AudioStorage.getIsShock();
    }
    export function setIsShock(v: boolean) {
        return AudioStorage.setIsShock(v);
    }
   /**震动
     * @param duration 震动时间,毫秒
     * @param amplitude 震动幅度 1~255
     */
    export function vibrate(duration: number, amplitude: number = -1) {
        if (!AudioManager.getIsShock()) return;
        NativeFun.vibrate(duration,amplitude);
    }
    export function setBgmNode(b: AudioSource) {
        bgmNode = b;
    }
    export function playEffect(name: string, v: number = 1) {
        if (!AudioStorage.getIsPlay()) return;
        if (v >= 2) {
            const n = Math.floor(v);
            for (let i = 0; i < n; i++) {
                _playEffect(name, v);
            }
        } else {
            _playEffect(name, v);
        }

    }
    function _playEffect(name: string, v: number = 1) {
        if (!bgmNode || !bgmNode.isValid)
            return;

        resources.load(`sounds/effect/${name}`, AudioClip, (err, ac) => {
            if (ac) {

                const effectNode = new Node();
                const as = effectNode.addComponent(AudioSource);
                as.loop = false;
                as.volume = v;
                as.playOnAwake = false;
                bgmNode.node.addChild(effectNode);
                as.playOneShot(ac);
                // 加入列表
                // this.insertClip(key, ac.getDuration());
                delay(ac.getDuration()).then(() => {
                    destroyNode(effectNode);
                });
            }
        });
    }
    export function getBgm() {
        return bgmNode;
    }

    export function playBgm(name: string, v?: number) {
        if (!isVaild(bgmNode)) return;
        const as = bgmNode;
        as.volume = v ? v : volume;
        if (as.clip && as.clip.name === name) {// 播放同一个音频
            if (!as.playing)
                try {
                    as.play();
                    if (!AudioStorage.getIsPlayBGM()) { as.pause(); }
                } catch (e) {
                    debug.log(`播放背景音乐失败${name}`);
                    debug.log(e);
                }
        } else {// 播放不同音频
            resources.load(`sounds/bgm/${name}`, AudioClip, (err, ac) => {
                if (ac) {
                    try {
                        if (as.playing)
                            as.stop();
                        ac.name = name;
                        as.clip = ac;
                        as.loop = true;
                        as.play();
                        if (!AudioStorage.getIsPlayBGM()) { as.pause(); }
                    } catch (e) {
                        debug.log(`加载并播放背景音乐失败${name}`);
                        debug.log(e);
                    }
                }
            });

        }
    }

    export function pauseBgm() {
        if (!isVaild(bgmNode))
            return;
        const as = bgmNode;
        if (as) {
            try {
                as.pause();
                this.currentBgmTime = as.currentTime;
                debug.log('暂停背景音乐:', this.currentBgmTime);
            } catch (e) {
                debug.log('暂停背景音乐失败');
                debug.log(e);
            }
        }
    }

    export function resumeBgm() {
        if (!isVaild(bgmNode))
            return;

        const as = bgmNode;
        if (as && as.clip)
            try {
                if (sys.platform === sys.Platform.IOS) {
                    as.stop();
                    if (this.currentBgmTime > 0)
                        as.currentTime = this.currentBgmTime;
                }
                as.play();
                debug.log('恢复播放背景音乐:', as.currentTime);
            } catch (e) {
                debug.log(`恢复播放背景音乐失败`);
                debug.log(e);
            }
    }

    export function stopBgm() {
        this.currentBgmTime = 0;
        if (!isVaild(bgmNode))
            return;
        const as = bgmNode;
        try {
            as.stop();
        } catch (e) {
            debug.log(`停止播放背景音乐失败`);
            debug.log(e);
        }
    }

    let n: AudioSource;
    export function playXuli() {
        if (!n) {
            const effectNode = new Node();
            n = effectNode.addComponent(AudioSource);
        }
        const name = "xuli";
        const as = n;
        resources.load(`sounds/effect/${name}`, AudioClip, (err, ac) => {
            if (ac) {
                try {
                    if (as.playing)
                        as.stop();
                    ac.name = name;
                    as.clip = ac;
                    as.loop = false;
                    as.volume = 0.3;
                    as.play();
                } catch (e) {
                }
            }
        });
    }
    export function stopXuli() {
        const as = n;
        as?.stop();
    }
}