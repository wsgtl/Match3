import { _decorator, Component, Node } from 'cc';
import { CardType, GameUtil } from '../../GameUtil_Match';
import { SpriteFrame } from 'cc';
import { Sprite } from 'cc';
import { tweenPromise } from '../../../Match_common/utils/TimeUtil';
import { ActionEffect } from '../../../Match_common/effects/ActionEffect';
import { Label } from 'cc';
import { v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bird')
export class Bird extends Component {
    @property(Node)
    icon: Node = null;
    @property(Label)
    l: Label = null;
    @property([SpriteFrame])
    sf: SpriteFrame[] = [];

    type: CardType;
    init(type: CardType) {
        this.setType(type);
    }
    public setType(type: CardType) {
        this.type = type;
        this.icon.getComponent(Sprite).spriteFrame = this.sf[this.type - 1];
        this.l.string = type + "";
    }
    public async initAni(i: number, dropY: number) {
        const to = GameUtil.getPost(i);
        this.node.position = GameUtil.getPost(i + dropY * GameUtil.AllCol)
        await tweenPromise(this.node, t => t.to(Math.min(0.4, 0.1 * dropY), { position: to }))
    }
    /**变换位置 */
    async changeTo(i: number) {
        const pos = GameUtil.getPost(i);
        await tweenPromise(this.node, t => t.to(0.1, { position: pos }))
    }
    /**下坠 */
    async dropTo(i: number) {
        const pos = GameUtil.getPost(i);
        await tweenPromise(this.node, t => t.to(0.2, { position: pos }))
    }
    async moveTos(tos: number[]) {
        for (let i of tos) {
            const pos = GameUtil.getPost(i);
            await tweenPromise(this.node, t => t.to(0.1, { position: pos }))  
        }
        this.clearAni();
    }
    async clearAni() {
        await ActionEffect.scale(this.node, 0.1, 0);
        this.node.destroy();
    }
    async colorClearAni(){
        await tweenPromise(this.icon,t=>t.to(0.1,{angle:30}).to(0.2,{angle:-30}).to(0.1,{angle:0}))
        await this.clearAni();
    }
    async shuffleChange(type: CardType,i:number){
        await ActionEffect.moveTo(this.node,0.3,0,0);
        this.setType(type);
        const pos = GameUtil.getPost(i);
        await tweenPromise(this.node, t => t.to(0.2, { position: pos }));
    }
}


