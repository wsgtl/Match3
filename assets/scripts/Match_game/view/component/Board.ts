import { Prefab } from 'cc';
import { SpriteFrame } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { Card } from './Card';
import { CardType, GameUtil, LineData, LineOneData, RewardType } from '../../GameUtil_Match';
import { instantiate } from 'cc';
import { MathUtil } from '../../../Match_common/utils/MathUtil';
import { v2 } from 'cc';
import { tween } from 'cc';
import { GameManger } from '../../manager/GameManager';
import { delay, tweenPromise } from '../../../Match_common/utils/TimeUtil';
import { Vec2 } from 'cc';
import { ViewManager } from '../../manager/ViewManger';
import { AudioManager } from '../../manager/AudioManager';
import { Button } from 'cc';
import { ButtonLock } from '../../../Match_common/Decorator';
import { GameStorage } from '../../GameStorage_Match';
import { LineAni } from '../aniComponent/LineAni';
import { MoneyAni } from '../aniComponent/MoneyAni';
import { v3 } from 'cc';
import { sp } from 'cc';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { Color } from 'cc';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
const { ccclass, property } = _decorator;

@ccclass('Board')
export class Board extends Component {
    @property(Prefab)
    cardPrefab: Prefab = null;
    @property([Node])
    ls: Node[] = [];
    @property(Node)
    upBoard: Node = null;
    @property(sp.Skeleton)
    moneySk: sp.Skeleton = null;
    @property(LineAni)
    lineAni: LineAni = null;
    @property(Node)
    boardContent: Node = null;
    @property(Node)
    borders: Node = null;


    private cards: Card[] = [];
    private basePos: Vec2;
    private init() {
        for (let x = 0; x < GameUtil.AllCol; x++) {
            for (let y = 0; y < GameUtil.CreateRow; y++) {
                const c = instantiate(this.cardPrefab);
                this.ls[x].addChild(c);
                const card = c.getComponent(Card);
                this.cards[GameUtil.AllCol * y + x] = card;
                card.init(GameUtil.getRandomCard());
                c.y = this.getY(y);
            }
        }
    }
    protected onLoad(): void {
        this.basePos = this.boardContent.pos2.clone();
        this.init();
    }
    private getY(i: number) {
        return -(i - 1) * GameUtil.CardH;
    }
    private getX(i: number) {
        return (i - 2) * GameUtil.CardW;
    }
    /**转一列 */
    private spinOne(index: number, types: CardType[], times: number, wait: number, isLineAni: boolean = false) {
        return new Promise<void>(async res => {
            if (wait > 0)
                await delay(wait);
            const list = this.ls[index];
            const h = GameUtil.CardH;
            const row = GameUtil.CreateRow;
            const by = this.getY(row - 1);
            const ty = this.getY(-1);
            const duration = 0.07;
            times--;
            const isLast = times == 0;
            // if (isLineAni && times > 1) this.playLineAniEffect();
            for (let i = 0; i < row; i++) {
                const c = list.children[i];
                const pre = row - i - 1;
                const last = row - pre;
                const toY = this.getY(i);
                tween(c)
                    .to(pre * duration, { y: by })
                    .call(() => {
                        if (isLast) {
                            if (i < GameUtil.AllRow)
                                c.getComponent(Card).setType(types[i]);
                        }
                        else {
                            c.getComponent(Card).setType(GameUtil.getRandomCard());
                        }
                        c.y = ty;
                    })
                    .to(last * duration, { y: toY })

                    .call(async () => {
                        if (i == 0) {
                            if (times > 0)
                                await this.spinOne(index, types, times, 0, isLineAni);
                            res();
                        }
                        if (times == 0) {//回弹动效
                            tween(c)
                                .to(.1, { y: toY - 40 })
                                .to(.1, { y: toY })
                                .start();
                        }
                    })
                    .start();
            }

        })

    }

    spin() {
        return new Promise<void>(res => {
            // AudioManager.vibrate(1, 155);
            AudioManager.playEffect("toubi");
            const board = GameManger.instance.getNewBoard();
            let q = 0;
            // const lineAniIndex = Math.random() < 0.4 ? MathUtil.random(2, 5) : 0;
            const lineAniIndex = GameManger.instance.findFreeGameStart();
            const isLineAni = lineAniIndex > 0 && lineAniIndex <= GameUtil.AllCol
            for (let i = 0; i < GameUtil.AllCol; i++) {
                const lineAniAdd = (isLineAni && i >= lineAniIndex - 1) ? 2 : 0;
                q += (i == 0) ? MathUtil.random(3, 5) : MathUtil.random(1, 2);
                q += lineAniAdd;
                const wait = 0.1 * i;

                this.spinOne(i, [board[0][i], board[1][i], board[2][i]], q, wait, lineAniIndex > 0)
                    .then(() => {
                        if (isLineAni) {
                            if (this.lineAni.isShow && i < 4) {
                                if (this.popFreegame(i))
                                    AudioManager.playEffect("pop");
                            }
                            if (lineAniIndex - 2 == i) {//开始咪牌
                                this.lineAni.node.x = this.ls[lineAniIndex - 1].x;
                                this.lineAni.show(true);
                                for (let x = 0; x <= i; x++) {
                                    this.popFreegame(x);
                                }
                                AudioManager.playEffect("pop");
                            }
                            if (lineAniAdd) {
                                if (i == 4) {
                                    this.lineAni.show(false);
                                    this.breatheFreegame();
                                }
                                else
                                    this.lineAni.node.x = this.ls[i + 1].x;
                            }

                        }

                        if (i == GameUtil.AllCol - 1) {
                            res();
                        }
                        const isEnd = i==4
                        AudioManager.playEffect("stop",isEnd?1:0.5);
                        AudioManager.vibrate(isEnd?80:30, isEnd?155:60);
                    })
            }

            this.showMoneyAni();
        })

    }
    private isSpin: boolean = false;
    /**显示可连线的几个方块 */
    async showLineLight(data: LineData) {
        this.isSpin = false;
        const l = data.lines;
        for (let i = 0; i < l.length; i++) {
            if (this.isSpin) return;
            const line = l[i];
            this.showLine(line.line);
            await delay(1);
        }
        if (this.isSpin) return;
        this.showLineLight(data);
    }
    private showLine(line: number[]) {
        // this.ls.forEach((list, x) => {
        //     const y = line[x];
        //     list.children.forEach((card, i) => {
        //         card.getComponent(Card).showBorder(i == y);
        //     })
        // })
        this.borders.active = line.length > 0;
        for (let i = 0; i < 5; i++) {
            const b = this.borders.children[i];
            const y = line[i];
            if (y >= 0) {
                b.active = true;
                b.y = this.getY(y);
                b.x = this.getX(i);
            } else {
                b.active = false;
            }
        }
    }

    /**对应卡片发射粒子，其他卡片变暗 */
    public async cardsShot(pos: Vec2[], toNode: Node, type: RewardType, double: boolean = false) {
        this.setAllCardDark(true);
        const duration: number = 0.7;
        pos.forEach(v => {
            const card = this.ls[v.x].children[v.y];
            card.getComponent(Card).shotAni();
            ViewManager.showRewardParticle(type, card, toNode, () => { }, duration, double);
        })
        await delay(duration);
        this.setAllCardDark(false);
    }
    /**单纯展示卡片 */
    public async showCards(pos: Vec2[]) {
        this.setAllCardDark(true);
        const duration: number = 0.7;
        pos.forEach(v => {
            const card = this.ls[v.x].children[v.y];
            card.getComponent(Card).shotAni();
            // card.getComponent(Card).setColor(false);
        })
        await delay(duration);
        this.setAllCardDark(false);
    }
    private setAllCardDark(v: boolean) {
        this.ls.forEach((list, x) => {
            list.children.forEach((card, i) => {
                card.getComponent(Card).setColor(v);
            })
        })

        this.borders.children.forEach(b=>{
            UIUtils.setAlpha(b,v?0:1);
        })
    }

    /**转动后方块成普通形态 */
    public setSpinNormal() {
        this.isSpin = true;
        this.showLine([]);
    }
    /**钱动画 */
    private showMoneyAni() {
        const moneyCards = GameManger.instance.isFreeGame? GameManger.instance.findCardsFreegame(CardType.money):GameManger.instance.findCards(CardType.money);
        if (moneyCards.length >= 3) {
            // this.moneyAni.ani();
            ActionEffect.skAniOnce(this.moneySk, "zhibi");
        }
    }

    // @ButtonLock(0.15)
    // private playLineAniEffect() {
    //     AudioManager.playEffect("nenliang");
    // }

    /**生成置顶wild */
    public createUpWild(wilds: Vec2[]) {
        wilds.forEach((v) => {
            const c = instantiate(this.cardPrefab);
            this.upBoard.addChild(c);
            const card = c.getComponent(Card);
            card.init(CardType.wild);
            c.y = this.getY(v.y);
            c.x = this.getX(v.x);
            card.pop(CardType.wild);
        })
    }
    /**清除置顶wild */
    public clearUpWild() {
        this.upBoard.destroyAllChildren();
    }
    /**震动动画 */
    public async shock() {
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
    /**打铃动画 */
    public ring() {
        const fgs = GameManger.instance.findCards(CardType.freeGame);
        AudioManager.playEffect("ring");
        const ap: Promise<void>[] = [];
        fgs.forEach(v => {
            const c = this.ls[v.x]?.children[v.y]?.getComponent(Card);
            if (c) {
                ap.push(c.ring());
            }
        })
        return Promise.any(ap);
    }
    /**让一列免费游戏显示弹起 */
    private popFreegame(x: number) {
        let num = 0;
        this.ls[x].children.forEach(v => {
            if (v.getComponent(Card).pop(CardType.freeGame)) num++;
        });
        return num > 0;
    }
    /**免费游戏显示呼吸 */
    private breatheFreegame() {
        this.ls.forEach(v => {
            v.children.forEach(v => {
                v.getComponent(Card).breathe(CardType.freeGame);
            })
        })
    }
}


