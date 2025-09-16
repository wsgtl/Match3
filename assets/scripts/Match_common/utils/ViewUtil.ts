import { CCObject, Component, Node, v3 } from 'cc';

/**
 *
 * 判断cc对象的有效性
 */
export function isVaild(...ccObjects: CCObject[]) {
    if (ccObjects && ccObjects.length) {
        for (let i = 0; i < ccObjects.length; i++) {
            const obj = ccObjects[i];
            if (!obj || !obj.isValid)
                return false;
            if (obj instanceof Component && (!obj.node || !obj.isValid))
                return false;
        }
    }
    return true;
}

export function destroyAllChildren(node: Node) {
    node?.children?.forEach(item => isVaild(item) && item.destroy());
}

export function destroyNode(node: Node) {
    if (node && node.isValid) {
        node.destroy();
    }
}


export function associate(src: Node, target: Node) {
    if (src && src.isValid && target && target.isValid) {
        const callback = (type: any) => {
            if (!type) return;
            if (type === Node.TransformBit.POSITION) {
                if (src && src.isValid) {
                    src.setPosition(v3(target.position));
                }
            } else if (type === Node.TransformBit.SCALE) {
                if (src && src.isValid) {
                    src.setScale(v3(target.scale));
                }
            }
        };
        target.on(Node.EventType.TRANSFORM_CHANGED, callback);
        target.on(Node.EventType.NODE_DESTROYED, () => {
            target.off(Node.EventType.TRANSFORM_CHANGED, callback);
            if (src && src.isValid) {
                src.destroy();
            }
        });
    }
}