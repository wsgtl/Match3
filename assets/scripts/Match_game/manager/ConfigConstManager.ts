import { BaseStorageNS, ITEM_STORAGE } from "../../Match_common/localStorage/BaseStorage";
import { Jsb } from "../../Match_common/platform/Jsb";
import { MathUtil } from "../../Match_common/utils/MathUtil";
import { GameUtil } from "../GameUtil_Match";
import { MoneyControl, QueueControl, WaitControl, WithdrawUtil } from "../view/withdraw/WithdrawUtil";

/**配置表常量管理 */
export class ConfigConstManager {
    public static _instance: ConfigConstManager = null;
    public static get instance(): ConfigConstManager {
        if (!this._instance) {
            this._instance = new ConfigConstManager();
        }
        return this._instance;
    }
    /**是否审核 */
    public isCheck: boolean = true;
    /**钱控制数据 */
    public MoneyControlData: MoneyControl[] = WithdrawUtil.MoneyControlData;
    /**排队消耗数据 */
    public QueueControlData: QueueControl[] = WithdrawUtil.QueueControlData;
    /**等待消耗数据 */
    public WaitControlData: WaitControl[] = WithdrawUtil.WaitControlData;
    /**每个场景钱倍率 */
    public MoneyBls = WithdrawUtil.MoneyBls;
    /**其他参数 */
    public Other = {
        /**免费现钞领取间隔时间 */
        GetMoneyTime: GameUtil.GetMoneyTime,
        /**连击进度条总数 */
        CombosProgress: GameUtil.CombosProgress,
        /**激活订单需要玩多少次 */
        ActivatePlay: WithdrawUtil.ActivatePlay,
        /**插屏弹出间隔次数 */
        InterShowNum: 4,
        /**必连消次数概率 分别对应0次,5次,10次连消 */
        MustComboProb: [0.6, 0.2, 0.2]
    }
    /**初始化数值 */
    public init() {
        this.getData();
    }
    /**处理参数 */
    public calRes(data: any) {
        const arr: { lcv: string, jxmdb: string }[] = data.qmlzeklhatxgbw[0].upievzhpwu.btqofhohlbx.twjabh.hvz.trt;
        const a = this.getAbTest();//ABtest的值
        const pre = "data_" + a;
        const handlers = {//对象映射赋值
            "isCheck": (d) => { if (this.isCheck) this.isCheck = d },//过了审核模式之后就不能重新变回审核模式
            [pre]: (d) => {
                this.setData(d);
            }
        };
        arr.forEach(v => {
            handlers[v.lcv]?.(JSON.parse(v.jxmdb));
        })
        this.saveData();
    }
    private key = ITEM_STORAGE.WebConfig;
    /**保存常量数值，如果网络连接出错则使用上次保存的数值 */
    private saveData() {
        const data = {
            isCheck: this.isCheck,
            MoneyControlData: this.MoneyControlData,
            QueueControlData: this.QueueControlData,
            WaitControlData: this.WaitControlData,
            MoneyBls: this.MoneyBls,
            Other: this.Other
        }
        BaseStorageNS.setItem(this.key, JSON.stringify(data));
    }
    private getData() {
        let d = BaseStorageNS.getItem(this.key);
        if (d) {
            const data = JSON.parse(d);
            this.setData(data);
            // this.isCheck = data.isCheck;
        }
    }
    /**设置常量数值 */
    private setData(d) {
        if (d) {
            for (let i in d) {
                this[i] = d[i];
            }
        }
    }


    /**是否显示A面 */
    public get isShowA() {
        // return this.isCheck;
        return (Jsb.ios() || Jsb.browser()) && this.isCheck;
    }
    /**设置随机AB值 */
    public setAb() {
        const id = GameUtil.gerRandomId();
        let abTest = id % 2 == 1 ? "A" : "B";
        const d = { id, abTest };
        BaseStorageNS.setItem(ITEM_STORAGE.AbTest, JSON.stringify(d));
        return d;
    }
    /**AB测试 */
    public getAbTest() {
        return this.getAbTestData().abTest;
    }
    /**用户ID */
    public getId(){
        return this.getAbTestData().id;
    }
    public getAbTestData(){
        let d = BaseStorageNS.getItem(ITEM_STORAGE.AbTest);
        if (!d) return this.setAb();
        else return JSON.parse(d);
    }
}
/**配置表常量 */
export const ConfigConst = ConfigConstManager.instance;
