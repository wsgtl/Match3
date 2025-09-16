import { BaseStorageNS, ITEM_STORAGE } from './BaseStorage';

/**
 * 系统设置类的缓存，不用加密
 */
export namespace AudioStorage {
    /**音频信息 */
    const _audioData = {
        /**是否能播放音频 */
        isPlay: true,
        /**是否能播放BGM */
        isPlayBGM: true,
        /**是否能震动 */
        isShock: true,
    }

    /**
     * 保存音频信息
     */
    export function saveLocal() {
        let tag = JSON.stringify(_audioData)
        BaseStorageNS.setItem(ITEM_STORAGE.AUDIO, tag);
    }

    export function init() {
        let a = BaseStorageNS.getItem(ITEM_STORAGE.AUDIO);
        let data = JSON.parse(a);
        for (let i in data) {
            if (_audioData[i] != undefined)
                _audioData[i] = data[i];
        }
    }
    /**是否可以播放音频 */
    export function getIsPlay(){
        return _audioData.isPlay;
    }
    /**设置是否播放音频 */
    export function setIsPlay(v:boolean){
        _audioData.isPlay=v;
        saveLocal();
    }
    /**是否可以播放BGM */
    export function getIsPlayBGM(){
        return _audioData.isPlayBGM;
    }
    /**设置是否播放BGM */
    export function setIsPlayBGM(v:boolean){
        _audioData.isPlayBGM=v;
        saveLocal();
    }
    /**是否可以播放BGM */
    export function getIsShock(){
        return _audioData.isShock;
    }
    /**设置是否播放BGM */
    export function setIsShock(v:boolean){
        _audioData.isShock=v;
        saveLocal();
    }
}