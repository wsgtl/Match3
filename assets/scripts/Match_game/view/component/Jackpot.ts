import { _decorator, Component, Node } from 'cc';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { LangStorage } from '../../../Match_common/localStorage/LangStorage';
import { JackpotManger } from '../../manager/JackpotManager';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
const { ccclass, property } = _decorator;

@ccclass('Jackpot')
export class Jackpot extends Component {
    @property([NumFont])
    sys:NumFont[]=[];

    protected onLoad(): void {
        JackpotManger.register(this.sys[0]);
        const data = JackpotManger.getData();
        this.sys.forEach((v,i)=>{
            v.num = FormatUtil.toXXDXX(data[i]);
        })

    }
    protected onDestroy(): void {
        JackpotManger.cancel(this.sys[0]);
    }
}


