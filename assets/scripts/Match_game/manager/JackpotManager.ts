import { BaseStorageNS, ITEM_STORAGE } from "../../Match_common/localStorage/BaseStorage";
import { NumFont } from "../../Match_common/ui/NumFont";
import { FormatUtil } from "../../Match_common/utils/FormatUtil";
import { delay } from "../../Match_common/utils/TimeUtil";
import { Node } from "cc";
import { isVaild } from "../../Match_common/utils/ViewUtil";

export namespace JackpotManger {
    const grandBase = 100000000;//大奖池基础值
    const majorBase = 3000000;//中奖池基础值
    const miniBase = 150000;//小奖池基础值

    let isStart: boolean = false;
    const registers: NumFont[] = [];
    /**音频信息 */
    const _jackpotData = {
        grand: grandBase,
        major: majorBase,
        mini: miniBase,
    }

    /**
     * 保存奖池信息
     */
    export function saveLocal() {
        let tag = JSON.stringify(_jackpotData)
        BaseStorageNS.setItem(ITEM_STORAGE.JACKPOT, tag);
    }

    export function init() {
        let a = BaseStorageNS.getItem(ITEM_STORAGE.JACKPOT);
        let data = JSON.parse(a);
        for (let i in data) {
            if (_jackpotData[i] != undefined)
                _jackpotData[i] = data[i];
        }
    }
    export function getData() {
        return [_jackpotData.grand, _jackpotData.major, _jackpotData.mini];
    }
    export function startLoop(node: Node) {
        if (isStart) return;
        isStart = true;

        loop(node);
    }
    async function loop(node: Node) {
        _jackpotData.grand += 1;
        registers.forEach(v => {
            if (isVaild(v))
                v.num = FormatUtil.toXXDXX(_jackpotData.grand);
        })
        saveLocal();
        await delay(0.3, node);
        loop(node);
    }


    export function register(grandNode: NumFont) {
        registers.push(grandNode);
    }
    export function cancel(grandNode: NumFont) {
        for (let i = 0; i < registers.length; i++) {
            if (registers[i] == grandNode) {
                registers.splice(i, 1);
                return;
            }
        }
    }
}