import { _decorator, Node, SpriteFrame, Sprite } from 'cc';
import ViewComponent from '../../../Match_common/ui/ViewComponent';

import { adHelper } from '../../../Match_common/native/AdHelper';
import Debugger from '../../../Match_common/Debugger';
import { GameStorage } from '../../GameStorage_Match';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { ViewManager } from '../../manager/ViewManger';
import { AudioManager } from '../../manager/AudioManager';
import { tween } from 'cc';
import { Tween } from 'cc';
import { view } from 'cc';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { CardType, GameUtil, RewardType, WinType } from '../../GameUtil_Match';
import { nextFrame } from '../../../Match_common/utils/TimeUtil';
import { GameManger } from '../../manager/GameManager';
import { GuideManger } from '../../manager/GuideManager';
import { GuideMask } from '../guide/GuideMask';
import { Treasure } from '../component/Treasure';
import { Button } from 'cc';
import { Top } from '../component/Top';
import { ButtonLock } from '../../../Match_common/Decorator';
import { Board } from '../component/Board';
import { CoinManger } from '../../manager/CoinManger';
import { MoneyManger } from '../../manager/MoneyManger';
import { v3 } from 'cc';
import { NativeFun } from '../../../Match_common/native/NativeFun';
import { BtnSpin } from '../component/BtnSpin';
import { Layout } from 'cc';
import { Vec2 } from 'cc';
import { WinNum } from '../component/WinNum';
import { JackpotManger } from '../../manager/JackpotManager';
import { BtnGift } from '../component/BtnGift';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { sp } from 'cc';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { FountainAni } from '../aniComponent/FountainAni';
import { MathUtil } from '../../../Match_common/utils/MathUtil';
import { EventTracking } from '../../../Match_common/native/EventTracking';
const { ccclass, property } = _decorator;

const debug = Debugger("GameView")
@ccclass('GameView')
export class GameView extends ViewComponent {
    @property(Node)
    content: Node = null;
    @property(Node)
    dialogNode: Node = null;
    @property(Top)
    top: Top = null;
   


    onLoad() {

        adHelper.showBanner();

        /**调试模式 */
        // PhysicsSystem2D.instance.debugDrawFlags = 1;

        this.fit();

        ViewManager.setUpDialogNode(this.dialogNode);

  

        // this.initGuide();
    }

    fit() {
        const h = view.getVisibleSize().y;

        const cha = h - 1920;
        const ch = cha / 2;
        const cy = (ch < 60 ? ch : ch - 80);
        this.top.node.y = 960 + cy;

        nextFrame().then(() => {
            const p = UIUtils.transformOtherNodePos2localNode(this.node, this.dialogNode);
            this.dialogNode.position = p;
        })
    }

    show(parent: Node, args?: any) {
        parent.addChild(this.node);
        this.init(args.isShowWin);
        JackpotManger.startLoop(this.node);

    }


    async init(isShowWin: boolean) {
        this.playBgm(false);
        GameManger.clearInstance();
        GameManger.instance.init(this);
        if (!GuideManger.isGuide()) {

        }

    }
    private set isAni(v: boolean) {
        GameManger.instance.isAni = v;
    }
    private get isAni() {
        return GameManger.instance.isAni;
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


    playBgm(isFrrGame:boolean) {
        if(isFrrGame)
            AudioManager.playBgm("bgm2", 0.7);
        else 
            AudioManager.playBgm("bgm1", 0.3);
    }


    private gm: GuideMask;
    /**新手引导 */
    // private initGuide() {
    //     if (!GuideManger.isGuide()) return;
    //     this.delay(5).then(()=>{EventTracking.sendEventLevel(1);})//第一关上报
        
    //     ViewManager.showGuideMask(async (n: Node) => {
    //         this.gm = n.getComponent(GuideMask);
    //         this.gm.showMask();
    //         this.gm.showTips(1);
    //         await this.delay(3);
    //         this.gm.hideDb();
    //         this.guidStpe1();
    //     })
    // }
    // private guidStpe1() {
    //     this.gm.showSpin(this.btnSpin.node);
    // }


    // private async guidStpe2() {
    //     if (!this.gm || !GuideManger.isGuide()) return;
    //     this.gm.node.active = true;
    //     this.gm.showMask();
    //     this.gm.showTips(2);
    //     await this.delay(3);
    //     this.gm.hideDb();
    //     this.gm.node.active = true;
    //     this.gm.showMoneyNode(MoneyManger.instance.getMoneyNode().node);
    // }





    private onForeground() {
        console.log('应用回到前台');
        // 恢复游戏逻辑
    }
}


