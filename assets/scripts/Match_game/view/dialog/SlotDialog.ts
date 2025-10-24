import { _decorator, Component, Node } from 'cc';
import ViewComponent from '../../../Match_common/ui/ViewComponent';
import { SpriteFrame } from 'cc';
import { instantiate } from 'cc';
import { Vec3 } from 'cc';
import { v3 } from 'cc';
import { delay, tweenPromise } from '../../../Match_common/utils/TimeUtil';
import { MathUtil } from '../../../Match_common/utils/MathUtil';
import { tween } from 'cc';
import { ViewManager } from '../../manager/ViewManger';
import { RewardType } from '../../GameUtil_Match';
import { CoinManger } from '../../manager/CoinManger';
import { Sprite } from 'cc';
import { AudioManager } from '../../manager/AudioManager';
import { Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SlotDialog')
export class SlotDialog extends ViewComponent {
    @property(Node)
    title: Node = null;
    @property(Node)
    boardNode: Node = null;
    @property(Node)
    boardContent: Node = null;
    @property(Node)
    item: Node = null;
    @property([Node])
    bns: Node[] = [];
    @property([SpriteFrame])
    sf: SpriteFrame[] = [];

    private boards: Node[] = [];
    private isFirst: boolean = true;
    private basePos: Vec2;
    private cb:Function;
    protected onLoad(): void {
        this.basePos = this.boardContent.pos2.clone();
    }
    showStart(args?: any): void {
        this.isFirst = args.isFirst;
        this.cb = args.cb;
        this.createItem();
        delay(0.5).then(() => {
            this.spin();
        })
    }
    private my: number[] = [2, 0, 3, 1];
    private index: number = 0;
    private createItem() {
        let a: number[] = [2, 1, 3, 0];
        a.forEach((v, y) => {
            for (let x = 0; x < 3; x++) {
                const it = instantiate(this.item);
                it.active = true;
                this.boardNode.addChild(it);
                this.boards[y * 3 + x] = it;
                it.position = this.getPos(x, y);
                it.getComponent(Sprite).spriteFrame = this.sf[v];
            }
        })
    }
    private getPos(x: number, y: number): Vec3 {
        let _x = (x - 1) * (y == 1 ? 240 : 228);
        let _y = (y - 1) * 200;
        return v3(_x, _y);
    }
    private async spin() {
        this.index = MathUtil.probability(0.8) ? 0 : MathUtil.random(1, 2);
        // this.index = 1;
        const t = this.my[this.index];
        const all: Promise<void>[] = [];
        for (let x = 0; x < 3; x++) {
            all.push(this.spinOne(x, t + (x + 2) * 4, x * 0.2));
        }
        await Promise.all(all);
        await this.shock();
        this.end();
    }
    private async spinOne(x: number, times: number, wait: number) {
        await delay(wait);
        const time = 0.06;
        for (let i = 1; i <= times; i++) {
            for (let y = 0; y < 4; y++) {
                const curY = (y + 400 - i) % 4;
                const isDown = curY == 3
                const pos = this.getPos(x, isDown ? -1 : curY);
                const it = this.boards[y * 3 + x];

                tween(it)
                    .to(time, { position: pos },{easing:i==times?"backOut":"linear"})
                    .call(() => {
                        if (isDown) {
                            it.position = this.getPos(x, 3);
                        }
                    })
                    .start();
            }
            await delay(time, this.node);
        }
        if(x<2){
            this.shockOne();
        }
    }
    private end() {
        this.node.destroy();
        if (this.index == 0) {
            ViewManager.showRewardDoubleDialog(this.cb);
        } else if (this.index == 1) {
            ViewManager.showRewardPop(RewardType.coin, CoinManger.instance.getReward(),this.cb);
        } else {
            if (this.isFirst)
                ViewManager.showSlotMoreDialog(this.cb);
            else 
                this.cb();
        }
    }
    /**震动动画 */
    private async shock() {
        AudioManager.vibrate(1000, 255);
        const bx = this.basePos.x;
        const by = this.basePos.y;
        const time = 0.08;
        const tx = 5;
        const ty = 20;
        await tweenPromise(this.boardContent, t => t
            .to(time, { position: v3(bx + tx, by + ty) })
            .to(time, { position: v3(bx + tx * 2, by) })
            .to(time, { position: v3(bx + tx, by + ty) })
            .to(time, { position: v3(bx, by) })

            .to(time, { position: v3(bx + tx, by + ty) })
            .to(time, { position: v3(bx + tx * 2, by) })
            .to(time, { position: v3(bx + tx, by + ty) })
            .to(time, { position: v3(bx, by) })

            .to(time, { position: v3(bx + tx, by + ty) })
            .to(time, { position: v3(bx + tx * 2, by) })
            .to(time, { position: v3(bx + tx, by + ty) })
            .to(time, { position: v3(bx, by) })
        )
    }
    /**震动动画 */
    private async shockOne() {
        AudioManager.vibrate(1000, 255);
        const bx = this.basePos.x;
        const by = this.basePos.y;
        const time = 0.08;
        const tx = 5;
        const ty = 20;
        await tweenPromise(this.boardContent, t => t
            .to(time, { position: v3(bx + tx, by + ty) })
            .to(time, { position: v3(bx + tx * 2, by) })
            .to(time, { position: v3(bx + tx, by + ty) })
            .to(time, { position: v3(bx, by) })

        )
    }
}


