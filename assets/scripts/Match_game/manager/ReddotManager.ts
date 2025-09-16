// import Debugger from "../../Slot_common/Debugger";
// import { isVaild } from "../../Slot_common/utils/ViewUtil";
// import { GameStorage } from "../GameStorage_Slot";
// import { GameUtil } from "../GameUtil_Slot";
// import { Home } from "../view/view/Home";
// import { Node } from 'cc'
// import { ViewManager } from "./ViewManger";

// const debug = Debugger("GameManger");
// /**红点管理 */
// export class ReddotManager {
//     public static _instance: ReddotManager = null;
//     public static get instance(): ReddotManager {
//         if (!this._instance) {
//             this._instance = new ReddotManager();
//         }
//         return this._instance;
//     }
//     private signinDot: Node;
//     private taskDot: Node;
//     public init(signinDot: Node, taskDot: Node) {
//         this.signinDot = signinDot;
//         this.taskDot = taskDot;
//     }
//     /**显示签到红点 */
//     public showSigninDot() {
//         const daily = GameStorage.getDaily();
//         let isShow = false;
//         if (daily.isReceive) {
//             const ld = daily.lastDay;
//             const curDay = GameUtil.getCurDay();
//             if (curDay - ld > 0) {//可领取
//                 isShow = true;
//             }
//         } else {
//             isShow = true;
//         }
//         if (isVaild(this.signinDot)) {
//             this.signinDot.active = isShow;
//         }
//         return isShow;
//     }
//     /**显示任务红点 */
//     public showTaskDot() {
//         const tasks = GameStorage.getTask();
//         const curLevel = GameStorage.getCurLevel();
//         let isShow = false;
//         for (let i = 1; i < curLevel; i++) {
//             if (!tasks[i]) {//有一个任务奖励没领取就显示红点
//                 isShow = true;
//                 break;
//             }
//         }
//         if (isVaild(this.taskDot)) {
//             this.taskDot.active = isShow;
//         }
//     }

// }
