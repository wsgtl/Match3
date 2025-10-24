import { _decorator, Component, Node } from 'cc';
import { CardType, GameUtil, RewardType } from '../../GameUtil_Match';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { EventTouch } from 'cc';
import { GameManger } from '../../manager/GameManager';
import { Prefab } from 'cc';
import { Bird } from './Bird';
import { Di } from './Di';
import { instantiate } from 'cc';
import { delay } from '../../../Match_common/utils/TimeUtil';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { ViewManager } from '../../manager/ViewManger';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
import { v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Board')
export class Board extends Component {
    @property(Prefab)
    bird: Prefab = null;
    @property(Prefab)
    di: Prefab = null;
    @property(NumFont)
    passRewardMoney: NumFont = null;
    @property(Node)
    bombNode: Node = null;
    protected onLoad(): void {
        this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
    }

    private lastIndex: number = -1;
    touchStart(e: EventTouch) {
        if (GameManger.instance.isAni) { this.lastIndex = -1; return; }
        const p = UIUtils.touchNodeLocation(this.node, e);
        const index = GameUtil.getIndext(p);
        if (GameManger.instance.curUseProp > 0) {
            if (GameManger.instance.curUseProp == 1)
                this.bombClear(index);
            else
                this.clearSameColor(index);
            this.lastIndex = -1;
            return;
        }
        console.log("点击位置" + index);
        if (this.lastIndex < 0) {
            this.lastIndex = index;
        } else {
            if (GameUtil.isAdjoin(this.lastIndex, index))
                this.change(this.lastIndex, index);//只有上下左右才能互换
            else
                this.lastIndex = index;
        }
    }
    touchMove(e: EventTouch) {
        if (GameManger.instance.isAni) { this.lastIndex = -1; return; }
        if (this.lastIndex < 0) return;

        const p = UIUtils.touchNodeLocation(this.node, e);
        const index = GameUtil.getIndext(p);
        if (GameUtil.isAdjoin(this.lastIndex, index))
            this.change(this.lastIndex, index);//只有上下左右才能互换
    }
    /**互换 */
    private async change(i1: number, i2: number) {
        if (GameManger.instance.isAni) return;
        this.lastIndex = -1;
        GameManger.instance.change(i1, i2);
        const t = this.board[i1];
        this.board[i1] = this.board[i2];
        this.board[i2] = t;
        GameManger.instance.isAni = true;
        GameManger.instance.calMustCombo();
        this.board[i1].changeTo(i1);
        await this.board[i2].changeTo(i2);
        await this.changeToClear(i1, i2);
        GameManger.instance.afterCombo();
        GameManger.instance.isAni = false;
    }

    private board: Bird[] = [];
    private diBoard: Di[] = [];
    public initBoard() {

        this.initDi();
        const board = GameManger.instance.initBoard();//生成鸟
        board.forEach((v, i) => {
            const b = this.createBird(i, v);
            b.initAni(i, GameUtil.AllRow);
        })
    }

    private createBird(i: number, type: CardType) {
        const b = instantiate(this.bird);
        this.node.addChild(b);
        const bird = b.getComponent(Bird);
        this.board[i] = bird;
        bird.init(type);
        if (GameManger.instance.isPassReward) {
            bird.setMoney();
        }

        // b.position = GameUtil.getPost(i);
        return bird;
    }
    public initDi() {
        const board = GameManger.instance.initDiBoard();//先生成底
        board.forEach((v, i) => {
            const d = instantiate(this.di);
            this.node.addChild(d);
            const di = d.getComponent(Di);
            this.diBoard[i] = di;
            di.init(v);
            d.position = GameUtil.getPost(i);
        })
    }
    public renewDi() {
        const board = GameManger.instance.initDiBoard();//先生成底
        board.forEach((v, i) => {
            this.diBoard[i].init(v);
        })
    }

    /**互换后清理相连 */
    private async changeToClear(i1: number, i2: number) {
        const groups = GameManger.instance.changeToClear(i1, i2);
        if (groups) {
            await this.clearGroup(groups);
            await this.dropAndClear();
        }

    }
    /**清理相连 */
    private async clearGroup(group: number[]) {
        GameManger.instance.addCombo();
        let money: number = 0;
        const md = GameManger.instance.clearAndUp(group);
        const pros: Promise<void>[] = [];
        md.forEach(v => {
            if (v.tos) {
                pros.push(this.board[v.from].moveTos(v.tos));
            }
            const m = this.board[v.from]?.money;
            if (m) money += m;
        })
        this.diBlood(group);
        const first = md[0];

        if (GameManger.instance.isPassReward) {
            const b = this.board[first.from].node;
            const cur = GameManger.instance.passRewardMoney;
            GameManger.instance.passRewardMoney += money;
            delay(0.5).then(() => { ActionEffect.numAddAni(cur, GameManger.instance.passRewardMoney, (i) => { this.showMoney(i) }) })
            ViewManager.showRewardAni2(RewardType.money, b, this.passRewardMoney.node, () => { })
        }

        if (first.changeType) {
            await Promise.all(pros);
            this.board[first.from].setType(first.changeType);
        }


    }
    private showMoney(n: number) {
        this.passRewardMoney.num = FormatUtil.toMoney(n);
    }
    /**下坠,连消流程 */
    private async dropAndClear() {
        const md = GameManger.instance.drop();
        const cn = GameManger.instance.createNewBird();
        if (md.length) {
            md.forEach(v => {
                const f = this.board[v.from];
                this.board[v.to] = f;
                f.dropTo(v.to);
            })
        }
        await delay(0.3, this.node);
        let dy = 1;
        cn.forEach(v => { dy = Math.max(GameUtil.AllRow - GameUtil.getPos(v.index).y) });
        cn.forEach(v => {
            const b = this.createBird(v.index, v.type);;
            b.initAni(v.index, dy);

        })
        await delay(0.5, this.node);
        await this.findOneClear();
    }
    /**棋盘中找到可清除的第一个组，然后消除操作 */
    private async findOneClear() {
        const group = GameManger.instance.findOneClear();
        if (group) {
            await this.clearGroup(group);
            await this.dropAndClear();
        }
    }
    /**底扣血 */
    private diBlood(group: number[]) {
        GameManger.instance.diBlood(group);
        GameManger.instance.diBoard.forEach((v, i) => {
            this.diBoard[i].init(v);
        })
    }
    /**打乱 */
    public async shuffle() {
        GameManger.instance.shuffle();
        this.board.forEach((v, i) => {
            const t = GameManger.instance.board[i];
            v.shuffleChange(t, i);
        })
        await delay(0.5);
        GameManger.instance.calMustCombo();
        await this.findOneClear();
        GameManger.instance.afterCombo();
    }
    /**颜色道具 */
    public async clearSameColor(index: number) {
        GameManger.instance.curUseProp = 0;
        GameManger.instance.isAni = true;
        GameManger.instance.calMustCombo();
        const data = GameManger.instance.clearSameColor(index);
        await this.justClearGroup(data.group);
        await this.dropAndClear();
        GameManger.instance.afterCombo();
        GameManger.instance.isAni = false;
    }
    /**爆炸道具 */
    public async bombClear(index: number) {
        GameManger.instance.curUseProp = 0;
        GameManger.instance.isAni = true;
        GameManger.instance.calMustCombo();
        const group = GameManger.instance.bombClear(index);
        const b = this.board[group[0]].node;
        this.bombNode.position = v3();
        this.bombNode.scale = v3(1,1);
        this.bombNode.active = true;
        ActionEffect.fadeIn(this.bombNode, 0.1);
        const tp = UIUtils.transformOtherNodePos2localNode(b, this.bombNode);
        const cp = v3((tp.x / 2) + 400 * (tp.x < 0 ? 1 : -1), tp.y / 2 + 800);
        ActionEffect.scale(this.bombNode,0.3,2,1);
        await ActionEffect.bezierTo(this.bombNode, tp, cp, 0.5);
        ActionEffect.fadeOut(this.bombNode, 0.2);
        await this.justClearGroup(group);
        await this.dropAndClear();
        GameManger.instance.afterCombo();
        GameManger.instance.isAni = false;
    }
    /**清理掉道具影响的卡片 */
    public async justClearGroup(group: number[]) {
        GameManger.instance.justClearGroup(group);
        group.forEach(v => {
            this.board[v].colorClearAni();
            this.board[v] = null;
        })
        if (group.length) {
            await delay(0.3);
        }
        this.diBlood(group);
    }
    /**设置为使用道具的状态 */
    public setUseProp() {

    }


    /**变为通关奖励 */
    public showPassReward() {
        this.board.forEach(v => {
            v.setMoney();
        })
    }
    /**结束通关奖励 */
    public hidePassReward() {
        this.board.forEach(v => {
            v.hideMoney();
        })
        this.showMoney(0);
    }
}


