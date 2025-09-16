import { Component, macro, sys, Tween, tween, v2,Node } from 'cc';
import Debugger from '../Debugger';

const _component: Component = new Component();
const debug = Debugger('TimeUtil');

export enum IntervalUnit {
    HOUR, // 小时
    MIN, // 分钟
}

/**
 * 延时指定时间后执行
 * @param time 单位 秒
 */
export async function delay(time: number,node?:Node) {
    // 使用tween的好处在于可以用Tween停止
    return new Promise<void>(resolve => {
        // _component.scheduleOnce(() => {
        //     resolve();
        // }, time);
        if(!time){resolve();return};
        tween(node??v2())
            .delay(time)
            .call(() => {
                resolve();
            })
            .start();
    });
}

/**
 * 缓动结束的同步逻辑
 * 传入一个已经配置完成且尚未执行start的缓动动画,该方法会立即执行该缓动动画的start方法，并在动画结束后，返回一个promise
 *
 * @param tween 缓动动画
 * @param timeout 超时 可选，如果动画播放超过指定时间后，仍未结束，则会自动按照超时时间结束promise 如果不传，则不启用超时机制，如果此时缓动未能正常结束，则有可能导致程序卡住，需谨慎判断
 */
export function awaitTween(tween: Tween<any>, timeout?: number) {
    // 使用tween的好处在于可以用Tween停止
    return new Promise<void>(resolve => {
        let resolved = false;
        tween
            .call(() => {
                if (!resolved) {
                    resolved = true;
                    resolve();
                }
            })
            .start();
        if (timeout) {
            if (timeout < 0) throw new Error('超时时间必须大于0');
            delay(timeout).then(() => {
                if (!resolved) {
                    resolved = true;
                    resolve();
                }
            });
        }
    });
}
    /**
     * 创建并执行一个 Tween 动画，返回 Promise
     */
    export function tweenPromise<T>(target: T, tweenBuilder: (tween: Tween<T>) => Tween<T>,onError?: (error: any) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                tweenBuilder(tween(target))
                    .call(resolve)
                    .start();
            } catch (error) {
                onError?.(error);
                reject(error);
            }
        });
    }
/**
 * 直到条件句柄返回为ture时
 * 如果不传间隔参数，则默认每隔一帧调用一次
 * @param on 回调方法 返回值只要不为空 即返回
 * @param interval 递归间隔 单位 秒。
 * @param delay 开始延迟 单位 秒。
 */
export async function until(
    on: () => boolean,
    interval?: number,
    delay?: number,
    timeOut?: number
) {
    return new Promise<boolean>(resolve => {
        let done = false;
        let f: Function;
        const t = Date.now();
        f = async () => {
            if (!done && on()) {
                done = true;
                resolve(true);
                _component.unschedule(f);
            } else if (timeOut && timeOut > 0 && Date.now() - t >= timeOut) {
                resolve(false);
            }
        };
        _component.schedule(f, interval, macro.REPEAT_FOREVER, delay);
    });
}

/**
 * 下一帧后执行
 */
export async function nextFrame(component: Component = _component) {
    return new Promise<void>(resolve => {
        if (component && component.isValid)
            component.scheduleOnce(() => {
                resolve();
            });
        else resolve();
    });
}

/**
 * 判断执行方法是否超出指定时间
 * @param time
 * @param call
 */
export async function timeout(time: number, call: () => void) {
    let done = false;
    let timeoutFlag = false;
    const pr = new Promise<void>(resolve => {
        call();
        done = true;
        resolve();
    });
    return new Promise<boolean>(resolve => {
        delay(time).then(() => {
            if (!done) {
                timeoutFlag = true;
                resolve(true);
            }
        });
        pr.then(() => {
            if (!timeoutFlag) {
                resolve(false);
            }
        });
    });
}

/**
 * ：冒号为中文符号  如果不是图片数字 不要使用
 * @param timespan unit seconds
 * @returns 
 */
export function formatCountdown(timespan: number) {
    const OneDay = 24 * 60 * 60;
    const OneHour = 60 * 60;
    const OneMin = 60;

    const day = Math.floor(timespan / OneDay);
    const hour = Math.floor((timespan - day * OneDay) / OneHour);
    const min = Math.floor((timespan - day * OneDay - hour * OneHour) / OneMin);
    const sec = Math.floor(Math.floor(timespan) % 60);

    const dayStr = `${day}d`;
    const hourStr = day > 0 ? `${hour}h` : `${hour >= 10 ? hour : '0' + hour}`;
    const minStr = `${min >= 10 ? min : '0' + min}`;
    const secStr = `${sec >= 10 ? sec : '0' + sec}`;
    let timeStr = '';
    if (day > 0) {
        if (hour > 0) timeStr = dayStr + hourStr;
        else timeStr = dayStr;
    } else if (hour > 0) {
        timeStr = `${hourStr}：${minStr}：${secStr}`;
    } else {
        timeStr = `${minStr}：${secStr}`;
    }
    return timeStr;
}

/**
     * 将毫秒转为时分秒的格式（最小单位为秒，如："00:01:59"）
     * @param time 毫秒数
     * @param separator 分隔符
     * @param keepHours 当小时数为 0 时依然展示小时数
     * @example 
     * TimeUtil.msToHMS(119000); // "00:01:59"
     */
export function msToHMS(time: number, separator: string = ':', keepHours: boolean = true): string {
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time - (hours * 3600000)) / 60000);
    const seconds = Math.floor((time - (hours * 3600000) - (minutes * 60000)) / 1000);
    const hoursString = (hours === 0 && !keepHours) ? '' : `${hours.toString().padStart(2, '0')}:`;
    return `${hoursString}${minutes.toString().padStart(2, '0')}${separator}${seconds.toString().padStart(2, '0')}`;
}

