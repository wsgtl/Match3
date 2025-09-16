import { _decorator, CCString, Component, Enum, Node, tween, EventTouch, v3, Vec3, Tween, Vec2 } from 'cc';


const { ccclass, property, type, menu } = _decorator;

/**
 * 作用的目标类型
 */
export enum TargetType {
    OK_BUTTON,// 正向反馈按钮事件
    CANCEL_BUTTON,// 负向反馈按钮事件
}

/**
 * 触发后的动效分类。目前仅定义了缩放特效，后期逐渐完善
 */
export enum AnimEffect {
    ZOOM,// 缩放特效
    ZOOM_LEFT,
    ZOOM_RIGHT,
    ZOOM_TOP,
    ZOOM_BOTTOM,
}

export enum AnimEffectLifeCycle {
    ANIMEFFECT_START = "ANIMEFFECT_START",
    ANIMEFFECT_END = "ANIMEFFECT_END",
    ANIMEFFECT_CANCEL = "ANIMEFFECT_CANCEL",
}

@ccclass
@menu('事件特效/EventEffect')
export default class EventEffect extends Component {

    @property({ displayName: '目标类型', tooltip: '内置定义的特效方案' })
    @type(Enum(TargetType))
    targetType: TargetType = TargetType.OK_BUTTON;

    @property({ displayName: '自定义音效名称', tooltip: '仅仅当TargetType类型为CUSTOM生效' })
    @type(CCString)
    customAudioEffect: string | null = 'btn';

    @property({ displayName: '自定义动效类型', tooltip: '仅仅当TargetType类型为CUSTOM生效' })
    @type(Enum(AnimEffect))
    customAnimEffect: AnimEffect | null = AnimEffect.ZOOM;

    @property({ displayName: '特效触发事件名', tooltip: '仅仅当TargetType类型为CUSTOM生效，默认为节点的点击事件,如果为BUTTON_CLICK_EVENT，则为一整套点击流程事件' })
    @type(CCString)
    effectEvent: string = Node.EventType.TOUCH_END;

    private BUTTON_CLICK_EVENT = 'button_click_event';
    private os: Vec3 = null;
    public op: Vec3 = null;

    protected start() {
        this.os = v3(this.node.scale);
        this.op = v3(this.node.position);
        if (this.targetType === TargetType.OK_BUTTON) {
            this.okStyle();
        } else if (this.targetType === TargetType.CANCEL_BUTTON) {
            this.cancleStyle();
        } 
    }    

    // private async event(event: EventTouch) {
    //     // 增加震动反馈, 震动按钮震动逻辑特殊, 需自行处理
    //     if (this.targetType !== TargetType.VIBRATE_BUTTON)
    //         nativeHelper.feedback(1);
    //     // 添加星星粒子
    //     this.addStarEffect(event.getUILocation());
    // }

    // @ButtonLock(1)
    // private async addStarEffect(pos: Vec2) {
    //     if (this.node.getChildByName(CONSTANTS.SCREEN_STARS_PARTICLE_NAME)) {
    //         return;
    //     }
    //     const parNode = await ClickEffect.use();
    //     parNode.name = CONSTANTS.SCREEN_STARS_PARTICLE_NAME;
    //     if (!parNode || !parNode.isValid) return;
    //     if (!this.node || !this.node.isValid) return;
    //     parNode.setPosition(UIUtils.toLocation(this.node, v3(pos.x, pos.y, 0)));
    //     this.node.addChild(parNode);
    //     delay(1).then(() => {
    //         if (parNode && parNode.isValid) {
    //             parNode.destroy();
    //         }
    //     });
    // }

    private okStyle() {
        this.zoom();
    }

    private cancleStyle() {
        this.cancel();
    }

   

    private ZOOM_STYLE_TAG = 0x2032;
    private STAY_RIGHT_STYLE_TAG = 0x2033;
    private STAY_LEFT_STYLE_TAG = 0x2034;
    private STAY_TOP_STYLE_TAG = 0x2035;
    private STAY_BOTTOM_STYLE_TAG = 0x2035;
    private ROOM_SELECT_STYLE_TAG = 0x2036;


    private zoom(sound: ButtonType = ButtonType.PlaySound) {
        const os = this.os;
        const self = this;
        this.node.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            self.onAnimStart();
            Tween.stopAllByTag(this.ZOOM_STYLE_TAG, this.node);
            this.node.scale = v3(os);
            // tween(this.node).tag(this.ZOOM_STYLE_TAG).by(0.06, { scale: v3(-0.15, -0.15, -0.15) }).start();
            tween(this.node).tag(this.ZOOM_STYLE_TAG).to(0.06, { scale: v3(os.x * 0.85, os.y * 0.85, os.z * 0.85) }).start();
            // this.addStarEffect(event.getUILocation());
        }, this);
        this.node.on(Node.EventType.TOUCH_END, () => {
            Tween.stopAllByTag(this.ZOOM_STYLE_TAG, this.node);
            if(sound === ButtonType.PlaySound){
                // playEffect('btn');
            }
            tween(this.node).tag(this.ZOOM_STYLE_TAG).to(0.12, { scale: os }).call(() => {
                self.onAnimEnd();
            }).start();
        }, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, (event: EventTouch) => {
            Tween.stopAllByTag(this.ZOOM_STYLE_TAG, this.node);
            if(sound === ButtonType.PlaySound){
                // playEffect('btn');
            }
            tween(this.node).tag(this.ZOOM_STYLE_TAG).to(0.08, { scale: os }).call(() => {
                self.onAnimCancel(event);
            }).start();
        }, this);
    }

    private cancel() {
        const os = this.os;
        const self = this;
        this.node.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            self.onAnimStart();
            Tween.stopAllByTag(this.ZOOM_STYLE_TAG, this.node);
            this.node.scale = v3(os);
            // tween(this.node).tag(this.ZOOM_STYLE_TAG).by(0.06, { scale: v3(-0.15, -0.15, -0.15) }).start();
            tween(this.node).tag(this.ZOOM_STYLE_TAG).to(0.06, { scale: v3(os.x*0.85,os.y*0.85,os.z*0.85) }).start();
            // this.addStarEffect(event.getUILocation());
        }, this);
        this.node.on(Node.EventType.TOUCH_END, () => {
            Tween.stopAllByTag(this.ZOOM_STYLE_TAG, this.node);
            // playEffect('cancel_card');
            tween(this.node).tag(this.ZOOM_STYLE_TAG).to(0.12, { scale: os }).call(() => {
                self.onAnimEnd();
            }).start();
        }, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, (event: EventTouch) => {
            Tween.stopAllByTag(this.ZOOM_STYLE_TAG, this.node);
            // playEffect('cancel_card');
            tween(this.node).tag(this.ZOOM_STYLE_TAG).to(0.08, { scale: os }).call(() => {
                self.onAnimCancel(event);
            }).start();
        }, this);
    }

    

    onAnimStart() {
        this.node?.emit(AnimEffectLifeCycle.ANIMEFFECT_START);
    }

    onAnimEnd() {
        this.node?.emit(AnimEffectLifeCycle.ANIMEFFECT_END);
    }

    onAnimCancel(event: EventTouch) {
        this.node?.emit(AnimEffectLifeCycle.ANIMEFFECT_CANCEL, event);
    }

    onDestroy() {
        if (this.node && this.node.isValid) {
            this.node.targetOff(this);
        }
    }
}

export enum ButtonType {
    StopSound = 0,
    PlaySound = 1,
}