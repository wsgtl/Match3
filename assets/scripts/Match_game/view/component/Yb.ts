import { SpriteFrame } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { JakcpotType } from '../../GameUtil_Match';
import { Sprite } from 'cc';
import { sp } from 'cc';
import { delay } from '../../../Match_common/utils/TimeUtil';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { LangStorage } from '../../../Match_common/localStorage/LangStorage';
import { FormatUtil } from '../../../Match_common/utils/FormatUtil';
import { v3 } from 'cc';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
const { ccclass, property } = _decorator;

@ccclass('Yb')
export class Yb extends Component {
    @property(Node)
    sp: Node = null;
    @property(Node)
    showNode: Node = null;
    @property(NumFont)
    num: NumFont = null;
    @property(sp.Skeleton)
    sk: sp.Skeleton = null;
    @property(sp.Skeleton)
    star: sp.Skeleton = null;
    @property([SpriteFrame])
    ws: SpriteFrame[] = [];
    @property([SpriteFrame])
    strs: SpriteFrame[] = [];

    type: JakcpotType;
    public isClick: boolean = false;
    public isAd: boolean = false;
    async show(type: JakcpotType, num?: number) {
        this.showAni(type==JakcpotType.none);
        this.isClick = true;
        this.type = type;
        await delay(0.2);
        this.sp.active = false;
        if (type > 0) {
            this.showNode.active = true;
            // this.showNode.getChildByName("w").getComponent(Sprite).spriteFrame = this.ws[type - 1];
            this.showNode.getChildByName("str").getComponent(Sprite).spriteFrame = this.strs[type - 1];
        } else {
            this.num.node.active = true;
            // num = [0.3,1.1,0.003].getRandomItem();
            this.num.num = LangStorage.getData().symbol + FormatUtil.toXXDXXxsd(num,false,2);
            if(this.num.num.length>5){ 
                const sc = 1 - (this.num.num.length - 5) * 0.1;
                this.num.node.scale = v3(sc, sc);
            }
        }



    }
    hide() {
        this.sp.active = false;
        this.showNode.active = false;
        this.num.node.active = false;
    }
    showAd(v: boolean) {
        this.sp.active = v;
        this.isAd = v;
    }
    showAni(isShowStar:boolean) {
        // this.sk.node.active = true;
        // this.sk.animation = "loop";
        // delay(0.4).then(() => {
        //     this.sk.node.active = false;
        // })
        ActionEffect.skAniOnce(this.sk,"zhakai");
        isShowStar&&(this.star.node.active = true);
    }
}


