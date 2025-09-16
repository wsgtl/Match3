
import { Enum } from 'cc';
import { v2 } from 'cc';
import { UITransform } from 'cc';
import { __private } from 'cc';
import { _decorator, Component, SpriteAtlas, Sprite, Node, Layout, SpriteFrame, Layers } from 'cc';
import { UIUtils } from '../utils/UIUtils';

const { ccclass, property, menu } = _decorator;
// type Aligning = "center"|"bottom"|"top"

enum Aligning {
    center = 0,
    bottom = 1,
    top = 2
}
@ccclass('NumFont')
@menu('数字字体组件/NumFont')
export class NumFont extends Layout {

    @property({ type: SpriteAtlas, tooltip: '数字图集' })
    protected spriteAtlas: SpriteAtlas = null;

    protected _num: string = '';

    public get num(): string {
        return this._num;
    }
    protected _layoutType: __private._cocos_ui_layout__Type = 1;//默认水平布局
    protected _resizeMode: __private._cocos_ui_layout__ResizeMode = 1;//默认缩放模式

    @property({ type: String, tooltip: '数字' })
    public set num(value: string | number) {
        if (typeof value == 'number') {
            this._num = value.toString();
        } else {
            this._num = value;
        }
        this.updateNum();
    }

    public set atlas(ats: SpriteAtlas) {
        this.spriteAtlas = ats;
    }

    @property({ type: Enum(Aligning), tooltip: "对其方式" })
    set aligning(a: Aligning) {
        this._aligning = a;
        // this.updateNum();
    }
    get aligning() {
        return this._aligning;
    }
    private _aligning: Aligning = Aligning.bottom;

    @property({ type: Number, tooltip: '空格宽度' })
    public blankWidth: number = 10;
    @property({ type: Number, tooltip: '缩放比例' })
    public sc: number = 1;


    updateNum() {
        this.node.destroyAllChildren();
        const numArr = this.sliceArr(this._num, 1);
        numArr.forEach(item => {
            const node = new Node();
            this.node.addChild(node);
            if (item == " ") {//增加空格占位
                UIUtils.setWidth(node, this.blankWidth);
                return;
            }
            // node.layer = Layers.Enum.UI_2D;
            const sprite = node.addComponent(Sprite);
            sprite.spriteFrame = this.spriteAtlas.getSpriteFrame(item);
            sprite.sizeMode = Sprite.SizeMode.TRIMMED;

            if (item == "_" || item == ",") {//.和,默认在下面
                node.getComponent(UITransform).anchorPoint = v2(0.5, 0);
                const h = UIUtils.getHeight(this.node);
                node.y = h / 2 * (this._aligning == Aligning.bottom ? -1 : 1);
            }
            if (this.sc != 1) {
                // node.getComponent(UITransform).width *= this.sc;
                // node.getComponent(UITransform).height *= this.sc;
                UIUtils.setSizeScale(node,this.sc);
            }


            // if (this._aligning != Aligning.center) {
            //     node.getComponent(UITransform).anchorPoint = v2(0.5, this._aligning == Aligning.bottom ? 0 : 1);
            //     const h = UIUtils.getHeight(this.node);
            //     node.y = h / 2 * (this._aligning == Aligning.bottom ? -1 : 1);
            // }
        });
        this.node.getComponent(Layout)?.updateLayout(true);
    }

    protected sliceArr(num: string, size: number) {
        const newArr = [];
        for (let i = 0; i < num.length; i += size) {
            const chunk = num.slice(i, i + size);
            newArr.push(chunk);
        }
        return newArr;
    }

}
