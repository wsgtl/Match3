import { _decorator, Component, Node } from 'cc';
import { TipsAni } from './TipsAni';
import { Button } from 'cc';
import { ViewManager } from '../../manager/ViewManger';
import { view } from 'cc';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { v3 } from 'cc';
import { GuideManger } from '../../manager/GuideManager';
import ViewComponent from '../../../Match_common/ui/ViewComponent';
import { EventTracking } from '../../../Match_common/native/EventTracking';
const { ccclass, property } = _decorator;

@ccclass('GuideHome')
export class GuideHome extends ViewComponent {
    @property(Node)
    bg:Node = null;
    @property(Node)
    btnStart:Node = null;
    @property(TipsAni)
    tips:TipsAni = null;

    private isAni:boolean = false;
    protected start(): void {
        EventTracking.sendOneEvent("guideHome");
        const y = view.getVisibleSize().y;
        this.bg.scale=v3(1,y/UIUtils.getHeight(this.bg));
        this.tips.init();
        this.tips.startAni(3);
        this.btnStart.on(Button.EventType.CLICK,()=>{
            if(this.isAni)return;
            EventTracking.sendOneEvent("guideHomeClick");
            this.isAni = true;
            ViewManager.showGameView();
            GuideManger.passCashStep();
        })
    }

}


