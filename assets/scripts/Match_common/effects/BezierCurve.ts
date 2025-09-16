import { v2, Vec2, Vec3, Node } from 'cc';
import { UIUtils } from '../utils/UIUtils';

export default class BezierCurve {
    private readonly control: Vec2;
    private readonly start: Vec2;
    private readonly end: Vec2;
    private readonly A: number;
    private readonly B: number;
    private readonly C: number;
    private length: number = -1;

    constructor(start: Vec2 | Vec3, end: Vec2 | Vec3, control: Vec2 | Vec3) {
        this.start = v2(start.x, start.y);
        this.end = v2(end.x, end.y);
        this.control = v2(control.x, control.y);
        // 直接计算好多项式，留后用
        const ax = this.start.x - 2 * this.control.x + this.end.x;
        const ay = this.start.y - 2 * this.control.y + this.end.y;
        const bx = 2 * this.control.x - 2 * this.start.x;
        const by = 2 * this.control.y - 2 * this.start.y;
        this.A = 4 * (ax * ax + ay * ay);
        this.B = 4 * (ax * bx + ay * by);
        this.C = bx * bx + by * by;
    }

    /**
     * 获得贝塞尔曲线上的点
     * B(t) = (1 - t)^2 * P0 + 2t * (1 - t) * P1 + t^2 * P2, t ∈ [0,1]
     * @param t  曲线长度比例
     */
    public getPoint(t: number): Vec2 {
        const temp = 1 - t;
        return new Vec2(
            temp * temp * this.start.x + 2 * t * temp * this.control.x + t * t * this.end.x,
            temp * temp * this.start.y + 2 * t * temp * this.control.y + t * t * this.end.y,
        );
    }

    /**
     * 获得贝塞尔曲线上的点
     * B(t) = (1 - t)^2 * P0 + 2t * (1 - t) * P1 + t^2 * P2, t ∈ [0,1]
     * @param t  曲线长度比例
     */
    public getPointToNode(t: number, node: Node) {
        const temp = 1 - t;
        const x = temp * temp * this.start.x + 2 * t * temp * this.control.x + t * t * this.end.x;
        const y = temp * temp * this.start.y + 2 * t * temp * this.control.y + t * t * this.end.y;
        node.setPosition(x, y);
    }

    /**
     * 获得匀速运动时贝塞尔曲线上的点
     * @param dt 曲线运动时长比例
     */
    public getUniformPoint(dt: number) {
        return this.getPoint(this.invertL(dt, this.getLength()));
    }

    /**
     * 曲线长度
     * @param t 曲线长度比例，默认为1
     */
    public getLength(t: number = 1): number {
        if (t === 1 && this.length > 0)
            return this.length;
        if (this.start.x === this.end.x && this.start.x === this.control.x || this.start.y === this.end.y && this.start.y === this.control.y) {
            if (t === 1)
                this.length = UIUtils.dotPitch(this.start, this.end);
            return this.length * t;
        }
        const temp1 = Math.sqrt(this.C + t * (this.B + this.A * t));
        const temp2 = (2 * this.A * t * temp1 + this.B * (temp1 - Math.sqrt(this.C)));
        const temp3 = Math.log(this.B + 2 * Math.sqrt(this.A) * Math.sqrt(this.C));
        const temp4 = Math.log(this.B + 2 * this.A * t + 2 * Math.sqrt(this.A) * temp1);
        const temp5 = 2 * Math.sqrt(this.A) * temp2;
        const temp6 = (this.B * this.B - 4 * this.A * this.C) * (temp3 - temp4);
        const length = (temp5 + temp6) / (8 * this.A ** 1.5);
        if (t === 1)
            this.length = length;
        if (Number.isNaN(length)) {
            this.length = UIUtils.dotPitch(this.start, this.end);
        }
        return length;
    }

    /**
     * 根据反函数求得对应的t值
     * @param t
     * @param l
     */
    public invertL(t: number, l: number) {
        let t1 = t;
        let t2;
        do {
            t2 = t1 - (this.getLength(t1) - l) / this.s(t1);
            if (Math.abs(t1 - t2) < 0.000001)
                break;
            t1 = t2;
        } while (true) ;
        return t2;
    }

    private s(t: number) {
        return Math.sqrt(this.A * t * t + this.B * t + this.C);
    }


}
