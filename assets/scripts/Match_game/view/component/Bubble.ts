import { tween } from 'cc';
import { v3 } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { ViewManager } from '../../manager/ViewManger';
import { MoneyManger } from '../../manager/MoneyManger';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { AudioManager } from '../../manager/AudioManager';
import { Tween } from 'cc';
import { LangStorage } from '../../../Match_common/localStorage/LangStorage';
import { adHelper } from '../../../Match_common/native/AdHelper';
import { RewardType } from '../../GameUtil_Match';
const { ccclass, property } = _decorator;

@ccclass('Bubble')
export class Bubble extends Component {
    @property(NumFont)
    num: NumFont = null;
    @property(Node)
    content: Node = null;
    private readonly duration = 30;
    private moneyNum = 0;
    onLoad() {
        this.init(false);
        this.content.on(Node.EventType.TOUCH_START, this.onClick, this);
    }
    private freeNum = 1;
    private time = 0;
    private canMove: boolean = true;
    update(deltaTime: number) {
        if (!this.canMove) return;
        this.time -= deltaTime;
        if (this.time <= 0) {
            this.time = this.duration;//半分钟出气泡
            this.node.active = true;
            this.node.position = v3(700, 0);
            tween(this.node)
                .to(7, { position: v3(-450, 1200) })
                .to(7, { position: v3(700, 2400) })
                .call(() => {
                    this.init(false);

                })
                .start();
        }
    }
    private isAni: boolean = false;
    onClick() {
        if (this.isAni) return;
        this.isAni = true;
        AudioManager.playEffect("click");
        this.canMove = false;
        // let isFree = false;
        // if (this.freeNum > 0) { this.freeNum = 0; isFree = true; }
        // ViewManager.showLuckyWheelDialog(isFree, num, () => {
        //     this.canMove = true;
        // });
        // this.node.y = 0;
        Tween.stopAllByTarget(this.node);
        ActionEffect.scale(this.content, 0.2,0, 1);
        adHelper.showRewardVideo("气泡点击", () => {
            ViewManager.showRewardParticle(RewardType.money, this.node, MoneyManger.instance.getMoneyNode().moneyNode, () => {
                MoneyManger.instance.addMoney(this.moneyNum, false);
                this.init();
            })
        }, () => {
            ViewManager.adNotReady();
            this.init();
        })
    }
    private init(isWait:boolean=true){
        this.isAni = false;
        this.canMove = true;
        this.node.y = -100;
        this.content.scale = v3(1,1,1);
        const num = MoneyManger.instance.getReward(0.3);
        this.moneyNum = num;
        this.num.num = LangStorage.getData().symbol + FormatUtil.toXXDXXxsd(num);
        isWait&&(this.time = this.duration);//半分钟出气泡
        
    }
}


