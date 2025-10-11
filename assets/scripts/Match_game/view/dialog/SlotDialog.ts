import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SlotDialog')
export class SlotDialog extends Component {
    @property(Node)
    title:Node = null;
    start() {

    }

    update(deltaTime: number) {
        
    }
}


