import { GameStorage } from "../GameStorage_Match";
import { ViewManager } from "./ViewManger";

export namespace GuideManger {
    /**判断是否显示新手引导主页 */
    export function showHome() {
        const step = GameStorage.getGuideStep();
        if (step > 0) {
            ViewManager.showHome();
        } else {
            ViewManager.showGuideHome();
        }
    }
    /**通过首页引导 */
    export function passHomeStep() {
        GameStorage.setGuideStep(1);
    }
    /**通过游戏页引导 */
    export function passGameStep() {
        GameStorage.setGuideStep(1);
    }
    /**是否是新手引导 */
    export function isGuide() {
        const step = GameStorage.getGuideStep();
        return step < 1;
    }
}