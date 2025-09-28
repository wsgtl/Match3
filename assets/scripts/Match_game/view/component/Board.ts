import { _decorator, Component, Node } from 'cc';
import { CardType, GameUtil } from '../../GameUtil_Match';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { EventTouch } from 'cc';
import { GameManger } from '../../manager/GameManager';
import { Prefab } from 'cc';
import { Bird } from './Bird';
import { Di } from './Di';
import { instantiate } from 'cc';
import { delay } from '../../../Match_common/utils/TimeUtil';
const { ccclass, property } = _decorator;

@ccclass('Board')
export class Board extends Component {
    @property(Prefab)
    bird: Prefab = null;
    @property(Prefab)
    di: Prefab = null;
    protected onLoad(): void {
        this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
    }

    private lastIndex: number = -1;
    touchStart(e: EventTouch) {
        if (GameManger.instance.isAni) { this.lastIndex = -1; return; }
        const p = UIUtils.touchNodeLocation(this.node, e);
        const index = GameUtil.getIndext(p);
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
        this.board[i1].changeTo(i1);
        await this.board[i2].changeTo(i2);
        await this.changeToClear(i1, i2);
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

        const md = GameManger.instance.clearAndUp(group);
        const pros: Promise<void>[] = [];
        md.forEach(v => {
            if (v.tos) {
                pros.push(this.board[v.from].moveTos(v.tos));
            }
        })
        const first = md[0];
        if (first.changeType) {
            await Promise.all(pros);
            this.board[first.from].setType(first.changeType);
        }
        this.diBlood(group);
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
        await this.findOneClear();
    }
    /**颜色道具 */
    public async clearSameColor() {
        const data = GameManger.instance.clearSameColor();
        await this.justClearGroup(data.group);
        await this.dropAndClear();
    }
    /**爆炸道具 */
    public async bombClear(){
        const group = GameManger.instance.bombClear();
        await this.justClearGroup(group);
        await this.dropAndClear();
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
}


