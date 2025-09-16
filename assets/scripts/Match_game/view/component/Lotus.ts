import { Sprite, tween } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { delay } from '../../../Match_common/utils/TimeUtil';
import { GameStorage } from '../../GameStorage_Match';
import { GameUtil } from '../../GameUtil_Match';
import { ViewManager } from '../../manager/ViewManger';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { sp } from 'cc';
import { AudioManager } from '../../manager/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('Lotus')
export class Lotus extends Component {
    @property(Sprite)
    progress: Sprite = null;
    @property(Node)
    icon: Node = null;
    @property(sp.Skeleton)
    sk: sp.Skeleton = null;
    @property(NumFont)
    num: NumFont = null;


    protected onLoad(): void {
        this.showProgress(false);
        // this.node.on(Node.EventType.TOUCH_START, () => {
        //     ViewManager.showGoldRewardChange(() => {
                
        //     })
        // })
        ActionEffect.skAniOnce(this.sk,"",true);
        this.sk.timeScale=10000;
        this.sk.setToSetupPose();
        delay(0.1).then(()=>{this.sk.timeScale=1;})
    }
    /**增加金莲进度 */
    addProgress(num: number) {
        return new Promise<void>(res => {
            const t = GameStorage.getLotus();
            let cur = t + num;
            if (cur >= GameUtil.LotusNum) {
                this.showProgress(true, true, GameUtil.LotusNum);
                GameStorage.setLotus(0);
                delay(0.2).then(() => {
                    ViewManager.showGoldRewardChange(() => {
                        res();
                    })
                })

            } else {
                GameStorage.setLotus(cur);
                this.showProgress(true);
                res();
            }
            ActionEffect.scaleBigToSmall(this.icon, 1.2, 1, 0.2);
            ActionEffect.skAniOnce(this.sk,"jingdutiao",true);
            AudioManager.vibrate(100, 155);
        })

    }
    private showProgress(isAni: boolean, isAll: boolean = false, cur: number = -1) {
        if (cur < 0)
            cur = GameStorage.getLotus();
        const jd = cur / GameUtil.LotusNum;

        if (isAni) {
            const duration = 0.2;
            const all = cur - this.lastNum;
            const start = this.lastNum;
            const t = duration / all;
            for (let i = 1; i <= all; i++) {
                delay(t * i).then(() => {
                    this.showNum(i + start );
                })
            }
            tween(this.progress)
                .to(duration, { fillRange: jd })
                .call(async () => {
                    if (isAll) {
                        await delay(0.2);
                        this.progress.fillRange = 0;
                        this.showNum(0);
                    }

                })
                .start();
        } else {
            this.showNum(cur);
            this.progress.fillRange = jd;
        }

    }
    private lastNum: number = 0;
    private showNum(n: number) {
        this.lastNum = n;
        this.num.num = n + "l" + GameUtil.LotusNum;
    }
}


