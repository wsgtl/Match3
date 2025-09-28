import { _decorator, Component, Node } from 'cc';
import { GameUtil } from '../../GameUtil_Match';
import { SpriteFrame } from 'cc';
import { Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Di')
export class Di extends Component {
    @property(Node)
    cao:Node = null;
    @property([SpriteFrame])
    sf:SpriteFrame[] = [];
    blood:number = GameUtil.DiBlood;
    init(blood:number){
        this.blood = blood;
        const isShowCao = blood>0;
        this.cao.active = isShowCao;
        if(isShowCao){
            this.cao.getComponent(Sprite).spriteFrame = this.sf[blood-1];
        }
        
    }
}


