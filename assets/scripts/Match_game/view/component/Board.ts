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
        console.log("雪豹1")
        md.forEach(v => {
            if (v.tos) {
                pros.push(this.board[v.from].moveTos(v.tos));
            }
        })
        const first = md[0];
        console.log("雪豹2")
        if (first.changeType) {
            console.log("雪豹3")
            await Promise.all(pros);
            console.log("雪豹4")
            this.board[first.from].setType(first.changeType);
        }
        console.log("雪豹5")
    }
    /**下坠,连消流程 */
    private async dropAndClear() {
        console.log("丁真1")
        const md = GameManger.instance.drop();
        const cn = GameManger.instance.createNewBird();
        console.log("丁真2")
        if (md.length) {
            md.forEach(v => {
                const f = this.board[v.from];
                this.board[v.to] = f;
                f.dropTo(v.to);
            })
        }
        console.log("丁真3")
        await delay(0.3, this.node);
        console.log("丁真4")
        let dy = 1;
        cn.forEach(v => { dy = Math.max(GameUtil.AllRow - GameUtil.getPos(v.index).y) });
        cn.forEach(v => {
            const b = this.createBird(v.index, v.type);;
            b.initAni(v.index, dy);

        })
        console.log("丁真5")
        await delay(1, this.node);
        const group = GameManger.instance.findOneClear();
        console.log("丁真6")
        if (group) {
            console.log("丁真7")
            await this.clearGroup(group);
            await this.dropAndClear();
        } else {
            console.log("我是丁真")
        }
    }
}


