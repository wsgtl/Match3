import { Sprite, SpriteFrame } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { Button } from 'cc';
import { OrderData, WithdrawStorage } from './WithdrawStorage';
import { PayType, QueueControl, WaitControl, WithdrawUtil } from './WithdrawUtil';
import { MoneyManger } from '../../manager/MoneyManger';
import { EventTracking } from '../../../Match_common/native/EventTracking';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
const { ccclass, property } = _decorator;

@ccclass('OrderItem')
export class OrderItem extends Component {
    @property(NumFont)
    moneyNumNode: NumFont = null;
    @property(Node)
    queue: Node = null;
    @property(Node)
    processing: Node = null;
    @property(Node)
    limit: Node = null;
    @property(Node)
    btnQueue: Node = null;
    @property(Node)
    btnProcessing: Node = null;
    @property(Node)
    btnLimit: Node = null;
    @property(NumFont)
    timeNum: NumFont = null;
    @property(NumFont)
    dateNum: NumFont = null;
    @property(NumFont)
    queueNum: NumFont = null;
    @property(NumFont)
    backMoneyNum: NumFont = null;
    @property(Sprite)
    pay: Sprite = null;
    @property([SpriteFrame])
    paySf: SpriteFrame[] = [];

    private curOrder: OrderData;
    private showMoneyAndCoinCb: Function;

    onLoad() {
        this.btnQueue.on(Button.EventType.CLICK, this.onBtnQueue, this);
        this.btnProcessing.on(Button.EventType.CLICK, this.onBtnProcessing, this);
        this.btnLimit.on(Button.EventType.CLICK, this.onBtnLimit, this);
    }
    init(order: OrderData, cb: Function) {
        this.showMoneyAndCoinCb = cb;
        this.curOrder = order;
        this.moneyNumNode.num = FormatUtil.toMoney(order.money);
        this.showStatus();

    }
    private showStatus() {
        const order = this.curOrder;
        this.queue.active = order.status == 1;
        this.processing.active = order.status == 2;
        this.limit.active = order.status == 3;
        if (order.status == 1) {
            this.dateNum.num = WithdrawUtil.formatTimestamp(order.activateTime);
            this.queueNum.num = order.queue;
        }
        if(order.status==3){
            this.backMoneyNum.num = FormatUtil.toMoney(WithdrawUtil.getBackMoney(order));
        }
    }
    showPayIcon(type: PayType) {
        this.pay.spriteFrame = this.paySf[type - 1];
    }
    onBtnQueue() {
        const q = this.curOrder.queue;
        let data: QueueControl;
        for (let d of WithdrawUtil.QueueControlData) {
            if (q >= d.left) {
                data = d;
                break;
            }
        }
        if (!data) return;
        const p = WithdrawStorage.getPoints();
        if (p >= data.cost) {
            this.curOrder.queue = Math.max(0, q - WithdrawUtil.OneQueue);//加速排队
            WithdrawStorage.addPoints(-data.cost);
            if (this.curOrder.queue == 0) {//排队结束，进入下一阶段
                WithdrawUtil.orderWait(this.curOrder);
                WithdrawStorage.saveLocal();
                this.showStatus();
            }
            this.queueNum.num = this.curOrder.queue;
            this.showMoneyAndCoinCb();
            EventTracking.sendEventOrderSpeedUp("queue");
        }
    }
    onBtnProcessing() {
        const cur = WithdrawUtil.getCurSecond();
        const q = Math.floor((this.curOrder.waitTime - cur) / 60);
        let data: WaitControl;
        for (let d of WithdrawUtil.WaitControlData) {
            if (q >= d.left) {
                data = d;
                break;
            }
        }
        if (!data) return;
        const p = WithdrawStorage.getPoints();
        if (p >= data.cost) {
            this.curOrder.waitTime -= WithdrawUtil.OneWait * 60;//加速等待处理时间
            WithdrawStorage.addPoints(-data.cost);
            if (this.curOrder.waitTime <= cur) {//排队结束，进入下一阶段
                WithdrawUtil.orderFial(this.curOrder);
                WithdrawStorage.saveLocal();
                this.showStatus();
            }
            // this.queueNum.num = this.curOrder.queue;
            this.showMoneyAndCoinCb();
            EventTracking.sendEventOrderSpeedUp("audit");
        }
    }
    onBtnLimit() {
        if(!this.curOrder)return;
        const money = WithdrawUtil.getBackMoney(this.curOrder);
        MoneyManger.instance.addMoney(money);
        this.showMoneyAndCoinCb();
        //删除订单
        const orders = WithdrawStorage.getOrder().activated;
        orders.delSame(this.curOrder);

        WithdrawStorage.saveLocal();
        this.node.destroy();
        EventTracking.sendEventOrder("failBackMoney",this.curOrder);
    }
    protected update(dt: number): void {
        if (this.curOrder && this.curOrder.status == 2) {//等待处理倒计时
            this.timeNum.num = WithdrawUtil.colWaitTime(this.curOrder.waitTime);
        }
    }
}


