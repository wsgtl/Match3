export namespace MathUtil {
    /**获取随机整数 */
    export function random(m: number, n: number) {
        if (typeof m != "number" || typeof n != "number") return;
        let max = n;
        let min = m;
        if (m > n) {
            max = m; min = n;
        }
        let value = max - min + 1;
        return Math.floor(Math.random() * value) + min;
    }
    /**获取随机浮点数 */
    export function randomFloat(m: number, n: number) {
        if (typeof m != "number" || typeof n != "number") return;
        let max = n;
        let min = m;
        if (m > n) {
            max = m; min = n;
        }
        let value = max - min;
        return Math.random() * value + min;
    }
    /**获取随机布尔值 */
    export function randomBool() {
        return Math.random() < 0.5;
    }
    /**获取随机正负1 */
    export function randomOne() {
        return Math.random() < 0.5 ? 1 : -1;
    }

    /**限制最大最小值 */
    export function mm(num: number, min: number, max: number) {
        return Math.max(min, Math.min(max, num));
    }
    /**去掉小数 2.1->2  -2.1->-2*/
    export function cut(num: number) {
        return ~~num;
    }
    /**概率 0~1*/
    export function probability(n: number = 0.5) {
        return Math.random() <= n;
    }

    /**拷贝，默认深拷贝 */
    export function copy(source, isDeep = true) {
        if (!isDeep) return shallowCopy(source);
        map = new WeakMap();
        return deepCopy(source);
    }
    /**浅拷贝 */
    export function shallowCopy(source) {
        let dist;
        if (source instanceof Date) {
            dist = new Date(source);
        }
        else if (source instanceof RegExp) {
            // 拷贝正则表达式
            dist = new RegExp(source.source, source.flags);
        } else if (Array.isArray(source)) {
            dist = []
        } else if (isObject(source)) {
            dist = {}
        } else {
            return source
        }
        map.set(source, dist)
        for (let i in source) {
            dist[i] = source[i];
        }

        return dist;
    }
    let map = new WeakMap();
    /**深拷贝 */
    function deepCopy(source) {
        let dist;
        if (map.has(source)) {
            return map.get(source)
        } else if (source instanceof Date) {
            dist = new Date(source);
        }
        else if (source instanceof RegExp) {
            // console.log(source.source)
            // console.log(source.flags)
            // 拷贝正则表达式
            dist = new RegExp(source.source, source.flags);
        }
        else if (Array.isArray(source)) {
            dist = []
        } else if (isObject(source)) {
            dist = {}
        } else {
            return source
        }
        map.set(source, dist)
        for (let i in source) {
            if (source.hasOwnProperty(i)) {
                dist[i] = deepCopy(source[i])
            }
        }

        return dist;
    }
    function isObject(source) {
        if (typeof source === 'object' && source !== null) {
            return true
        }
        return false
    }

    /**浅拷贝复制数组 */
    export function copyArr<T>(arr: T[]) {
        let a: Array<T> = [];
        for (let i of arr) {
            a.push(i);
        }
        return a;
    }
}