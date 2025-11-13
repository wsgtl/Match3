import { _decorator, Node } from 'cc';
import ViewComponent from '../../../Match_common/ui/ViewComponent';

import { adHelper } from '../../../Match_common/native/AdHelper';
import Debugger from '../../../Match_common/Debugger';
import { ViewManager } from '../../manager/ViewManger';
import { AudioManager } from '../../manager/AudioManager';
import { tween } from 'cc';
import { Tween } from 'cc';
import { view } from 'cc';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { nextFrame } from '../../../Match_common/utils/TimeUtil';
import { GameManger } from '../../manager/GameManager';
import { GuideManger } from '../../manager/GuideManager';
import { GuideMask } from '../guide/GuideMask';
import { Top } from '../component/Top';
import { JackpotManger } from '../../manager/JackpotManager';
import { Board } from '../component/Board';
import { TaskShow } from '../component/TaskShow';
import { Button } from 'cc';
import { Combo } from '../component/Combo';
import { GiftProgress } from '../component/GiftProgress';
import { GameUtil, PropType, RewardType } from '../../GameUtil_Match';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { sp } from 'cc';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { GameStorage } from '../../GameStorage_Match';
import { MoneyManger } from '../../manager/MoneyManger';
import { ConfigConst } from '../../manager/ConfigConstManager';
import { Layout } from 'cc';
const { ccclass, property } = _decorator;

const debug = Debugger("GameView")
@ccclass('GameView')
export class GameView extends ViewComponent {
    @property(Node)
    content: Node = null;
    @property(Board)
    boardNode: Board = null;
    @property(Node)
    dialogNode: Node = null;
    @property(Top)
    top: Top = null;
    @property(Node)
    bottom: Node = null;
    @property(Node)
    btnShuffle: Node = null;
    @property(Node)
    btnColor: Node = null;
    @property(Node)
    btnBomb: Node = null;
    @property(Node)
    btnMoneys: Node = null;
    @property(Node)
    moneybg: Node = null;
    @property(Node)
    boardLight: Node = null;
    @property(TaskShow)
    ts: TaskShow = null;
    @property(Combo)
    combo: Combo = null;
    @property(GiftProgress)
    gp: GiftProgress = null;
    @property(NumFont)
    passTime: NumFont = null;
    @property(sp.Skeleton)
    king: sp.Skeleton = null;




    onLoad() {

        adHelper.showBanner();

        /**调试模式 */
        // PhysicsSystem2D.instance.debugDrawFlags = 1;

        this.fit();

        ViewManager.setUpDialogNode(this.dialogNode);
        this.btnShuffle.on(Button.EventType.CLICK, this.onShuffle, this);
        this.btnBomb.on(Button.EventType.CLICK, this.onBomb, this);
        this.btnColor.on(Button.EventType.CLICK, this.onColor, this);

        this.showPropNum();
        this.initGuide();
        this.boardNode.usePropCb = this.usePropCb;
    }

    fit() {
        const h = view.getVisibleSize().y;

        const cha = h - 1920;
        const ch = cha / 2;
        const cy = (ch < 60 ? ch : ch - 80);
        this.top.node.y = 960 + cy;
        if (ConfigConst.isShowA) {//A面修改布局
            this.bottom.y = -800 - ch * 0.4;
            this.content.y = -170 - ch * 0.1;
            this.content.getChildByName("boardContent").y = 60;

            const m = this.moneybg.getChildByName("money");
            m.getChildByName("coin").active = true;
            m.getChildByName("money").active = false;
            this.bottom.getComponent(Layout).spacingX = 80;
        } else {
            this.bottom.y = -840 - ch * 0.45;
            this.content.y = -170 - ch * 0.15;
            if (cha < 100)
                this.content.getChildByName("boardContent").y = -20
            else
                this.content.getChildByName("top").y = 800 + ch * 0.2;
        }



        nextFrame().then(() => {
            const p = UIUtils.transformOtherNodePos2localNode(this.node, this.dialogNode);
            this.dialogNode.position = p;
        })
    }

    show(parent: Node, args?: any) {
        parent.addChild(this.node);
        this.init(args.isShowWin);
        // JackpotManger.startLoop(this.node);

    }


    async init(isShowWin: boolean) {
        this.showPassRewad(false);
        this.playBgm(false);
        GameManger.clearInstance();
        GameManger.instance.init(this);
        if (GuideManger.isGuide()) {
            GameManger.instance.initGuideDiBoard();
            GameManger.instance.initGuideBoard();
            this.boardNode.initDi();
            this.boardNode.initBoard();
            this.showTaskDi();
            return;
        }
        const isContinue = this.boardNode.recoverGame();
        this.boardNode.initDi();
        this.boardNode.initBoard();
        this.showTaskDi();
        if (isContinue) {
            ViewManager.showContinueGameDialog(() => {
                this.renewGame();
            }, () => {
                this.afterCombo();
            })
        }
        this.boardNode.autoShowCanMoveClear();
    }
    public renewGame() {
        this.boardNode.newGame();
        this.boardNode.renewDi();
        this.boardNode.renewBoard();
        this.showTaskDi();
        this.afterCombo();
        this.boardNode.autoShowCanMoveClear();
    }
    private set isAni(v: boolean) {
        GameManger.instance.isAni = v;
    }
    private get isAni() {
        return GameManger.instance.isAni;
    }

    public showTaskDi() {
        this.ts.show();

    }
    /**互换 */
    public change(i1: number, i2: number) {
        this.guidStpe1();
    }
    /**打乱道具 */
    private async onShuffle() {
        if (this.isAni || GameManger.instance.isPassReward) return;
        if (this.showPropDialog(PropType.shuffle)) return;
        this.usePropCb(PropType.shuffle);
        this.boardNode.closeUseProp();
        // adHelper.showRewardVideo("打乱道具", async () => {
        this.isAni = true;
        await this.boardNode.shuffle();
        this.isAni = false;
        // }, ViewManager.adNotReady);
    }
    /**颜色道具 */
    private onColor() {
        if (this.isAni || GameManger.instance.isPassReward) return;
        if (GameManger.instance.curUseProp == 2) {//再次点击关闭
            this.boardNode.closeUseProp();
            return;
        }
        if (this.showPropDialog(PropType.color)) return;

        // adHelper.showRewardVideo("颜色道具", async () => {
        GameManger.instance.curUseProp = 2;
        this.boardNode.setUseProp(2);
        // }, ViewManager.adNotReady);
    }
    /**炸弹道具 */
    private onBomb() {
        if (this.isAni || GameManger.instance.isPassReward) return;
        if (GameManger.instance.curUseProp == 1) {//再次点击关闭
            this.boardNode.closeUseProp();
            return;
        }
        if (this.showPropDialog(PropType.bomb)) return;


        // adHelper.showRewardVideo("炸弹道具", async () => {
        GameManger.instance.curUseProp = 1;
        this.boardNode.setUseProp(1);
        // }, ViewManager.adNotReady);
    }
    /**显示道具弹窗 */
    private showPropDialog(type: PropType) {
        const n = GameStorage.getProp();
        if (n[type - 1] > 0) {//有道具就使用
            // GameStorage.addProp(type, -1);
            // this.showPropNum();
            return false;
        }
        ViewManager.showPropDialog(type, () => { this.showPropNum(); })
        return true;
    }
    private usePropCb = (type: PropType) => {
        GameStorage.addProp(type, -1);
        this.showPropNum();
    }
    /**显示道具数量 */
    private showPropNum() {
        const n = GameStorage.getProp();
        const btns = [this.btnBomb, this.btnColor, this.btnShuffle];
        btns.forEach((v, i) => {
            const showAdd = n[i] ? false : true;
            v.getChildByName("add").active = showAdd;
            v.getChildByName("num").active = !showAdd;
            if (!showAdd) {
                v.getChildByName("num").getChildByName("num").getComponent(NumFont).num = n[i];
            }
        })
    }
    /**显示combo */
    public showCombo(n: number) {
        this.combo.show(n);
    }
    /**增加combo进度条 */
    public addComboProgress() {
        this.gp.addCombo();
    }
    /**结束连击后 */
    public async afterCombo() {
        await this.gp.calShowGift();
        await this.guidStpe2();
        if (GameManger.instance.isPass()) {
            //通关展示倒计时
            await this.showCountDownDialog();
            //通关奖励时间
            this.startPassReward();
            // this.playBgm(true);
            // GameManger.instance.passRewardTime = GameUtil.PassRewardTime;
            // GameManger.instance.isPassReward = true;
            // this.boardNode.showPassReward();
            // this.countDownPassTime();
            // ActionEffect.skAni(this.king, "animation2");
        }

    }
    /**所有连击和弹窗都结束后 */
    public afterAllCombo() {
        this.boardNode.autoShowCanMoveClear();
    }
    private showCountDownDialog() {
        return new Promise<void>(res => {
            ViewManager.showCountDownialog(res);
        })
    }
    private async countDownPassTime() {
        const ins = GameManger.instance;
        while (ins.passRewardTime > 0) {
            await this.delay(1);
            ins.passRewardTime--;
            this.passTime.num = ins.passRewardTime;
            if (ins.passRewardTime <= 0 && ins.getCombo() == 0) {
                this.endPassReward();
            }
        }

    }
    /**开始奖励关卡 */
    public startPassReward() {
        this.showPassRewad(true);
        this.playBgm(true);
        GameManger.instance.passRewardTime = GameUtil.PassRewardTime;
        GameManger.instance.isPassReward = true;
        this.boardNode.showPassReward();
        this.countDownPassTime();
        ActionEffect.skAni(this.king, "animation2");
    }
    /**结束奖励关卡 */
    public endPassReward() {
        this.showPassRewad(false);
        ActionEffect.skAni(this.king, "animation1");
        GameManger.instance.isPassReward = false;
        const type = ConfigConst.isShowA ? RewardType.coin : RewardType.money;
        ViewManager.showRewardWin(type, GameManger.instance.passRewardMoney, () => {
            if (!ConfigConst.isShowA && GuideManger.isGuideCash()) {
                this.guidStpe3();
            }
        });
        GameManger.instance.endPassReward();
        this.boardNode.renewDi();
        this.boardNode.hidePassReward();
        this.ts.show();
        this.playBgm(false);
        this.isAni = true;
        this.delay(1).then(() => {
            this.isAni = false;
        })
    }
    private showPassRewad(v: boolean) {
        this.boardLight.active = v;
        this.passTime.node.parent.active = v;
        this.moneybg.active = v;
        this.ts.node.active = !v;
    }
    public showTipBubble(tip: string) {
        this.top.showTipBubble(tip);
    }
    private delay(time: number, node?: Node) {
        return new Promise<void>(resolve => {
            const n = node ? node : this.node;
            tween(n)
                .delay(time)
                .call(() => {
                    resolve();
                })
                .start();
        });
    }

    onDestroy() {
        // Tween.stopAllByTarget(this.node);
        Tween.stopAllByTarget(this.node);
        this.unscheduleAllCallbacks();
        AudioManager.stopBgm();
    }


    playBgm(isFrrGame: boolean) {
        if (isFrrGame)
            AudioManager.playBgm("bgm1", 0.5);
        else
            AudioManager.playBgm("bgm", 0.5);
    }


    private gm: GuideMask;
    /**新手引导 */
    private initGuide() {
        if (!GuideManger.isGuide()) return;
        // this.delay(5).then(()=>{EventTracking.sendEventLevel(1);})//第一关上报

        ViewManager.showGuideMask(async (n: Node) => {
            this.gm = n.getComponent(GuideMask);
            await this.gm.moveTo(this.ts.node, 300, 300);
            this.gm.showTips(1);
            await this.delay(3);
            this.gm.showAll(false, true);

            await this.gm.moveTo(this.boardNode.node, 1020, 1020);
            this.gm.isShowHand = true;
            this.gm.showHand(this.boardNode.getCard(GuideManger.CanClick[0]).node, this.boardNode.getCard(GuideManger.CanClick[1]).node, true);
        })
    }
    private guidStpe1() {
        if (!this.gm || !GuideManger.isGuide()) return;
        this.gm.showAll(false, false);
        this.gm.hideHand();

        // this.gm.node.destroy();
        // this.gm = null;
        // GuideManger.passGameStep();
    }


    private async guidStpe2() {
        if (!this.gm || !GuideManger.isGuide()) return;
        this.gm.node.active = true;
        await this.gm.moveTo(this.ts.node, 300, 300);
        this.gm.showTips(1);
        await this.delay(3);
        this.gm.node.destroy();
        this.gm = null;
        GuideManger.passGameStep();
    }
    private async guidStpe3() {
        ViewManager.showGuideMask(async (n: Node) => {
            this.gm = n.getComponent(GuideMask);
            await this.gm.showMoneyNode(MoneyManger.instance.getMoneyNode(), 500, 120);
        })
    }

    /**到达提现门槛引导 */
    public async guideTipCashOut() {
        ViewManager.showGuideMask(async (n: Node) => {
            this.gm = n.getComponent(GuideMask);
            this.gm.showTips(2);
            await this.gm.showMoneyNode(MoneyManger.instance.getMoneyNode(), 500, 120);
        })
    }




    private onForeground() {
        console.log('应用回到前台');
        // 恢复游戏逻辑
    }
}


