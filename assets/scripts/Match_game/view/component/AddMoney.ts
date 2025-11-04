import { _decorator, Component, Node } from 'cc';
import { MoneyManger } from '../../manager/MoneyManger';
import { CoinManger } from '../../manager/CoinManger';
import { GameUtil } from '../../GameUtil_Match';
const { ccclass, property } = _decorator;

@ccclass('AddMoney')
export class AddMoney extends Component {
    @property(Node)
    add: Node = null;
    @property(Node)
    sub: Node = null;
    @property(Node)
    addCoin: Node = null;
    @property(Node)
    subCoin: Node = null;
    protected onLoad(): void {
        this.node.active = GameUtil.IsTest;
    }
    start() {
        this.add.on(Node.EventType.TOUCH_START, () => {
            // MoneyManger.instance.addMoney(30);
            this.t = 0;
            this.addNum = 1;
        })
        this.add.on(Node.EventType.TOUCH_END, () => {
            this.addNum = 0;
        })
        this.sub.on(Node.EventType.TOUCH_START, () => {
            // MoneyManger.instance.addMoney(-30);
            this.t = 0;
            this.addNum = -1;
        })
        this.sub.on(Node.EventType.TOUCH_END, () => {
            this.addNum = 0;
        })

         this.addCoin.on(Node.EventType.TOUCH_START, () => {
            CoinManger.instance.addCoin(1000000);
        })
        this.subCoin.on(Node.EventType.TOUCH_START, () => {
             CoinManger.instance.addCoin(-1000000);
        })
    }
    private addNum: number = 0;
    private t: number = 0;
    protected update(dt: number): void {
        if (this.addNum == 0) return;
        this.t += dt;
        const money = this.t < 0.3 ? 2 : this.t > 1.5 ? 200 : 20;
        MoneyManger.instance.addMoney(this.addNum * dt * money);
    }
}


