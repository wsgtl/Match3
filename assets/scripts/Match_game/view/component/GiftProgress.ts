import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { GameUtil } from '../../GameUtil_Match';
import { tween } from 'cc';
import { tweenPromise } from '../../../Match_common/utils/TimeUtil';
import { ViewManager } from '../../manager/ViewManger';
const { ccclass, property } = _decorator;

@ccclass('GiftProgress')
export class GiftProgress extends Component {
    @property(Sprite)
    jd: Sprite = null;
    @property([Node])
    gifts: Node[] = [];

    private comboNum: number = 0;
    /**已领取到第几个礼物 */
    public giftClaim: number = 0;
    /**当前可领取到的礼物 */
    public curGift: number = 0;

    onLoad() {
        this.show();
    }
    show() {
        const pro = this.comboNum / GameUtil.CombosProgress;
        this.jd.fillRange = pro;
        this.gifts.forEach((v, i) => {
            const isGift = GameUtil.ComboGifts[i] <= pro;
            if (i == 2) {

            } else {
                v.getChildByName("gs").active = isGift;
            }
            v.getComponent(Sprite).grayscale = !isGift;
            if (isGift && this.curGift < i + 1) {
                this.curGift = i + 1;
            }
        })
    }
    addCombo() {
        this.comboNum++;
        this.show();

    }
    /**有礼物就弹 */
    async calShowGift() {
        await this.showGiftDialog();
        if (this.curGift > this.giftClaim){//连击多次触发多个礼包的情况
            await this.calShowGift();
        }
    }
    private showGiftDialog() {
        return new Promise<void>(res => {
            if (this.curGift > this.giftClaim) {
                this.giftClaim++;
                if (this.giftClaim == 3) {
                    this.renew();
                    ViewManager.showDoorDialog(() => {
                        res();
                    })
                } else {
                    ViewManager.showRewardBoxDialog(() => {
                        res();
                    })
                }

            } else {
                res();
            }
        })
    }
    private renew() {
        this.comboNum = 0;
        this.giftClaim = 0;
        this.curGift = 0;
        this.show();
    }
}


