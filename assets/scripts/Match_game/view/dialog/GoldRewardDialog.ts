import { _decorator, Component, Node } from 'cc';
import ViewComponent from '../../../Match_common/ui/ViewComponent';
import { Button } from 'cc';
import { instantiate } from 'cc';
import { Yb } from '../component/Yb';
import { v3 } from 'cc';
import { adHelper } from '../../../Match_common/native/AdHelper';
import { GameUtil, JakcpotType, RewardType } from '../../GameUtil_Match';
import { ViewManager } from '../../manager/ViewManger';
import { delay } from '../../../Match_common/utils/TimeUtil';
import { MoneyManger } from '../../manager/MoneyManger';
import { AudioManager } from '../../manager/AudioManager';
import { ButtonLock } from '../../../Match_common/Decorator';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { LangStorage } from '../../../Match_common/localStorage/LangStorage';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { JackpotManger } from '../../manager/JackpotManager';
import { view } from 'cc';
import { MathUtil } from '../../../Match_common/utils/MathUtil';
const { ccclass, property } = _decorator;

@ccclass('GoldRewardDialog')
export class GoldRewardDialog extends ViewComponent {
    @property([Node])
    jackpots: Node[] = [];
    @property(Node)
    btnAdd: Node = null;
    @property(Node)
    btnClaim: Node = null;
    @property(Node)
    yb: Node = null;
    @property(Node)
    ybs: Node = null;
    @property(Node)
    hand: Node = null;
    @property(Node)
    top: Node = null;
    @property(NumFont)
    moneyNode: NumFont = null;
    @property(NumFont)
    freeTimes: NumFont = null;

    cb: Function;
    private ybArr: Yb[] = [];
    /**固定奖池出现 */
    private randomJackpot: JakcpotType[] = [1, 1, 2, 2, 3, 3, 3];
    // private randomJackpot: JakcpotType[] = [1, 1, 1,2,3];
    /**奖池出现数 */
    private jackpotShowNum: number[] = [0, 0, 0, 0];
    private isInit: boolean = true;
    private curMoney: number = 0;
    /**免费次数 */
    private canClickNum: number = 8;
    show(parent: Node, args?: any): void {
        super.show(parent);
        this.cb = args.cb;


        this.init();
    }

    init() {
        this.initJackpot();
        this.showJackpotShowNum();
        // this.showBtn(false);
        this.btnAdd.on(Button.EventType.CLICK, this.onBtnAdd, this);
        this.btnClaim.on(Button.EventType.CLICK, this.onBtnCliam, this);
        const w = 250;
        const h = 200;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                const yb = instantiate(this.yb);
                this.ybs.addChild(yb);
                const ybcom = yb.getComponent(Yb)
                this.ybArr[i * 4 + j] = ybcom;
                yb.position = v3((j - 1.5) * w, -(i - 1) * h);
                ybcom.hide();
                yb.on(Node.EventType.TOUCH_START, () => {
                    if (ybcom.isClick) return;
                    if (ybcom.isAd) {
                        this.onBtnAdd();
                    } else {
                        this.clickYb(ybcom);
                    }
                })
            }
        }
        this.yb.active = false;
        this.showFreeTimes();
        this.showMoney(this.curMoney);

        const cha = (view.getVisibleSize().y-1920)/2;
        this.top.y=820+cha*0.7;
    }
    private initJackpot() {
        
        for (let i = this.randomJackpot.length; i < 12; i++) {
            this.randomJackpot[i] = 0;
        }
        this.randomJackpot.shuffle();
        if (MathUtil.probability(GameUtil.MajorPro)) this.randomJackpot[0] = 2;
        if (MathUtil.probability(GameUtil.GrandPro)) this.randomJackpot[0] = 1;//有概率出大奖池
    }

    showBtn(v: boolean) {
        // this.btnAdd.active = v;
        this.btnClaim.active = v;
    }
    onBtnAdd() {
        adHelper.showRewardVideo("宝箱弹窗多开两个按钮", () => {
            this.canClickNum += Math.min(2,this.randomJackpot.length);
            this.showAllAd(false);
            this.showFreeTimes();
        }, ViewManager.adNotReady);
    }
    onBtnCliam() {
        this.node.destroy();
        this.cb();
    }
    public showAllAd(isAd: boolean) {
        this.ybArr.forEach(v => {
            if (v.isClick) return;
            v.showAd(isAd);
        })
    }
    @ButtonLock(0.5)
    clickYb(ybcom: Yb) {
        this.hand.active = false;
        AudioManager.vibrate(50, 155);
        AudioManager.playEffect("yb");
        // if (!this.isInit) {
        this.canClickNum--;
        if (this.canClickNum <= 0) {
            this.showAllAd(true);//显示要点击广告
        }
        // }
        this.showFreeTimes();
        let type: JakcpotType = JakcpotType.mini;
        if (this.randomJackpot.length) {
            type = this.randomJackpot.pop();
        } else {
            const m = Math.random()
            type = m < GameUtil.GrandPro ? JakcpotType.grand : (m < GameUtil.MajorPro ? JakcpotType.major : (m < 0.6 ? 0 : JakcpotType.mini));//有概率出中奖池和大奖池
        }
        if (type == 0) {
            const money = MoneyManger.instance.getReward(0.5);
            ybcom.show(type, money);
            MoneyManger.instance.addMoney(money, true);
            ViewManager.showRewardParticle(RewardType.money, ybcom.node, this.moneyNode.node, () => {
                const last = this.curMoney;
                this.curMoney += money;
                ActionEffect.numAddAni(last, this.curMoney, (n: number) => { this.showMoney(n) });
            }, 0.5)
        } else {
            ybcom.show(type);
            this.jackpotShowNum[type]++;
            // this.showJackpotShowNum();
            this.flyAni(ybcom.node, type);
        }


        if (this.jackpotShowNum[type] >= 3) {
            if (this.isInit) {
                // this.showAllAd(true);//显示要点击广告
                this.isInit = false;
                this.showBtn(true);
            }
            this.jackpotShowNum[type] = 0;
            delay(0.5).then(() => {
                this.showJackpotShowNum();
            });
            // ViewManager.showJackpotDialog(type, MoneyManger.instance.getReward(), () => { });
            ViewManager.showJackpotDialog(type, JackpotManger.getData()[type-1], () => { });
        }
    }
    private showJackpotShowNum() {
        this.jackpots.forEach((v, i) => {
            const num = this.jackpotShowNum[i + 1];
            const dots = v.getChildByName("dots");
            for (let j = 0; j < 3; j++) {
                const d = dots.children[j].getChildByName("dot");
                d.active = j < num;
            }
        })
    }
    /**动画 */
    private flyAni(from: Node, type: JakcpotType) {
        const num = this.jackpotShowNum[type];
        const p = this.jackpots[type - 1];
        const dot = p.getChildByName("dots").getChildByName("d" + num);
        ViewManager.showRewardParticle(RewardType.none, from, dot, () => { this.showJackpotShowNum(); }, 0.3);
    }
    private showFreeTimes() {
        this.freeTimes.num = this.canClickNum;
    }
    private showMoney(num: number) {
        const n = FormatUtil.toXXDXX(num, 2, false,2);
        const str = LangStorage.getData().symbol + " " + n;
        this.moneyNode.num = str;
    }
}


