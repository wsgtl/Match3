import { GameStorage } from "../GameStorage_Match";
import { ViewManager } from "./ViewManger";

export namespace GuideManger {
    /**通过游戏页引导 */
    export function passGameStep() {
        GameStorage.setGuideStep(1);
    }
    /**是否是新手引导 */
    export function isGuide() {
        // return true;
        const step = GameStorage.getGuideStep();
        return step < 1;
    }
}