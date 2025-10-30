import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { GameUtil } from '../../GameUtil_Match';
import { tween } from 'cc';
import { tweenPromise } from '../../../Match_common/utils/TimeUtil';
import { ViewManager } from '../../manager/ViewManger';
import { BaseStorageNS, ITEM_STORAGE } from '../../../Match_common/localStorage/BaseStorage';
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
        this.recover();
        this.showJd();
        this.showGift();
    }
    showGift() {
        this.gifts.forEach((v, i) => {
            if (i == 2) {

            } else {
                v.getChildByName("gs").active = this.curGift > i && this.giftClaim <= i;
            }
            v.getComponent(Sprite).grayscale = this.giftClaim > i;

        })
    }
    private showJd() {
        const pro = this.comboNum / GameUtil.CombosProgress;
        this.jd.fillRange = pro;
        GameUtil.ComboGifts.forEach((v, i) => {
            const isGift = GameUtil.ComboGifts[i] <= pro;
            if (isGift && this.curGift < i + 1) {
                this.curGift = i + 1;
            }
        })
    }
    addCombo() {
        this.comboNum++;
        this.showJd();
        this.showGift();
        this.saveData();
    }

    /**有礼物就弹 */
    async calShowGift() {
        await this.showGiftDialog();
        if (this.curGift > this.giftClaim) {//连击多次触发多个礼包的情况
            await this.calShowGift();
        }
    }
    private showGiftDialog() {
        return new Promise<void>(res => {
            if (this.curGift > this.giftClaim) {
                this.giftClaim++;
                this.saveData();
                this.showGift();
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
        this.saveData();
        this.showJd();
        this.showGift();
    }

    private key = ITEM_STORAGE.GameGift;
    /**
     * 保存游戏信息
     */
    public saveData() {
        let tag = JSON.stringify({ comboNum: this.comboNum, giftClaim: this.giftClaim });
        BaseStorageNS.setItem(this.key, tag);
    }
    public recover() {
        const d = BaseStorageNS.getItem(this.key);
        if (!d) return;
        const data = JSON.parse(d);
        this.comboNum = data.comboNum;
        this.giftClaim = data.giftClaim;
    }
}


