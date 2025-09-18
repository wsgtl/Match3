import { _decorator, Component, Node } from 'cc';
import { GameUtil } from '../../GameUtil_Match';
const { ccclass, property } = _decorator;

@ccclass('Di')
export class Di extends Component {
    blood:number = GameUtil.DiBlood;
    init(blood:number){
        this.blood = blood;
    }
}


