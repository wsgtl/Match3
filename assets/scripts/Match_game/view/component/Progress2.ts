import { _decorator, Component, Node } from 'cc';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { Sprite } from 'cc';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
const { ccclass, property } = _decorator;

@ccclass('Progress2')
export class Progress2 extends Component {
    @property({ type: Number, tooltip: '进度条长度' })
    length: number = 500;
    private _progress: number = 0;

    public get progress(): number {
        return this._progress;
    }

    @property({ type: Number, tooltip: '进度值' })
    public set progress(value: number) {
        this._progress = value;
        this.updateProgress();
    }

    @property(Node)
    icon: Node = null;
    @property(NumFont)
    num: NumFont = null;




    private updateProgress() {
        this.icon.getComponent(Sprite).fillRange = this.progress;
        if (this.num) this.num.num = FormatUtil.toXX_XX(this.progress * 100) + "%";
    }
}


