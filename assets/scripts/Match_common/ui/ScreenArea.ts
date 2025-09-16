import { _decorator, Component, Node, view } from 'cc';
import { UIUtils } from '../utils/UIUtils';
const { ccclass, property } = _decorator;

@ccclass('ScreenArea')
export class ScreenArea extends Component {
    onLoad() {
        UIUtils.setContentSize(this.node, view.getVisibleSize());
    }
}

