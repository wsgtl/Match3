import { EventTarget } from 'cc';

/**
 * 重写 emit on 方法
 */
export class BaseEventTarget extends EventTarget {

    // 保留原有方法
    public emitOrigin: Function = null;
    public onOrigin: Function = null;

    constructor() {
        super();
        this.emitOrigin = super.emit;
        this.onOrigin = super.on;
    }

    /**
     * 重写了父类的 emit 方法，返回 Promise 对象，等待监听者执行完回调方法， Promise 对象状态才会变成已完成
     * @param eventName
     * @param args
     */
    emit(eventName: string, ...args: any[]): Promise<any> {
        return new Promise((resolve) => {
            if (!this.hasEventListener(eventName)) {
                resolve(null);
                return;
            }
            let flag = false;
            const done = (param: any) => {
                if (resolve && !flag) {
                    resolve(param);
                }
                flag = true;
            };
            super.emit(eventName, args, done);  // 存在一对多的事件注册情况， 一旦出现这种情况， 当前promise的状态就会出错
        });
    }


    /**
     * 重写了父类的 on 方法
     * @param type
     * @param callback 当回调函数会返回 Promise 对象或者都是同步代码时，不需要执行 done()，发布者也能知道回调函数执行完毕的时刻。
     * @param target
     * @param useCapture
     */
    on<T extends (...any: any) => any>(type: string, callback: T, target?: any, useCapture?: boolean): T {
        const callbackWrapper = (args: any[], done: Function) => {
            const applyRes = callback.apply(target, [...args]);
            if (!applyRes) {
                done();
            } else if (typeof applyRes.then === 'function') {
                applyRes.then((result: any) => done(result));
            } else {
                done(applyRes);
            }
        };
        return super.on(type, callbackWrapper as T, target, useCapture);
    }

    /**
     * 新增了 onAsync 方法
     * @param type
     * @param callback 回调函数的入参会追加一个 done 函数值参数
     * - 当回调函数里含有异步代码时，可以在异步代码执行完后再执行 done() 来通知发布者回调函数已完成。
     * @param target
     * @param useCapture once
     */
    onAsync<T extends (...any: any) => any>(type: string, callback: T, target?: any, useCapture?: boolean): T {
        const callbackWrapper = (args: any[], done: Function) => {
            callback.apply(target, [...args, done]);
        };
        return super.on(type, callbackWrapper as T, target, useCapture);
    }

    destroy() {
        // @ts-ignore
        this.clear();
    }
}