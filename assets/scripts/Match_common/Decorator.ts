let gisLock: boolean = false;
let gtimeout: any = null;
/**
 * 共享的按钮禁止点击
 * @param lockTime 
 * @param callBackFun 
 * @returns 
 */
export function GlobalButtonLock(lockTime: number = 0.5, callBackFun?: Function) {
    // https://forum.cocos.org/t/topic/41464/13
    return function gbuttonlock(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const oldFun: Function = descriptor.value;
        // let isLock: boolean = false;
        descriptor.value = function aa(...args: any[]) {
            if (gisLock) {
                callBackFun?.();
                return;
            }
            gisLock = true;
            if (gtimeout != null) {
                clearTimeout(gtimeout);
            }
            gtimeout = setTimeout(() => {
                gisLock = false;
            }, lockTime * 1000);
            oldFun.apply(this, args);
        };
        return descriptor;
    };
}
let lastKey = 0;
/**
 * 共享的按钮禁止点击,但可以多次点击同一个按钮
 * @param lockTime 
 * @param key 
 * @returns 
 */
export function GlobalButtonLockSame(lockTime: number = 0.5, key: number = 0) {
    return function gbuttonlock(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const oldFun: Function = descriptor.value;
        descriptor.value = function aa(...args: any[]) {
            if (gisLock && (!lastKey || lastKey != key)) {
                return;
            }
            gisLock = true;
            if (gtimeout != null) {
                clearTimeout(gtimeout);
                lastKey = key;
            }
            gtimeout = setTimeout(() => {
                gisLock = false;
                lastKey = 0;
            }, lockTime * 1000);
            oldFun.apply(this, args);
        };
        return descriptor;
    };
}
/**
 * 单个按钮的禁止快速点击
 * @param lockTime 
 * @param callBackFun 
 * @returns 
 */
export function ButtonLock(lockTime: number = 0.3, callBackFun?: Function) {
    return function buttonlock(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const oldFun: Function = descriptor.value;
        let isLock: boolean = false;
        descriptor.value = function aa(...args: any[]) {
            if (isLock) {
                callBackFun?.();
                return;
            }
            isLock = true;
            setTimeout(() => {
                isLock = false;
            }, lockTime * 1000);
            oldFun.apply(this, args);
        };
        return descriptor;
    };
}