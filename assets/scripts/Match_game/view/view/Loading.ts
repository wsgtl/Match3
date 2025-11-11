import { _decorator, Component, Node } from 'cc';
import ViewComponent from '../../../Match_common/ui/ViewComponent';
import { ViewManager } from '../../manager/ViewManger';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { Progress } from '../component/Progress';
import { adHelper } from '../../../Match_common/native/AdHelper';
import { Label } from 'cc';
import { delay, nextFrame } from '../../../Match_common/utils/TimeUtil';
import { GuideManger } from '../../manager/GuideManager';
import { sys } from 'cc';
import { game } from 'cc';
import { Game } from 'cc';
import { MathUtil } from '../../../Match_common/utils/MathUtil';
import { EventTracking } from '../../../Match_common/native/EventTracking';
import { WebManger } from '../../manager/WebManager';
import { Jsb } from '../../../Match_common/platform/Jsb';
const { ccclass, property } = _decorator;

@ccclass('Loading')
export class Loading extends ViewComponent {
    @property(Progress)
    progress: Progress = null;
    @property(NumFont)
    num: NumFont = null;
    @property(Label)
    loading: Label = null;
    @property(Node)
    qq: Node = null;

    async showProgress() {
        const pro = WebManger.getData();
        EventTracking.sendOneEvent("loading");
        const all = !Jsb.browser() ? 100 : 10;
        for (let i = 0; i <= all; i++) {
            this.progress.progress = i / all;
            const num = Math.floor(i / all * 100);
            if (this.qq) this.qq.angle -= 10;
            if (this.num) this.num.num = num + "%";
            if (this.loading) this.loading.string = "Loading... " + num + "%";
            if (i == all - 1) {
                await pro;
            }
            if (i == all) {
                this.scheduleOnce(() => {
                    if (GuideManger.isGuide())
                        ViewManager.showGuideHome();
                    else
                        ViewManager.showGameView();
                }, 0.2);
            }
            await delay(0.03);
        }
    }
    show(parent: Node, args?: any) {
        parent.addChild(this.node);
        this.showProgress();
        adHelper.init();
        game.on(Game.EVENT_SHOW, () => {
            if (MathUtil.probability(0.9)) return;
            adHelper.showInterstitial("回前台显示插屏广告");
            console.log("回前台显示插屏广告");
        })
    }
}


