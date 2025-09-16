import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { AudioManager } from '../../manager/AudioManager';
import { SpriteFrame } from 'cc';
import { Sprite } from 'cc';
import { ButtonLock } from '../../../Match_common/Decorator';
import { tween } from 'cc';
import { v3 } from 'cc';
import { delay } from '../../../Match_common/utils/TimeUtil';
import { Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BtnSpin')
export class BtnSpin extends Component {
    @property([SpriteFrame])
    sf: SpriteFrame[] = [];
    @property(Node)
    spin: Node = null;
    @property(Node)
    stop: Node = null;
    @property(Sprite)
    strHold: Sprite = null;


    private isAni: boolean = false;
    /** 当前按钮状态 0：spin   1：自动转动stop */
    private status: number = 0;
    private spinCb: Function;
    private isFreeGame: boolean = false;
    init(spinCb: Function) {
        this.spinCb = spinCb;
    }
    onLoad() {
        this.setSpin();
        // 监听触摸事件
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onDestroy() {
        // 移除触摸事件
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
    setSpin(status:boolean=false) {
        status&&(this.status = 0);
        this.node.getComponent(Sprite).spriteFrame = this.sf[0];
        this.spin.active = true;
        this.stop.active = false;
        this.strHold.grayscale = false;
    }
    setGray() {
        this.node.getComponent(Sprite).spriteFrame = this.sf[1];
        this.spin.active = true;
        this.stop.active = false;
        this.strHold.grayscale = true;
    }
    setAuto() {
        this.node.getComponent(Sprite).spriteFrame = this.sf[0];
        this.spin.active = false;
        this.stop.active = true;
    }
    setFreeGame(isFreeGame: boolean) {
        this.isFreeGame = isFreeGame;
        if (isFreeGame) {
            this.setGray();
        } else {
            if (this.isAuto)
                this.setAuto();
            else
                this.setSpin();
        }


    }
    setIsAni(v: boolean) {
        this.isAni = v;
        if (this.isAuto) return;
        if (this.isAni) {
            this.setGray();
        } else {
            this.setSpin();
        }
    }

    private time: number = 0;
    private changeAuto: boolean = false;
    private onTouchStart() {
        if (this.isFreeGame) return;
        if (this.status == 0) {

            // this.time = Date.now();
            if (!this.guideCb)
                delay(1, this.stop).then(() => {
                    this.status = 1;
                    this.spinCb();
                    this.setAuto();
                    this.changeAuto = true;
                    AudioManager.vibrate(100,100);
                })
            this.scale(true);
        } else if (this.status == 1) {
            this.scale(true);
        }
    }
    private onTouchEnd() {
        Tween.stopAllByTarget(this.stop);
        if (this.guideCb) {//新手引导
            this.guideCb?.();
            this.spinCb();
            this.guideCb = null;
            this.scale(false);
            return;
        }
        if (this.isFreeGame) return;
        if (this.status == 0) {
            // const duration = Date.now() - this.time;
            // if (duration > 700) {//长按
            //     // this.status = 1;
            //     // this.spinCb();
            //     // this.setAuto();
            // } else {
            this.spinCb();
            // this.setGray();
            // }

            this.sound();
            this.scale(false);
        } else if (this.status == 1) {
            if (this.changeAuto) {
                this.changeAuto = false;
                return;
            }
            this.status = 0;
            if (this.isAni) {
                this.setGray();
            } else {
                this.setSpin();
            }
            this.sound();
            this.scale(false);
        }

    }
    /**是否是自动转 */
    public get isAuto() {
        return this.status == 1;
    }
    private sound() {
        AudioManager.playEffect("click");
    }
    /**缩放 */
    private scale(isBig: boolean) {
        const sc = isBig ? 1.05 : 1;
        tween(this.node)
            .to(0.1, { scale: v3(sc, sc, 1) })
            .start();
    }
    public guideCb: Function;
}


