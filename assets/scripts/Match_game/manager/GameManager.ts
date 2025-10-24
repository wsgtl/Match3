import { Vec2 } from "cc";
import Debugger from "../../Match_common/Debugger";
import { MathUtil } from "../../Match_common/utils/MathUtil";
import { v2 } from "cc";
import { GameStorage } from "../GameStorage_Match";
import { GameView } from "../view/view/GameView";
import { GuideManger } from "./GuideManager";
import { CardCreateData, CardType, GameUtil, MoveData, RewardType } from "../GameUtil_Match";
import { ViewManager } from "./ViewManger";
import { MoneyManger } from "./MoneyManger";
import { WithdrawUtil } from "../view/withdraw/WithdrawUtil";
import { CoinManger } from "./CoinManger";

const debug = Debugger("GameManger");
export class GameManger {
    public static _instance: GameManger = null;
    public static get instance(): GameManger {
        if (!this._instance) {
            this._instance = new GameManger();
        }
        return this._instance;
    }
    public static clearInstance() {
        this._instance = null;
    }
    private gv: GameView;
    public init(gv: GameView) {
        this.gv = gv;


    }


    private curLevel: number = 1;
    private lastLevel: number = 1;
    private visited: Uint8Array = new Uint8Array(GameUtil.MaxIdnex);
    public board: CardType[] = [];
    public diBoard: number[] = [];
    /**剩余通关奖励时间 */
    public passRewardTime: number = 0;
    /**当前是否是通关奖励 */
    public isPassReward: boolean = false;
    /**通关奖励获得的钱 */
    public passRewardMoney: number = 0;
    /**当前使用道具 0:无 1：炸弹 2：魔法棒*/
    public curUseProp: number = 0;

    isAni: boolean = false;


    public initDiBoard() {
        this.diBoard = [];
        for (let i = 0; i < GameUtil.MaxIdnex; i++) {
            this.diBoard[i] = GameUtil.DiBlood;
            // this.diBoard[i] = 1;
        }
        return this.diBoard;
    }
    public initBoard() {
        this.initVisited();
        this.board = [];
        // for (let i = 0; i < GameUtil.MaxIdnex; i++) {
        //     this.board[i]=GameUtil.getRandomMiniCard();
        // }
        for (let i = 0; i < GameUtil.AllRow; i++) {
            for (let j = 0; j < GameUtil.AllCol; j++) {
                let type: CardType;
                if ((i % 2) == 1 || (j % 2) == 1) {
                    const t1 = i - 1 >= 0 ? this.board[GameUtil.getIndex(j, i - 1)] : -1;//相邻的不相同，防止超过3个连接
                    const t2 = j - 1 >= 0 ? this.board[GameUtil.getIndex(j - 1, i)] : -1;
                    type = GameUtil.getRandomExcluderCard(t1, t2);
                } else {
                    type = GameUtil.getRandomMiniCard();
                }
                this.board[GameUtil.getIndex(j, i)] = type;
            }
        }
        return this.board;
    }
    /**互换 */
    public change(i1: number, i2: number) {
        const t = this.board[i1];
        this.board[i1] = this.board[i2];
        this.board[i2] = t;
        this.showLog();
    }
    private initVisited() {
        this.visited.fill(0);
    }
    public changeToClear(i1: number, i2: number) {
        this.initVisited();
        if (this.board[i1] != this.board[i2]) {
            const g1 = this.findClear(i1);
            if (g1) { return g1; }
            const g2 = this.findClear(i2);
            if (g2) { return g2; }
        }
        return null;
    }
    /**找到起始点相连的数组 */
    public findClear(start: number) {
        const type: CardType = this.board[start];
        const stack: number[] = [start];
        const group: number[] = [];

        this.visited[start] = 1;

        while (stack.length > 0) {
            const current = stack.pop()!;
            group.push(current);

            const neighbors = this.getValidNeighbors(current, type);
            for (const neighbor of neighbors) {
                if (this.visited[neighbor] === 0) {
                    this.visited[neighbor] = 1;
                    stack.push(neighbor);
                }
            }
        }

        return group.length >= 3 ? group : null;
    }
    /**
     * 获取有效的相邻单元格（优化版）
     */
    private getValidNeighbors(index: number, type: CardType): number[] {
        const neighbors: number[] = [];
        const p = GameUtil.getPos(index);
        const col = GameUtil.AllCol;


        if (p.x < col - 1) {
            const t1 = index + 1;
            if (this.board[t1] == type) {
                neighbors.push(t1);
            }
        }
        if (p.x > 0) {
            const t1 = index - 1;
            if (this.board[t1] == type) {
                neighbors.push(t1);
            }
        }
        if (p.y > 0) {
            const t1 = index - col;
            if (this.board[t1] == type) {
                neighbors.push(t1);
            }
        }
        if (p.y < GameUtil.AllRow - 1) {
            const t1 = index + col;
            if (this.board[t1] == type) {
                neighbors.push(t1);
            }
        }


        return neighbors;
    }
    /**全局找到第一个可清除的组 */
    public findOneClear() {
        this.initVisited();
        for (let i in this.board) {
            if (this.visited[i] == 0) {
                const g = this.findClear(parseInt(i));
                if (g) return g;
            }
        }
    }
    /**清理掉相连的，并生成更高一级，达到最高级就全部消除 */
    public clearAndUp(group: number[]): MoveData[] {
        const md: MoveData[] = [];
        const type = this.board[group[0]];
        let ct = 0;
        group.forEach((v, i) => {
            if (i == 0 && type < CardType.c13) {
                ct = type + 1;
                this.board[v] = ct;
                md.push({ from: v, changeType: ct });
            } else {
                this.board[v] = 0;
                const tos: number[] = [];
                let cur = i;
                for (let k = i - 1; k >= 0; k--) {
                    const i1 = group[k];
                    const i2 = group[cur];
                    const cha = Math.abs(i1 - i2)
                    if (cha == GameUtil.AllCol || cha == 1) {
                        tos.push(i1);
                        cur = k;
                    }
                }
                md.push({ from: v, tos });
            }
        })
        return md;
    }
    /**清理掉小组的 */
    public justClearGroup(group: number[]) {
        group.forEach((v, i) => {
            this.board[v] = 0;
        });
    }
    /**下坠 */
    public drop(): MoveData[] {
        const md: MoveData[] = [];
        for (let x = 0; x < GameUtil.AllCol; x++) {
            let _y = 0;
            let cur = x;
            for (let y = 0; y < GameUtil.AllRow; y++) {
                if (this.board[cur] != 0) {
                    if (_y < y) {
                        const to = GameUtil.getIndex(x, _y);
                        this.board[to] = this.board[cur];
                        this.board[cur] = 0;
                        md.push({ from: cur, to: to })
                    }
                    _y++;
                }
                cur += GameUtil.AllCol;
            }
        }
        return md;
    }
    private sfw: number[] = [- GameUtil.AllCol, 1, -1];
    /**生成新的 */
    public createNewBird() {
        const group: CardCreateData[] = [];
        const posGroup: number[] = [];
        for (let i = 0; i < this.board.length; i++) {
            const v = this.board[i];
            if (v != 0) continue;
            posGroup.push(i);
        }
        const isMustCombo = this.mustCombo > this.combo;
        let comboType: CardType;
        if (isMustCombo) {
            comboType = this.getNearType(posGroup);
        }
        let times = 0;
        posGroup.forEach((i) => {
            const type = (isMustCombo && times < 3) ? comboType : GameUtil.getRandomMiniCard();
            times++;//控制数量
            this.board[i] = type;
            group.push({ index: i, type });
        })
        return group;
    }
    /**获取相邻卡片类型使得可以连消 */
    private getNearType(posGroup:number[]) {
        this.sfw.shuffle();
        const pg = MathUtil.copyArr(posGroup);
        pg.shuffle();
        for (let i = 0; i < pg.length; i++) {
            const _i = pg[i];
            const v = this.board[_i];
            if (v != 0) continue;
            for (let j of this.sfw) {
                const index = _i + j;
                if (index < 0) continue;
                if (j == - GameUtil.AllCol || GameUtil.isRow(_i, index)) {
                    const type = this.board[index];
                    if (type < 6 && type > 0)
                        return this.board[index];//计算可连消的方块
                }
            }
        }
        return GameUtil.getRandomMiniCard();
    }
    private showLog() {
        let s = "";
        for (let i = 5; i >= 0; i--) {
            for (let j = 0; j < 6; j++) {
                const index = GameUtil.getIndex(j, i);
                s += this.board[index] + " ";
                if (j == 5) s += "\n";
            }

        }
        console.log(s);
    }

    /**底扣血 */
    public diBlood(group: number[]) {
        group.forEach(v => {
            this.diBoard[v] = Math.max(0, this.diBoard[v] - 1);
        })
        this.gv.showTaskDi();
    }
    /**判断是否通关 */
    public isPass() {
        // return true;
        for (let a of this.diBoard) {
            if (a > 0) return false;
        }
        return true;
    }

    /**打乱位置 */
    public shuffle() {
        const max = GameUtil.MaxIdnex - 1;
        for (let i = 0; i <= max; i++) {
            const j = MathUtil.random(0, max);
            const v = this.board[i];
            this.board[i] = this.board[j];
            this.board[j] = v;
        }
    }
    /**随机获取同颜色的，并消除 */
    public clearSameColor(index: number) {
        // const color = GameUtil.getColor(this.board.getRandomItem());
        const color = GameUtil.getColor(this.board[index]);
        const group: number[] = [];
        this.board.forEach((v, i) => {
            if (color == GameUtil.getColor(v)) {
                group.push(i);
            }
        })
        return { group, color };
    }
    /**爆炸道具，清理九宫格的卡片 */
    public bombClear(index: number): number[] {
        // const x = MathUtil.random(1, 4);
        // const y = MathUtil.random(1, 4);
        // const index = GameUtil.getIndex(x, y);
        const pos = GameUtil.getPos(index);
        const x = GameUtil.BombPos[pos.x];//位置纠正，让在边上的炸弹可以炸到全部9个
        const y = GameUtil.BombPos[pos.y];
        index = GameUtil.getIndex(x, y);
        const group: number[] = [index];
        GameUtil.Nearby8.forEach(v => {
            group.push(index + v);
        })
        return group;
    }
    /**必连消次数 */
    public mustCombo: number = 0;
    /**连消次数 */
    private combo: number = 0;
    public getCombo() {
        return this.combo;
    }
    /**combo */
    public addCombo() {
        this.combo++;
        this.gv.showCombo(this.combo);
        if (!this.isPassReward) this.gv.addComboProgress();
    }
    /**获取随机必连消次数 */
    public calMustCombo() {
        this.mustCombo = MathUtil.probability(0.6) ? 0 : MathUtil.probability(0.5) ? 5 : 10;
        // this.mustCombo = 20;
    }
    /**结束连击后 */
    public async afterCombo() {
        this.mustCombo = 0;
        if (!this.isPassReward) await this.showRewardForCombo();
        this.combo = 0;
        if (!this.isPassReward) this.gv.afterCombo();
        if (this.isPassReward && this.passRewardTime <= 0) {
            this.gv.endPassReward();
        }
    }
    public showRewardForCombo() {
        return new Promise<void>(res => {
            //根据连击数给予奖励
            if (this.combo < 5) {
                res();
            } else if (this.combo < 10) {
                const type: RewardType = MathUtil.random(1, 2);
                const num = type == RewardType.money ? MoneyManger.instance.getReward(WithdrawUtil.MoneyBls.RewardFree) : CoinManger.instance.getReward();
                ViewManager.showRewardPop(type, num, () => {
                    res();
                });
            } else {
                ViewManager.showSlotDialog(true, () => {
                    res();
                });
            }
        })

    }
    /**通关奖励关卡结束后恢复 */
    public endPassReward() {
        this.passRewardMoney = 0;
        for (let i in this.diBoard) {
            this.diBoard[i] = GameUtil.DiBlood;
        }
    }
}
