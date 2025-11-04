import { GameStorage } from "../GameStorage_Match";
import { ViewManager } from "./ViewManger";

export namespace GuideManger {
    /**新手引导可点击的两个 */
    export const CanClick: number[] = [20, 21];
    /**新手引导牌面 */
    export const GuideBoard: number[] = [
        1, 3, 2, 6, 5, 3,
        1, 2, 5, 3, 4, 5,
        2, 3, 1, 2, 1, 4,
        1, 1, 2, 1, 2, 2,
        5, 2, 1, 2, 4, 6,
        6, 2, 1, 2, 3, 5,
    ];
    /**新手引导底血量 */
    export const GuideDiBoard: number[] = [
        0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
        0, 0, 1, 1, 0, 0,
        1, 1, 1, 1, 1, 1,
        0, 0, 1, 1, 0, 0,
        0, 0, 1, 1, 0, 0,
    ];

    /**通过提现引导页引导 */
    export function passCashStep() {
        GameStorage.setGuideStep(1);
    }
    /**通过游戏页引导 */
    export function passGameStep() {
        GameStorage.setGuideStep(2);
    }
    /**通过提现引导 */
    export function passCashOutStep() {
        GameStorage.setGuideStep(3);
    }
    /**是否是新手引导 */
    export function isGuide() {
        // return true;
        const step = GameStorage.getGuideStep();
        return step < 2;
    }
    /**是否是提现新手引导 */
    export function isGuideCash() {
        const step = GameStorage.getGuideStep();
        return step ==2;
    }
}