import { prefabs } from "../../Match_common/recycle/AssetUtils";
import ViewComponent from "../../Match_common/ui/ViewComponent";
import { isVaild } from '../../Match_common/utils/ViewUtil';
import { Node } from 'cc';
import { GameOverData, JakcpotType, LimitType, RewardType } from "../GameUtil_Match";
import { ActionEffect } from "../../Match_common/effects/ActionEffect";
import { delay } from "../../Match_common/utils/TimeUtil";
import { i18n } from "../../Match_common/i18n/I18nManager";


export enum ViewType {
    loading = 0,
    home,
    gameview,
}
export namespace ViewManager {
    /**主要页面显示层级 */
    let mainSceneNode: Node = null;
    let upperNode: Node = null;
    let lowerNode: Node = null;
    let toperNode: Node = null;//最高层级

    let curViewType: ViewType;
    let curView: Node = null;
    export function getCurViewType() {
        return curViewType;
    }
    export function setMainSceneNode(n: Node, upper: Node, lower: Node,toper:Node) {
        mainSceneNode = n;
        upperNode = upper;
        lowerNode = lower;
        toperNode = toper;
    }
    let dialogNode: Node = null;
    let updialogNode: Node = null;
    /**设置弹窗父节点 */
    export function setDialogNode(n: Node) {
        dialogNode = n;
    }
    /**设置上层弹窗父节点 */
    export function setUpDialogNode(n: Node) {
        updialogNode = n;
    }

    /** 加载界面 */
    export function showLoading() {
        prefabs.instantiate("prefabs/loading").then((view) => {
            if (isVaild(view)) {
                const script = view.getComponent(ViewComponent);
                script.show(mainSceneNode);
                if (curView) {
                    curView.destroy();
                    curViewType = ViewType.loading;
                }
                curView = view;
            }
        });
    }
    /** 大厅主界面 */
    export function showHome() {
        prefabs.instantiate("prefabs/home").then((view) => {
            if (isVaild(view)) {
                const script = view.getComponent(ViewComponent);
                script.show(mainSceneNode);
                if (curView) {
                    curView.destroy();
                    curViewType = ViewType.home;
                }
                curView = view;
            }
        });
    }
    /** 新手引导大厅主界面 */
    export function showGuideHome() {
        prefabs.instantiate("prefabs/guide/guideHome").then((view) => {
            if (isVaild(view)) {
                const script = view.getComponent(ViewComponent);
                script.show(mainSceneNode);
                if (curView) {
                    curView.destroy();
                    curViewType = ViewType.home;
                }
                curView = view;
            }
        });
    }
    /** 游戏界面 */
    export function showGameView(isShowWin: boolean = false) {
        prefabs.instantiate("prefabs/gameView").then((view) => {
            if (isVaild(view)) {
                const args = { isShowWin }
                const script = view.getComponent(ViewComponent);
                script.show(mainSceneNode, args);
                if (curView) {
                    curView.destroy();
                    curViewType = ViewType.gameview;
                }
                curView = view;
            }
        });
    }

    /** 结束界面 */
    export function showGameOver(parent: Node, data: GameOverData, tryagainCb: CallableFunction, reviveCb: CallableFunction, continueCb: CallableFunction) {
        prefabs.instantiate("prefabs/dialog/gameOver").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(parent, { data, tryagainCb, reviveCb, continueCb });
            }
        })
    }


    /** 询问弹窗 */
    export function showAskTips(parent: Node, confirmCb: CallableFunction, cancelCb?: CallableFunction) {
        prefabs.instantiate("prefabs/askTips").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(parent, { confirmCb, cancelCb });
            }
        });
    }

    let curTips: Node = null;
    /**提示条 */
    export async function showTips(tips: string, duration: number = 2.5) {
        if (!curTips) {
            curTips = await prefabs.instantiate("prefabs/tips");
        }
        if (isVaild(curTips)) {
            const script = curTips.getComponent(ViewComponent);
            script.show(upperNode, { tips, duration });
        }
    }


    /**清除弹窗 */
    export async function clearDialog(isAni: boolean = false, duration: number = 0.3) {
        if (dialogNode) {
            if (isAni) {
                dialogNode.children.forEach(async v => {
                    await ActionEffect.fadeOut(v, duration);
                    v.destroy();
                })
                if (dialogNode.children.length > 0)
                    await delay(duration);
            } else {
                dialogNode.destroyAllChildren();
            }

        }
    }



    /** 钱包提现界面 */
    export function showPurse() {
        prefabs.instantiate("prefabs/dialog/purse").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(updialogNode ?? mainSceneNode);
            }
        })
    }
    /** 获取金币界面 */
    export function showCoinDialog(cb:Function) {
        prefabs.instantiate("prefabs/dialog/coinDialog").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(updialogNode ?? mainSceneNode,{cb});
            }
        })
    }
    /** 设置界面 */
    export function showSettings() {
        prefabs.instantiate("prefabs/dialog/settings").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(upperNode ?? mainSceneNode);
            }
        })
    }
    /** 规则界面 */
    export function showRuleDialog() {
        prefabs.instantiate("prefabs/dialog/rule").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(upperNode);
            }
        })
    }
    /** 奖池界面 */
    export function showJackpotDialog(type:JakcpotType,num:number,cb:Function) {
        prefabs.instantiate("prefabs/dialog/jackpotDialog").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(upperNode,{type,num,cb});
            }
        })
    }
    /** 语言设置界面 */
    export function showLangSettings(cb:Function) {
        prefabs.instantiate("prefabs/dialog/langSettings").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(updialogNode ?? mainSceneNode,{cb});
            }
        })
    }
    /** 奖励界面 */
    export function showReward( cb: Function) {
        prefabs.instantiate("prefabs/dialog/reward").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(upperNode, { cb });
            }
        })
    }
    /** 奖励弹出界面 */
    export function showRewardPop( type:RewardType,rewardNum:number) {
        prefabs.instantiate("prefabs/dialog/rewardPop").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(upperNode, { type, rewardNum});
            }
        })
    }
    /** 金币奖励界面 */
    export function showRewardCoin(num: number, cb: Function) {
        prefabs.instantiate("prefabs/dialog/rewardCoin").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(upperNode, { num, cb });
            }
        })
    }

    /** 奖励动画界面 */
    export function showRewardAni(type: RewardType, num: number, cb: Function) {
        prefabs.instantiate("prefabs/dialog/rewardAni").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(upperNode, { type, num, cb });
            }
        })
    }
    /** 奖励粒子动画界面 */
    export function showRewardParticle(type: RewardType,from:Node,to:Node, cb: Function,duration:number=0.7,dubble:boolean=false) {
        prefabs.instantiate("prefabs/dialog/rewardParticle").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(upperNode, { type,from,to, cb,duration,dubble });
            }
        })
    }

    /** 幸运奖励界面 */
    export function showLuckyDialog(cb:Function) {
        prefabs.instantiate("prefabs/dialog/luckyDialog").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(upperNode, { cb});
            }
        })
    }
    /** 彩金界面 */
    export function showGoldRewardDialog(cb:Function) {
        prefabs.instantiate("prefabs/dialog/goldRewardDialog").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(upperNode, { cb});
            }
        })
    }
    /** 彩金转场界面 */
    export function showGoldRewardChange(cb:Function) {
        prefabs.instantiate("prefabs/dialog/goldRewardChange").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(toperNode, { cb});
            }
        })
    }
    /** 提现界面 */
    export function showWithdrawDialog(isCoin:boolean = false) {
        prefabs.instantiate("prefabs/dialog/withdrawDialog").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(upperNode, { isCoin});
            }
        })
    }
    /** 猪礼物界面 */
    export function showLuckyGiftDialog(cb:Function) {
        prefabs.instantiate("prefabs/dialog/giftDialog").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(upperNode, { cb});
            }
        })
    }
    /** slot界面 */
    export function showSlotDialog(cb:Function) {
        prefabs.instantiate("prefabs/dialog/slotDialog").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(upperNode, { cb});
            }
        })
    }
    /** slot再来一次界面 */
    export function showSlotMoreDialog(cb:Function) {
        prefabs.instantiate("prefabs/dialog/slotMoreDialog").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(upperNode, { cb});
            }
        })
    }

    /** 提现卡设置界面 */
    export function showWithdrawalMethodDialog(cb:Function,closeCb:Function) {
        prefabs.instantiate("prefabs/dialog/withdrawMethodDialog").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(upperNode, { cb,closeCb});
            }
        })
    }  

    /**广告没准备好 */
    export const adNotReady = () => {
        // ViewManager.showTips("The ad is not ready yet,please try again later");
        ViewManager.showTips(i18n.string("str_thead"));
    }

    /** 新手引导遮罩界面 */
    export function showGuideMask(cb: (n: Node) => void) {
        prefabs.instantiate("prefabs/guide/guideMask").then((dialog) => {
            if (isVaild(dialog)) {
                const script = dialog.getComponent(ViewComponent);
                script.show(upperNode, {});
                cb(dialog);
            }
        })
    }

}