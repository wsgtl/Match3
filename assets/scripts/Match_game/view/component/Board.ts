import { _decorator, Component, Node } from 'cc';
import { CardType, GameUtil, PropType, RewardType } from '../../GameUtil_Match';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { EventTouch } from 'cc';
import { GameManger } from '../../manager/GameManager';
import { Prefab } from 'cc';
import { Bird } from './Bird';
import { Di } from './Di';
import { instantiate } from 'cc';
import { delay, tweenPromise } from '../../../Match_common/utils/TimeUtil';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { ViewManager } from '../../manager/ViewManger';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
import { v3 } from 'cc';
import { AudioManager } from '../../manager/AudioManager';
import { Vec2 } from 'cc';
import { MoneyManger } from '../../manager/MoneyManger';
import { WithdrawUtil } from '../withdraw/WithdrawUtil';
import { ColorProp } from '../aniComponent/ColorProp';
import { ShuffleProp } from '../aniComponent/ShuffleProp';
import { Sprite } from 'cc';
import { GuideManger } from '../../manager/GuideManager';
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
    @property(Node)
    colorNode: Node = null;
    @property(Node)
    shuffleNode: Node = null;
    @property(Node)
    boardNode: Node = null;
    @property(Node)
    clickNode: Node = null;
    @property(Sprite)
    bombSprite: Sprite = null;
    @property(Sprite)
    clearSprite: Sprite = null;
    @property(Prefab)
    colorPrefab: Prefab = null;
    @property(Prefab)
    shufflePrefab: Prefab = null;
    protected onLoad(): void {
        this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.basePos = this.boardNode.pos2.clone();
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
        this.showClick(index);
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
        this.hideClick();
        this.lastIndex = -1;
        if (GuideManger.isGuide()) {
            if (!(GuideManger.CanClick.indexOf(i1) > -1) || !(GuideManger.CanClick.indexOf(i2) > -1)) return;
        }
        this.progress1();
        GameManger.instance.change(i1, i2);
        const t = this.board[i1];
        this.board[i1] = this.board[i2];
        this.board[i2] = t;
        GameManger.instance.isAni = true;
        GameManger.instance.calMustCombo();
        this.board[i1].changeTo(i1);
        await this.board[i2].changeTo(i2);
        await this.changeToClear(i1, i2);
        this.afterCombo();
    }

    private board: Bird[] = [];
    private diBoard: Di[] = [];

    /**恢复游戏 */
    public recoverGame() {
        if (!GameManger.instance.recoverBoard()) {
            this.newGame();//第一次进游戏就创建新的
            return false;
        }
        return true;
    }
    public newGame() {
        GameManger.instance.initDiBoard();
        GameManger.instance.initBoard();
    }
    public renewBoard() {
        const board = GameManger.instance.board;//生成鸟
        board.forEach((v, i) => {
            const b = this.board[i];
            b.init(v);
            b.initAni(i, GameUtil.AllRow);
        })
    }
    public initBoard() {
        const board = GameManger.instance.board;//生成鸟
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
        const board = GameManger.instance.diBoard;//先生成底
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
        GameManger.instance.saveBoardData();
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
        WithdrawUtil.comboToOrder();
        // AudioManager.playEffect("drop");
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
            this.flyMoney(money, b);
            // const cur = GameManger.instance.passRewardMoney;
            // GameManger.instance.passRewardMoney += money;
            // delay(0.5).then(() => { ActionEffect.numAddAni(cur, GameManger.instance.passRewardMoney, (i) => { this.showMoney(i) }) })
            // ViewManager.showRewardAni2(RewardType.money, b, this.passRewardMoney.node, () => { })
        }

        await Promise.all(pros);

        // AudioManager.playEffect("yb");
        if (first.changeType) {
            this.showAniClear(first.from);
            this.board[first.from].setType(first.changeType, true);
        }
        AudioManager.playEffect("clears", 0.6);
        AudioManager.vibrate(50, 100);


    }
    private flyMoney(money: number, from: Node) {
        const cur = GameManger.instance.passRewardMoney;
        GameManger.instance.passRewardMoney += money;
        delay(0.5).then(() => { ActionEffect.numAddAni(cur, GameManger.instance.passRewardMoney, (i) => { this.showMoney(i) }) })
        ViewManager.showRewardAni2(RewardType.money, from, this.passRewardMoney.node, () => { })
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
        await delay(0.2, this.node);
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
        this.hideClick();
        GameManger.instance.shuffle();

        this.board.forEach(async (v, i) => {
            const t = GameManger.instance.board[i];
            await delay(0.4);
            v.shuffleChange(t, i);
        })
        const cp = ViewManager.createPrefab(this.shufflePrefab);
        await cp.getComponent(ShuffleProp).ani(this.shuffleNode, this.node);
        this.progress1();
        GameManger.instance.isAni = true;
        GameManger.instance.calMustCombo();
        await this.findOneClear();
        this.afterCombo();
    }
    /**颜色道具 */
    public async clearSameColor(index: number) {

        this.closeUseProp();
        GameManger.instance.isAni = true;
        GameManger.instance.calMustCombo();
        const data = GameManger.instance.clearSameColor(index);
        GameManger.instance.justClearGroup(data.group);
        const groups: Bird[] = [];
        data.group.forEach(v => {
            groups.push(this.board[v]);
            // this.board[v].colorClearAni();
            this.board[v] = null;
        })
        const cp = ViewManager.createPrefab(this.colorPrefab);
        await cp.getComponent(ColorProp).ani(this.colorNode, groups);
        this.progress1();
        this.diBlood(data.group);
        // await this.justClearGroup(data.group);
        await this.dropAndClear();
        this.afterCombo();
    }
    /**爆炸道具 */
    public async bombClear(index: number) {
        this.closeUseProp();
        AudioManager.playEffect("bombMove");
        GameManger.instance.isAni = true;
        GameManger.instance.calMustCombo();
        const group = GameManger.instance.bombClear(index);
        const b = this.board[group[0]].node;

        this.bombNode.position = v3();
        this.bombNode.scale = v3(1, 1);
        this.bombNode.active = true;
        ActionEffect.fadeIn(this.bombNode, 0.1);
        const tp = UIUtils.transformOtherNodePos2localNode(b, this.bombNode);
        const cp = v3((tp.x / 2) + 400 * (tp.x < 0 ? 1 : -1), tp.y / 2 + 1000);
        ActionEffect.scale(this.bombNode, 0.3, 2, 1);
        await ActionEffect.bezierTo(this.bombNode, tp, cp, 0.6);//抛射炸弹动画


        this.bombSprite.node.active = true;
        this.bombSprite.node.position = b.position.clone();
        ActionEffect.playAni(this.bombSprite, 13, 0.06);//爆炸帧动画


        this.board.forEach(v => { v.bombMove(b) });//炸弹波动画
        this.shock();
        AudioManager.playEffect("bomb");
        ActionEffect.fadeOut(this.bombNode, 0.2);
        this.progress1();
        await this.justClearGroup(group);
        await this.dropAndClear();
        this.afterCombo();
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
    public setUseProp(prop: PropType) {
        this.hideClick();
        this.board.forEach(v => {
            v.useProp();
            v.changeProp(prop);
        })
    }
    /**关闭使用道具状态 */
    public closeUseProp() {
        GameManger.instance.curUseProp = 0;
        this.board.forEach(v => {
            v.closeUseProp();
        })
    }


    /**变为通关奖励 */
    public showPassReward() {
        this.board.forEach(v => {
            v.setMoney();
        })
        this.flyMoney(MoneyManger.instance.getReward(WithdrawUtil.MoneyBls.RewardFree), this.node);
    }
    /**结束通关奖励 */
    public hidePassReward() {
        this.board.forEach(v => {
            v.hideMoney();
        })
        this.showMoney(0);
    }
    private basePos: Vec2;
    /**震动动画 */
    private async shock() {
        AudioManager.vibrate(100, 255);
        const bx = this.basePos.x;
        const by = this.basePos.y;
        const time = 0.08;
        const tx = 5;
        const ty = 20;
        await tweenPromise(this.boardNode, t => t
            .to(time, { position: v3(bx + tx, by + ty) })
            .to(time, { position: v3(bx + tx * 2, by) })
            .to(time, { position: v3(bx + tx, by + ty) })
            .to(time, { position: v3(bx, by) })


        )
    }
    showClick(index: number) {
        this.clickNode.active = true;
        this.clickNode.position = GameUtil.getPost(index);
    }
    hideClick() {
        this.clickNode.active = false;
    }
    showAniClear(index: number) {
        // return;
        this.clearSprite.node.active = true;
        this.clearSprite.node.position = GameUtil.getPost(index);
        ActionEffect.playAni(this.clearSprite, 6, 0.05);//清除帧动画
    }
    /**获取卡片 */
    getCard(index: number): Bird {
        return this.board[index];
    }
    private progress1(){
        
    }
    private afterCombo(){
        GameManger.instance.afterCombo();
        GameManger.instance.isAni = false;
    }
    private moves: number = 0;
    /**自动展示可移动消除位置 */
    public async autoShowCanMoveClear() {
        let m = ++this.moves;
        await delay(3);
        if (GameManger.instance.isAni) return;
        if (m != this.moves) return;
        const index = GameManger.instance.findMoveCanClear();
        if (index >= 0) {
            this.lastIndex = index;
            this.showClick(index);
        }
    }

}


