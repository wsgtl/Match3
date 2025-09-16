import { Size, Node, UITransform, v3, log, Component, Constructor, Vec3, EventTouch, Vec2, sys, view, director, assetManager, BlockInputEvents, find, tween, v2, ScrollView, Layout, Sprite, Color, Layers, sp, Label, Button } from "cc";
import { UIOpacity } from "cc";
import { isVaild } from "./ViewUtil";

export namespace UIUtils {
    /**
     * UI node ，包含了 UIOpacity 和 UITransform 组件
     */
    export class UINode extends Node {
        private uiOpacity: UIOpacity = null;
        private uiTransform: UITransform = null;
        private _customTag: any = null;

        constructor(name?: string) {
            super(name);
            this.uiOpacity = this.addComponent(UIOpacity);
            this.uiTransform = this.addComponent(UITransform);
        }

        getTag<T>(key: string): null | T {
            if (this._customTag) {
                const tag = this._customTag[key];
                if (!tag) return null;
                return this._customTag[key] as T;
            }
            return null;
        }

        setTag(key: string, value: any | string) {
            if (!this._customTag) {
                this._customTag = {};
            }
            this._customTag[key] = value;
        }

        destroy() {
            this._customTag = {};
            return super.destroy();
        }
    }

    export enum PRIORITY {
        MIN = 0,
        MAX = 999,
    }

    export function getX(node: Node) {
        return node.position.x;
    }

    export function setX(node: Node, xPos: number) {
        const vec3Pos = node.position;
        node.setPosition(v3(xPos, vec3Pos.y, vec3Pos.z));
    }

    export function getY(node: Node) {
        return node.position.y;
    }

    export function setY(node: Node, yPos: number) {
        const vec3Pos = node.position;
        node.setPosition(v3(vec3Pos.x, yPos, vec3Pos.z));
    }

    export function getAnchorX(node: Node) {
        return needComponent(node, UITransform).anchorX;
    }

    export function getAnchorY(node: Node) {
        return needComponent(node, UITransform).anchorY;
    }

    export function setAnchorX(node: Node, newX: number) {
        needComponent(node, UITransform).anchorX = newX;
    }

    export function setAnchorY(node: Node, newY: number) {
        needComponent(node, UITransform).anchorY = newY;
    }

    export function getPriority(node: Node) {
        return needComponent(node, UITransform).priority;
    }

    export function setPriority(node: Node, priority: number) {
        if (!node.parent) {
            // throw new Error('没有父节点不能设置 priority');
            log(`发生错误，没有父节点不能设置 priority`);
        } else {
            needComponent(node, UITransform).priority = priority;
            // node.setSiblingIndex(priority);
        }

    }

    export function getWidth(node: Node) {
        return needComponent(node, UITransform).width;
    }

    export function setWidth(node: Node, width: number) {
        needComponent(node, UITransform).width = width;
    }

    export function getHeight(node: Node) {
        return needComponent(node, UITransform).height;
    }

    export function setHeight(node: Node, height: number) {
        needComponent(node, UITransform).height = height;
    }

    export function getContentSize(node: Node) {
        return needComponent(node, UITransform).contentSize;
    }

    export function setContentSize(node: Node, size: Size): void;
    export function setContentSize(node: Node, width: number, height: number): void;
    export function setContentSize(...args: any) {
        if (args.length === 2) {
            const node: Node = args[0];
            const size: Size = args[1];
            needComponent(node, UITransform).setContentSize(size);
        } else {
            const node: Node = args[0];
            const width: number = args[1];
            const height: number = args[2];
            needComponent(node, UITransform).setContentSize(width, height);
        }
    }
    /**通过调整宽高设置缩放 */
    export function setSizeScale(node: Node,sc:number){
        needComponent(node, UITransform).width *= sc;
        needComponent(node, UITransform).height *= sc;
    }

    /**
     * 设置透明度
     * @param node
     * @param alpha 0~1
     */
    export function setAlpha(node: Node, alpha: number) {
        if (!node) return;
        const c: UIOpacity = UIUtils.needComponent(node, UIOpacity);
        c.opacity = 255 * alpha;
    }

    export function needComponent<T extends Component>(node: Node, classConstructor: Constructor<T>): T | null {
        if (!node || !node.isValid) return null;
        let component = node.getComponent(classConstructor);
        if (!component)
            component = node.addComponent(classConstructor);
        return component;
    }

    export function toLocation(parent: Node, target: Vec3 | Node, child?: Node) {
        const wps = target instanceof Node ? target.getWorldPosition() : target;
        const location = needComponent(parent, UITransform).convertToNodeSpaceAR(wps);
        if (child)
            child.setPosition(location.x, location.y);
        return location;
    }

    export function toWorldSpace(node: Node, target: Vec3) {
        return needComponent(node, UITransform).convertToWorldSpaceAR(target);
    }
    /**获取触点在该节点坐标 */
    export function touchNodeLocation(node: Node, touchEvent: EventTouch) {
        const touchPos = new Vec3();
        const uiTrans = node.parent.getComponent(UITransform);
        const touchPosV2 = touchEvent.getUILocation();
        Vec3.set(touchPos, touchPosV2.x, touchPosV2.y, 0);
        return uiTrans.convertToNodeSpaceAR(touchPos);
    }
    /**获取触点在该节点坐标 */
    export function touchNodeChildLocation(node: Node, touchEvent: EventTouch) {
        const touchPos = new Vec3();
        const uiTrans = node.getComponent(UITransform);
        const touchPosV2 = touchEvent.getUILocation();
        Vec3.set(touchPos, touchPosV2.x, touchPosV2.y, 0);
        return uiTrans.convertToNodeSpaceAR(touchPos);
    }

    /**
     * 改变节点的位置,使他跟随触摸点的位置
     * @param node
     * @param touchEvent
     */
    export function nodeFollowsTheTouchPoint(node: Node, touchEvent: EventTouch) {
        node.position = touchNodeLocation(node, touchEvent);
    }

    /**
     * 先转成世界坐标，再将世界坐标转成节点局部坐标
     * @param otherNode
     * @param localNode
     * @returns
     */
    export function transformOtherNodePos2localNode(otherNode: Node, localNode: Node) {
        const otherNodeWorldPosition = otherNode.parent.getComponent(UITransform).convertToWorldSpaceAR(otherNode.position);
        // console.log('otherNodeWorldPosition:', otherNodeWorldPosition);
        const newPosition = localNode.parent.getComponent(UITransform).convertToNodeSpaceAR(otherNodeWorldPosition);
        // console.log('newPosition:', newPosition);
        return newPosition;
    }
    /**
     * 先转成世界坐标，再将世界坐标转成节点局部坐标
     * @param otherNode
     * @param localNode
     * @returns
     */
    export function transformOtherPos2localNode(pos: Vec3, parent:Node,localNode: Node) {
        const otherNodeWorldPosition = parent.getComponent(UITransform).convertToWorldSpaceAR(pos);
        // console.log('otherNodeWorldPosition:', otherNodeWorldPosition);
        const newPosition = localNode.parent.getComponent(UITransform).convertToNodeSpaceAR(otherNodeWorldPosition);
        // console.log('newPosition:', newPosition);
        return newPosition;
    }


    /**
     * 返回两点间的距离
     * @param arg1
     * @param agr2
     */
    export function dotPitch(arg1: Vec2 | Vec3 | Node, agr2: Vec2 | Vec3 | Node) {
        const p1 = arg1 instanceof Node ? arg1.position : arg1;
        const p2 = agr2 instanceof Node ? agr2.position : agr2;
        // const pow = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
        const pow = ((p1.x - p2.x) ** 2) + ((p1.y - p2.y) ** 2);
        return Math.abs(Math.sqrt(pow));
    }

    /**
     * 返回指定坐标点的指定角度上延长指定距离后的坐标点
     * @param arg1 指定坐标点
     * @param angle X轴夹角
     * @param extendDistance 延长距离
     */
    export function pointOf(arg1: Vec3 | Node, angle: number, extendDistance: number): Vec3 {
        const point = arg1 instanceof Node ? arg1.position : arg1;
        // 顺时针角度为正，逆时针角度为负
        // 换算过程中先将角度转为弧度
        const radian: number = angle * Math.PI / 180;
        const xMargin: number = Math.cos(radian) * extendDistance;
        const yMargin: number = Math.sin(radian) * extendDistance;
        return new Vec3(point.x + xMargin, point.y + yMargin);
    }

    /**
     * 返回两点间的中间点
     * @param arg1
     * @param agr2
     */
    export function midpoint(arg1: Vec2 | Vec3 | Node, agr2: Vec2 | Vec3 | Node) {
        const p1 = arg1 instanceof Node ? arg1.position : arg1;
        const p2 = agr2 instanceof Node ? agr2.position : agr2;
        return v3((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
    }


    /**
     * 返回两点间与x轴的夹角
     * @param arg1
     * @param agr2
     * @param originAngle
     */
    export function theta(arg1: Vec2 | Vec3 | Node, agr2: Vec2 | Vec3 | Node, originAngle: number = 180) {
        const p1 = arg1 instanceof Node ? arg1.position : arg1;
        const p2 = agr2 instanceof Node ? agr2.position : agr2;
        return Math.atan2((p1.y - p2.y), (p1.x - p2.x)) * (originAngle / Math.PI);
    }

    /**
     * 指定ABC三点 返回∠BAC的角度,即AB和BC的夹角
     *
     * @param arg1
     * @param agr2
     * @param agr3
     */
    export function angle(arg1: Vec2 | Vec3 | Node, agr2: Vec2 | Vec3 | Node, agr3: Vec2 | Vec3 | Node) {
        const A = arg1 instanceof Node ? arg1.position : arg1;
        const B = agr2 instanceof Node ? agr2.position : agr2;
        const C = agr3 instanceof Node ? agr3.position : agr3;

        const AB = Math.sqrt(Math.pow(A.x - B.x, 2) + Math.pow(A.y - B.y, 2));
        const AC = Math.sqrt(Math.pow(A.x - C.x, 2) + Math.pow(A.y - C.y, 2));
        const BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
        const cosA = (Math.pow(AB, 2) + Math.pow(AC, 2) - Math.pow(BC, 2)) / (2 * AB * AC);
        return Math.round(Math.acos(cosA) * 180 / Math.PI);
    }


    /**
     * 指定ABC三点 返回三角形面积
     * @param arg1
     * @param agr2
     * @param agr3
     * @private
     */
    export function areaOfTriangle(arg1: Vec2 | Vec3 | Node, agr2: Vec2 | Vec3 | Node, agr3: Vec2 | Vec3 | Node) {
        const p1 = arg1 instanceof Node ? arg1.position : arg1;
        const p2 = agr2 instanceof Node ? agr2.position : agr2;
        const p3 = agr3 instanceof Node ? agr3.position : agr3;
        return Math.abs(0.5 * (p1.x * p2.y + p2.x * p3.y + p3.x * p1.y - p2.x * p1.y - p3.x * p2.y - p1.x * p3.y));
    }

    /**
     * 指定ABC三点 返回A点到BC的高度
     * @param A
     * @param B
     * @param C
     * @private
     */
    export function heightOfTriangle(A: Vec2 | Vec3 | Node, B: Vec2 | Vec3 | Node, C: Vec2 | Vec3 | Node) {
        const area = areaOfTriangle(A, B, C);
        const bottom = UIUtils.dotPitch(B, C);
        return bottom > 0 ? area * 2 / bottom : 0;
    }


    /**
     * 安全区域顶部与屏幕的距离
     * @returns
     */
    export function topSafeAreaPadding(): number {
        const safeArea = sys.getSafeAreaRect();
        const screenSize = view.getVisibleSize();
        return screenSize.height - safeArea.y - safeArea.height;
    }

    /**
     * 安全区域底部与屏幕的距离
     * @returns
     */
    export function bottomSafeAreaPadding(): number {
        const safeArea = sys.getSafeAreaRect();
        return safeArea.y;
    }

    /**
     * 节点距离屏幕的左右边距适配
     * @returns
     */
    export function horizontalSafePadding(): number {
        const screenSize = view.getVisibleSize();
        const canvas = view.getCanvasSize();
        return Math.abs((screenSize.width - canvas.width) / 2) + 20;
    }

    export function loadSceneName(nodePath: string) {
        const scene = director.getScene();
        if (scene) {
            const main = assetManager.getBundle('main');
            const path: any = main?.getAssetInfo(scene.uuid);
            if (path && path.url) {
                return path.url.replace('db://assets/scenes/', '').replace('.scene', '');
            }
        }
        if (nodePath) {
            const f = nodePath.indexOf('/');
            if (f > 0) return nodePath.substr(0, f);
        }

        return nodePath;
    }

    /**
     * 绑定一个存在连续点击间隔的点击事件
     * @param node 需要绑定点击时间的节点
     * @param fun 点击事件回调方法
     * @param interval 点击间隔时间 单位s 默认为1s
     * @param target 回调方法的作用域
     * @param useCapture 是否派发事件前的捕获阶段触发
     */
    export function onClick(node: Node, fun: Function, interval = 1, target?: unknown, useCapture?: any) {
        node.on(Node.EventType.TOUCH_END, (evt: any) => {
            if (target)
                fun.call(target, evt);
            else
                fun(evt);
            if (interval > 0) {
                const clickMask = new Node();
                UIUtils.setContentSize(clickMask, UIUtils.getContentSize(node));
                clickMask.addComponent(BlockInputEvents);
                const wp = node.getWorldPosition();
                const canvas = find('Canvas');
                const lp = UIUtils.toLocation(canvas, wp);
                clickMask.setPosition(lp);
                canvas.addChild(clickMask);
                tween(v2()).delay(interval).call(() => {
                    if (clickMask && clickMask.isValid) {
                        clickMask.destroy();
                    }
                }).start();
            }
        }, null, useCapture);
    }

    /**
     * 获取屏幕可见Cells
     * @param scrollView 
     */
    export function getVisibleCells(scrollView: ScrollView, itemSize: Size = null) {
        let realItemSize = itemSize;
        if (realItemSize === null) {
            const itemNode = scrollView?.content?.children[0];
            if (!itemNode)
                return null;
            realItemSize = itemNode.getComponent(UITransform).contentSize;
        }
        const viewSize = scrollView.getComponent(UITransform).contentSize;
        const curScrollOffsetY = scrollView.getScrollOffset().y;
        const layout = scrollView.content.getComponent(Layout);
        const topSpacingY = layout.paddingTop;
        const spacingY = layout.spacingY;

        // 单个item+间距高度
        const tempItemH = realItemSize.height + spacingY;
        // 一屏能显示的cell个数
        const maxItemCount = Math.ceil((viewSize.height - topSpacingY) / tempItemH);
        // 滑动后移出屏幕的item个数
        const disappearCount = Math.ceil(curScrollOffsetY / tempItemH);
        const cells = scrollView.content.children.slice(disappearCount, disappearCount + maxItemCount - 1);
        return cells;
    }

    /**设置颜色滤镜 */
    export function setColor(node: Node, c: string) {
        const sprite = node?.getComponent(Sprite);
        if (isVaild(sprite))
            sprite.color = new Color().fromHEX(c);
    }
    /**生成2d带有sprite的node */
    export function createSprite() {
        const node = new Node();
        node.addComponent(Sprite);
        node.layer = Layers.Enum.UI_2D;
        return node;
    }
    /**生成2d带有sp.skeleton的node */
    export function createSk() {
        const node = new Node();
        const sk = node.addComponent(sp.Skeleton);
        sk.premultipliedAlpha = false;
        node.layer = Layers.Enum.UI_2D;
        return node;
    }

    /**设置label,并判断改对象有效性 */
    export function setLabel(node: Node, str: string) {
        const a = node.getComponent(Label);
        if (isVaild(a)) a.string = str;
    }
    /**设置active是否显示,并判断改对象有效性 */
    export function setActive(node: Node, v: boolean) {
        if (isVaild(node)) node.active = v;
    }
    /**设置点击事件参数,并判断改对象有效性 */
    export function setClickData(node: Node, data: string) {
        const a = node?.getComponent(Button)?.clickEvents[0];
        if (a) a.customEventData = data;
    }
    /**切换父节点，位置不变 */
    export function changeParent(n:Node,parent:Node){
        if(isVaild(n)&&isVaild(parent)){
            const p = UIUtils.transformOtherNodePos2localNode(n, parent);
            n.position = p;
            parent.addChild(n);
        }
    }

    /**设置按钮变灰，且不可点击 */
    export function setBtnGray(node:Node,gray:boolean,canClick:boolean){
        setGray(node,gray);
        node.children.forEach(v=>setGray(v,gray));
        const btn = node.getComponent(Button);
        if(btn)
            btn.interactable = canClick;
    }
    function setGray(node:Node,gray:boolean){
        const sp =node.getComponent(Sprite);
        if(sp)
            sp.grayscale = gray;
    }
}