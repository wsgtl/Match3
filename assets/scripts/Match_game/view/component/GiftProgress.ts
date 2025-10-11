import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { GameUtil } from '../../GameUtil_Match';
import { tween } from 'cc';
import { tweenPromise } from '../../../Match_common/utils/TimeUtil';
const { ccclass, property } = _decorator;

@ccclass('GiftProgress')
export class GiftProgress extends Component {
    @property(Sprite)
    jd: Sprite = null;
    @property([Node])
    gifts: Node[] = [];

    private comboNum: number = 0;

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

        })
    }
    addCombo() {
        this.comboNum++;
        this.show();

    }
}


