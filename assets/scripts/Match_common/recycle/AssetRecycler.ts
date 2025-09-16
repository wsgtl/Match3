import { _decorator, Component, EventKeyboard, macro, systemEvent, SystemEventType, director } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('AssetRecycler')
export default class AssetRecycler extends Component {

    // 记录当前按下的按键的值
    private currentKeyCode: number = 0;

    // 玩家输入的按键组合
    private inputKeys: Set<number> = new Set();

    // 是否开始计时
    private startFrame: boolean = false;

    // 限制输入组合按键的时间(计时器)
    private timer: number = 1;

    // 记录开启监听到现在的时间
    private time: number = 0;

    // 是否触发成功
    private isSuccess: boolean = false;


    onLoad() {
        systemEvent.on(SystemEventType.KEY_DOWN, this.onKeyDown, this);
    }

    update(dt: number) {
        if (this.startFrame) {
            // 计时器++
            this.time += dt;
            if (this.time >= this.timer) {
                // 计时器超时
                if (!this.isSuccess) {
                    this.Reset();
                }
            }
        }
    }

    onDestroy() {
        systemEvent.off(SystemEventType.KEY_DOWN, this.onKeyDown, this);
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case macro.KEY.e:
                this.currentKeyCode = macro.KEY.e;
                break;
            case macro.KEY.b:
                this.currentKeyCode = macro.KEY.b;
                break;
            case macro.KEY.ctrl:
                this.currentKeyCode = macro.KEY.ctrl;
                break;
        }

        if (this.isSuccess) {
            this.isSuccess = false;
            this.Reset();
        }

        if (!this.startFrame) {
            // 启动计时器
            this.startFrame = true;
        }

        // 将按键值添加到输入按键列表
        this.inputKeys.add(this.currentKeyCode);


        // 遍历
        const size = this.inputKeys.size;
        if (size < 2) return;
        // if (this.inputKeys.has(macro.KEY.ctrl)) {
        //     if (this.inputKeys.has(macro.KEY.e)) {
        //         this.isSuccess = true;
        //         // assets.unrelease();
        //         director.loadScene('MemoryDebugScene');

        //     } else if (this.inputKeys.has(macro.KEY.b)) {
        //         this.isSuccess = true;
        //         assets.references();
        //     }
        // }
    }

    // 重置
    Reset() {
        this.time = 0;
        this.startFrame = false;
        this.inputKeys = new Set();
    }

}