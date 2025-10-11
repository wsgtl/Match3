import { _decorator, Component, Node, view } from 'cc';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
const { ccclass, property } = _decorator;

@ccclass('BgFit')
export class BgFit extends Component {
    onLoad() {
        const h = view.getVisibleSize().y;
        const bgH = UIUtils.getHeight(this.node);
        if (h > bgH)
            UIUtils.setHeight(this.node, h);//超过该图片长度才进行缩放
    }
}

