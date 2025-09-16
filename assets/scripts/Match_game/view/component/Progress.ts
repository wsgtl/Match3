import { Mask } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { MathUtil } from '../../../Match_common/utils/MathUtil';
const { ccclass, property } = _decorator;

@ccclass('Progress')
export class Progress extends Component {
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
    mask: Node = null;
    @property(Node)
    icon: Node = null;



    
    private updateProgress() {
        const len = MathUtil.mm(this._progress, 0, 1) * this.length;
        UIUtils.setWidth(this.mask, len);
        if (this.icon) {
            this.icon.x = len - this.length / 2;
            // console.log(this.icon.x);
        }
    }
}


