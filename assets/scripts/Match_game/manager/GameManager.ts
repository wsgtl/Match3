import { Vec2 } from "cc";
import Debugger from "../../Match_common/Debugger";
import { MathUtil } from "../../Match_common/utils/MathUtil";
import { v2 } from "cc";
import { GameStorage } from "../GameStorage_Match";
import { GameView } from "../view/view/GameView";
import { CardType, GameUtil, LineData, LineOneData, WinType } from "../GameUtil_Match";
import { GuideManger } from "./GuideManager";

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
    private board: CardType[][] = [];
    /**免费游戏盖在上面的卡片 */
    private freeGameBoard: CardType[][] = [];

    isAni: boolean = false;
    /**必出连线次数 */
    mustLineNum: number = 1;
    /**金莲卡片必出两次 */
    mustLotus: number = 0;
    /**钱卡片必出两次 */
    mustMoney: number = 0;
    /**免费游戏次数 */
    freegameTimes: number = 0;
    /**是否已出现免费游戏增加 */
    isFreegameAdd: boolean = false;
    // /**金莲卡片必出两次 */
    // public get mustLotus(): number{
    //     return GameStorage.getLimit().lotus;
    // };
    // public set mustLotus(n:number){
    //     GameStorage.setLimitLotus(n);
    // };
    // /**钱卡片必出两次 */
    // public get mustMoney(): number{
    //     return GameStorage.getLimit().cash;
    // };
    //  public set mustMoney(n:number){
    //     GameStorage.setLimitCash(n);
    // };


    public getNewBoard() {
        // this.borad = [
        //     [1, 2, 3, 4, 11,],
        //     [3, 2, 12, 1, 5,],
        //     [11, 4, 1, 5, 7,],
        // ]
        // return this.borad;
        if (GuideManger.isGuide()) {
            this.board = [
                [1, 8, 11, 6, 1,],
                [9, 1, 12, 1, 12,],
                [4, 12, 1, 9, 7,],
            ]
            return this.board;
        }
        // this.board = [];
        if (this.isFreeGame) {
            return this.freeGameBoardControl();
        }


        return this.boardControl();

    }
    /**普通随机机台 */
    private normalBoard() {
        for (let i = 0; i < GameUtil.AllRow; i++) {
            this.board.push([]);
            for (let j = 0; j < GameUtil.AllCol; j++) {
                this.board[i][j] = GameUtil.getRandomCard();
            }
        }
        return this.board;
    }
    /**必出连线机台 */
    private mustLineBoard() {
        const list = GameUtil.lines.getRandomItem();
        let lineNum = MathUtil.probability(0.1) ? 5 : MathUtil.random(3, 4);//随机连线个数,出5个概率较低
        let type = MathUtil.probability(0.15) ? MathUtil.random(6, 9) : MathUtil.random(1, 5);//随机类型,降低主图标出现概率
        // lineNum = 5;
        // type = MathUtil.random(6,9);
        for (let i = 0; i < lineNum; i++) {
            this.board[list[i]][i] = type;
        }
    }
    private clearCards(board: CardType[][] = this.board) {
        for (let i = 0; i < GameUtil.AllRow; i++) {//先清空卡片数据
            board[i] = [];
            for (let j = 0; j < GameUtil.AllCol; j++) {
                board[i][j] = CardType.none;
            }
        }
    }
    /**随机插入普通卡片 */
    private randomInsertCards(hasWild: boolean = true) {
        const max = hasWild ? CardType.wild : CardType.wild - 1;
        for (let i = 0; i < GameUtil.AllRow; i++) {
            for (let j = 0; j < GameUtil.AllCol; j++) {
                if (this.board[i][j] == CardType.none) {
                    // this.board[i][j] = GameUtil.getRandomNormalCard();//插入普通卡片
                    this.board[i][j] = MathUtil.random(1, max);;//插入普通卡片
                }
            }
        }
    }


    /**机台卡片控制 */
    private boardControl() {
        this.clearCards();//先清空卡片数据


        //连线控制
        if (this.mustLineNum > 0) {
            this.mustLineNum--;
            this.mustLineBoard();
        }

        const type = MathUtil.random(0, 2);
        //金莲控制
        // if (type == 1 || this.mustLotus > 0) {
        if (MathUtil.probability(0.5) || this.mustLotus > 0) {
            let num1 = MathUtil.random(1, 3);
            if (this.mustLotus > 0) {
                this.mustLotus--;
                num1 = MathUtil.random(2, 4);
            }
            this.insertCard(CardType.lotus, num1);
        }
        // this.insertCard(CardType.lotus, 1);//金莲必出测试代码
        //钱卡片控制
        // if (type == 2 || this.mustMoney > 0) {
        if (MathUtil.probability(0.4) || this.mustMoney > 0) {
            let num2 = MathUtil.random(1, 4);
            if (this.mustMoney > 0) {
                this.mustMoney--;
                num2 = MathUtil.random(2, 4);
            }
            this.insertCard(CardType.money, num2);
        }
        // this.insertCard(CardType.money, 3);//钱必出测试代码
        //免费游戏控制
        if (MathUtil.probability(0.5)) {
            let num3 = MathUtil.probability(0.85) ? MathUtil.random(1, 2) : MathUtil.random(3, 5);
            let gl = num3 < 3 ? 0.5 : num3 < 5 ? 0.3 : 0.1;
            this.insertCardOne(CardType.freeGame, num3, gl);
        }
        // this.insertCardOne(CardType.freeGame, 3, 0);//免费游戏必出测试代码

        //随机插入普通卡片
        this.randomInsertCards();

        return this.board;
    }

    /**初始化免费游戏相关参数 */
    public initFreeGame() {
        this.clearCards(this.freeGameBoard);
    }
    /**免费游戏机台控制 */
    private freeGameBoardControl() {
        this.clearCards();//先清空卡片数据

        //连线控制
        this.mustLineBoard();

        //金莲控制
        this.insertCard(CardType.lotus, MathUtil.random(0, 2));

        //钱卡片控制
        this.insertCard(CardType.money, MathUtil.random(0, 3));

        //随机插入普通卡片
        this.randomInsertCards(false);

        const cards = this.findCards(CardType.wild, this.freeGameBoard);
        if (MathUtil.randomBool() && cards.length < GameUtil.MaxWildNum) {
            const max = Math.min(2, GameUtil.MaxWildNum - cards.length);
            const num = MathUtil.random(1, max);//控制wild数量
            for (let i = 0; i < num; i++) {
                const x = MathUtil.random(1, 4);
                const y = MathUtil.random(0, 2);
                this.board[y][x] = CardType.wild;//插入wild 
            }
        }


        return this.board;
    }
    /**将wild置顶暂存，用以计算连线 */
    public upWild(): Vec2[] {
        const pos: Vec2[] = [];
        for (let i = 0; i < GameUtil.AllRow; i++) {
            for (let j = 0; j < GameUtil.AllCol; j++) {
                if (this.board[i][j] == CardType.wild) {
                    this.freeGameBoard[i][j] = CardType.wild;
                    pos.push(v2(j, i));
                    continue;
                }
                if (this.freeGameBoard[i][j] == CardType.wild) {
                    this.board[i][j] = CardType.wild;
                    continue;
                }
            }
        }
        return pos;
    }

    private insertCard(type: CardType, num: number) {
        const list: Vec2[] = [];
        for (let i = 0; i < GameUtil.AllRow; i++) {
            for (let j = 0; j < GameUtil.AllCol; j++) {
                if (this.board[i][j] == CardType.none) {
                    list.push(v2(j, i));//找到空位置
                }
            }
        }
        list.shuffle();//打乱
        for (let i = 0; i < num; i++) {
            const p = list[i];
            if (p)
                this.board[p.y][p.x] = type;//插入
            else
                break;
        }
    }
    /**一列只插入一个 */
    private insertCardOne(type: CardType, num: number, gl: number = 0) {
        for (let i = 0; i < GameUtil.AllCol; i++) {
            if (num <= 0) return;
            if (MathUtil.probability(gl)) continue;//有一定概率跳过当前列
            const list: number[] = [];
            for (let j = 0; j < GameUtil.AllRow; j++) {
                if (this.board[j][i] == CardType.none) {
                    list.push(j);//找到空位置
                }
            }
            if (list.length) {
                const p = list.getRandomItem();
                this.board[p][i] = type;
                num--;
            }
        }
    }
    private bet: number = GameUtil.BaseBet;
    // public setBet(b: number) {
    //     this.bet = b;
    // }
    /**获取连线数据 */
    public getLinesData(): LineData {
        const list = GameUtil.lines;
        const lines: LineOneData[] = [];
        list.forEach(v => {
            let type: CardType = 0;
            const arr: number[] = [];
            for (let x = 0; x < GameUtil.AllCol; x++) {
                const y = v[x];
                const t = this.board[y][x];

                if (x == 0) {
                    if (t >= CardType.wild) break;//限定可连线类型
                    type = t;
                    arr.push(y);
                } else {
                    if (type == t || t == CardType.wild) {//wild
                        arr.push(y);
                    }
                    if ((type != t && t != CardType.wild) || x == GameUtil.AllCol - 1) {
                        if (arr.length >= 3) {
                            let isSame = false;//判断前面是否有相同的线，有就不要
                            lines.forEach(v => {
                                if (v.line.length != arr.length) return;
                                for (let i = 0; i < arr.length; i++) {
                                    if (v.line[i] != arr[i]) return;
                                }
                                isSame = true;
                                return;
                            })
                            !isSame && lines.push({ type, line: arr })
                        }
                        break;
                    }
                }
            }
        })
        let coinnum = 0;
        const lineCoin = GameUtil.lineCoin;
        lines.forEach(v => {
            const n = lineCoin[v.type][v.line.length - 3];
            coinnum += n;
        });

        let winType: WinType = GameUtil.winType(coinnum);

        // if (coinnum >= GameUtil.MegaWinNum) {
        //     winType = WinType.mega;//狂赢
        // } else if (coinnum >= GameUtil.BigWinNum) {
        //     winType = WinType.big;//大赢
        // }

        return { lines: lines, winType, coin: coinnum };
    }
    /**找该类型的卡 */
    public findCards(type: CardType, board: CardType[][] = this.board): Vec2[] {
        const cardPos: Vec2[] = [];
        board.forEach((b, y) => {
            b.forEach((c, x) => {
                if (c == type) {
                    cardPos.push(v2(x, y));
                }
            })
        })
        return cardPos;
    }
    /**在免费中找该类型的卡，去掉wild */
    public findCardsFreegame(type: CardType): Vec2[] {
        const cardPos: Vec2[] = [];
        this.board.forEach((b, y) => {
            b.forEach((c, x) => {
                if (c == type && this.freeGameBoard[y][x] != CardType.wild) {
                    cardPos.push(v2(x, y));
                }
            })
        })
        return cardPos;
    }


    public cash2() {
        this.mustMoney = 5;
    }
    public lotus2() {
        this.mustLotus = 5;
    }
    /**找到咪牌起始位置 */
    public findFreeGameStart() {
        let num = 0;
        for (let x = 0; x < GameUtil.AllCol; x++) {
            for (let y = 0; y < GameUtil.AllRow; y++) {
                if (this.board[y][x] == CardType.freeGame) {
                    num++;
                    if (num >= 2) {
                        return x + 2;
                    }
                }
            }
        }
        return 10;
    }
    public autoNext() {
        this.gv.autoNext();
    }
    /**计算有几个freegame标，是否开启免费游戏 */
    public calFreeGame() {
        const cards = this.findCards(CardType.freeGame);
        if (cards.length >= 3) {
            this.freegameTimes = GameUtil.FreeGameTimes[Math.min(2, cards.length - 3)];
            this.isFreegameAdd = false;
            return true;
        }
        return false;
    }
    /**是否在免费游戏期间 */
    public get isFreeGame() {
        return this.freegameTimes > 0;
    }
}
