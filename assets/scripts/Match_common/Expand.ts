//拓展方法属性

import { Vec2 } from "cc";
import { Vec3, Node } from "cc";

// import { Node } from 'cc';
declare global {
    //拓展数组
    interface Array<T> {
        /**获取数组内随机成员 */
        getRandomItem(): T;
        /**获取数组内随机几个成员 */
        getRandomItems(n: number): T[];
        /**获取数组内随机下标 */
        getRandomIndex(): number;
        /**打乱数组
         * @param num 打乱次数，越多越乱
         */
        shuffle(num?: number): Array<T>;
        /**最后一个成员 */
        get last(): T;
    }

}


if (!Array.prototype.hasOwnProperty("getRandomItem")) {
    Object.defineProperty(Array.prototype, "getRandomItem", {
        value: function () {
            let randomIndex = this.getRandomIndex();
            if (randomIndex != -1) {
                return this[randomIndex];
            } else {
                return null;
            }
        },
        enumerable: false,//设置为不可枚举，避免被for...in 循环遍历到
        writable: true,//属性的值可以被改写
        configurable: true//该属性也能从对应的对象上被删除
    })
}
if (!Array.prototype.hasOwnProperty("getRandomItems")) {
    Object.defineProperty(Array.prototype, "getRandomItems", {
        value: function (n: number) {
            if (n >= this.length) return [...this];

            let len = this.length;
            const result = [];
            if (n > len / 2) {//n比较大时，前缀洗牌算法
                const a = [];
                for (let i = 0; i < len; i++)a.push(i);
                for (let i = 0; i < n; i++) {
                    const r = Math.floor(Math.random() * len);
                    const p = a[r];
                    a[r] = a[i];
                    a[i] = p;
                }
                for (let i = 0; i < n; i++) {
                    result.push(this[a[i]]);
                }
            } else {//拒绝采样算法
                const a: Set<number> = new Set();
                while (a.size < n) {
                    a.add(Math.floor(Math.random() * len));
                }
                a.forEach(v => {
                    result.push(this[v]);
                })
            }



            return result;
        }
    })
}


if (!Array.prototype.hasOwnProperty("getRandomIndex")) {
    Object.defineProperty(Array.prototype, "getRandomIndex", {
        value: function () {
            let len = this.length;
            if (len > 0) {
                return Math.floor(Math.random() * (len - 0.000001));
            } else {
                return -1;
            }
        }
    })
}

if (!Array.prototype.hasOwnProperty("shuffle")) {
    Object.defineProperty(Array.prototype, "shuffle", {
        value: function (num: number) {
            if (!num) num = 1;
            for (let i = 0; i < num; i++) {
                for (let j = 0; j < this.length; j++) {
                    const r = this.getRandomIndex();
                    const temp = this[i];
                    this[i] = this[r];
                    this[r] = temp;
                }
            }
            return this;
        }
    })
}
if (!Array.prototype.hasOwnProperty("last")) {
    Object.defineProperty(Array.prototype, "last", {
        get() {
            return this[this.length - 1];
        }
    })
}


declare module 'cc' {
    //拓展node
    interface Node {
        set x(x: number);
        get x(): number;

        set y(y: number);
        get y(): number;

        set z(z: number);
        get z(): number;

        set pos2(p: Vec2);
        get pos2();
    }

}
if (!Node.prototype.hasOwnProperty("x")) {
    Object.defineProperty(Node.prototype, "x", {
        get() {
            return this.position.x;
        },
        set(x: number) {
            const p = this.position;
            this.position = new Vec3(x, p.y, p.z);
        }
    })
}
if (!Node.prototype.hasOwnProperty("y")) {
    Object.defineProperty(Node.prototype, "y", {
        get() {
            return this.position.y;
        },
        set(y: number) {
            const p = this.position;
            this.position = new Vec3(p.x, y, p.z);
        }
    })
}
if (!Node.prototype.hasOwnProperty("z")) {
    Object.defineProperty(Node.prototype, "z", {
        get() {
            return this.position.z;
        },
        set(z: number) {
            const p = this.position;
            this.position = new Vec3(p.x, p.y, z);
        }
    })
}
if (!Node.prototype.hasOwnProperty("pos2")) {
    Object.defineProperty(Node.prototype, "pos2", {
        get() {
            return new Vec2(this.position.x, this.position.y);
        },
        set(pos: Vec2) {
            if (pos) {
                const p = this.position;
                this.position = new Vec3(pos.x, pos.y, p.z);
            }
        }
    })
}
export { };