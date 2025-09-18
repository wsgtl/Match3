import { Vec2 } from "cc";
import Debugger from "../../Match_common/Debugger";
import { MathUtil } from "../../Match_common/utils/MathUtil";
import { v2 } from "cc";
import { GameStorage } from "../GameStorage_Match";
import { GameView } from "../view/view/GameView";
import { GuideManger } from "./GuideManager";
import { CardCreateData, CardType, GameUtil, MoveData } from "../GameUtil_Match";

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
        this.curLevel = GameStorage.getCurLevel();
        this.lastLevel = GameStorage.getLastLevel();
        GameStorage.setLastLevel(this.curLevel);
        console.log(`第${this.curLevel}关,上一关是:${this.lastLevel}`);

    }


    private curLevel: number = 1;
    private lastLevel: number = 1;
    private visited: Uint8Array = new Uint8Array(GameUtil.MaxIdnex);
    public board: CardType[] = [];
    public diBoard: number[] = [];

    isAni: boolean = false;


    public initDiBoard() {
        this.board = [];
        for (let i = 0; i < GameUtil.MaxIdnex; i++) {
            this.board[i] = GameUtil.DiBlood;
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
                for (let k = i-1; k >= 0; k--) {
                    const i1=group[k];
                    const i2=group[cur];
                    const cha = Math.abs(i1-i2)
                    if(cha==GameUtil.AllCol||cha==1){
                        tos.push(i1);
                        cur=k;
                    }
                }
                md.push({ from: v, tos });
            }
        })
        return md;
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
    /**生成新的 */
    public createNewBird() {
        const group: CardCreateData[] = [];
        this.board.forEach((v, i) => {
            if (v == 0) {
                const type = GameUtil.getRandomMiniCard();
                this.board[i] = type;
                group.push({ index: i, type });
            }
        })
        return group;
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
}
