import { SpriteFrame } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { GameUtil } from '../../GameUtil_Match';
import { GameManger } from '../../manager/GameManager';
import { UIUtils } from '../../../Match_common/utils/UIUtils';
import { Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TaskShow')
export class TaskShow extends Component {
    @property([SpriteFrame])
    sf: SpriteFrame[] = [];

    private board: Node[] = [];
    protected onLoad(): void {
        for (let i = 0; i < GameUtil.MaxIdnex; i++) {
            const b = UIUtils.createSprite();
            b.getComponent(Sprite).spriteFrame = this.sf[0];
            this.node.addChild(b);
            const p = GameUtil.getPostask(i);
            b.position = p;
            this.board[i]=b;
        }
    }
    show() {
        GameManger.instance.diBoard.forEach((v, i) => {
            this.board[i].getComponent(Sprite).spriteFrame = this.sf[v > 0 ? 0 : 1];
        })
    }
}


