import { SpriteAtlas } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { NumFont } from '../../../Match_common/ui/NumFont';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { delay } from '../../../Match_common/utils/TimeUtil';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { SpriteFrame } from 'cc';
import { Sprite } from 'cc';
import { i18n } from '../../../Match_common/i18n/I18nManager';
import { sprites } from '../../../Match_common/recycle/AssetUtils';
import { AudioManager } from '../../manager/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('Combo')
export class Combo extends Component {
    @property(NumFont)
    combo: NumFont = null;
    @property(Node)
    cnode: Node = null;
    @property([SpriteAtlas])
    sas: SpriteAtlas[] = [];

    onLoad() {
        this.node.active = false;
    }
    async show(n: number) {
        const an = Math.min(8, Math.floor(n/2)+1);
        AudioManager.playEffect("clear"+an,2);
        this.node.active = true;
        const color =Math.floor((n - 1) / 5)% 4;
        this.combo.spriteAtlas = this.sas[color];
        this.combo.num = n;
        sprites.setTo(this.cnode, i18n.curLangPath("c" + (color + 1)));//多语言切换combo
        ActionEffect.scale(this.node,0.1,1,1.5);
        await ActionEffect.fadeIn(this.node, 0.1);
        await delay(0.2);
        UIUtils.setAlpha(this.node,0.5);
        await ActionEffect.fadeOut(this.node, 0.3);
    }
}


