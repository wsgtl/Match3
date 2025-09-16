import { AssetManager, Component, Prefab, resources, sp, Node, SpriteFrame, SpriteAtlas, Sprite, math, assetManager, Asset, ImageAsset, Texture2D, RenderTexture, sys } from 'cc';
// import { CacheManager } from '../localStorage/CacheManager';
import { AssetReference, assets, Props } from './Recycler';

export namespace prefabs {

    export function load(src: string, bundle: AssetManager.Bundle = resources) {
        return assets.load(src, Prefab, bundle);
    }

    export function instantiate(src: string | Prefab, bundle: AssetManager.Bundle = resources, release: boolean = false) {
        let ref: AssetReference<Prefab>;
        if (typeof src === 'string') {
            ref = assets.load(src, Prefab, bundle);
        } else
            ref = assets.use(src, Prefab, bundle);
        return ref.instantiate(release);
    }

}

function toComponent<T extends Component>(target: Node | T) {
    if (target instanceof Node) {
        let component = target.getComponent(sp.Skeleton);
        if (!component)
            component = target.addComponent(sp.Skeleton);
        return component;
    }
    return target;
}

export namespace skeletons {

    export function load(path: string, bundle: AssetManager.Bundle = resources) {
        return assets.load(path, sp.SkeletonData, bundle);
    }

    /**
     * 将贴图数据设置到指定目标
     * @param target 目标节点或组件，如果是节点，默认使用Spirte组件
     * @param src 贴图路径或者引用对象
     * @param arg3
     * @param arg4
     */
    export async function setTo(target: Node | Component, src: string | AssetReference<sp.SkeletonData> | sp.SkeletonData, arg3: AssetManager.Bundle | boolean = resources, arg4: boolean = false) {
        if (!target || !target.isValid) return null;
        const com = toComponent(target);
        let ref;
        let bundle;
        let release;
        if (arg3 instanceof AssetManager.Bundle) {
            bundle = arg3;
            release = arg4;
        } else {
            bundle = resources;
            release = arg3;
        }
        if (!src) {
            assets.nilTo(com, Props.skeletonData, release);
            return null;
        } else if (typeof src === 'string') {
            ref = assets.skeleton(src, bundle);
        } else if (src instanceof sp.SkeletonData) {
            ref = assets.use(src, sp.SkeletonData, bundle);
        } else
            ref = src;
        return ref.untilSetTo(com, Props.skeletonData, release);
    }

    function toComponent<T extends Component>(target: Node | T) {
        if (target instanceof Node) {
            let component = target.getComponent(sp.Skeleton);
            if (!component)
                component = target.addComponent(sp.Skeleton);
            return component;
        }
        return target;
    }
}

export namespace sprites {
    function toComponent<T extends Component>(target: Node | T) {
        if (target instanceof Node) {
            let component = target.getComponent(Sprite);
            if (!component)
                component = target.addComponent(Sprite);
            return component;
        }
        return target;
    }

    /**
     * 将贴图数据设置到指定目标
     * @param target 目标节点或组件，如果是节点，默认使用Spirte组件
     * @param src 贴图路径或者引用对象
     * @param arg3
     * @param arg4
     */
    export async function setTo(target: Node | Component, src: string | AssetReference<SpriteFrame> | SpriteFrame,
        arg3: AssetManager.Bundle | boolean = resources, arg4: boolean = false) {
        if (!target || !target.isValid)
            return null;
        const com = toComponent(target);
        let ref;
        let bundle;
        let release;
        if (arg3 instanceof AssetManager.Bundle) {
            bundle = arg3;
            release = arg4;
        } else {
            bundle = resources;
            release = arg3;
        }
        if (!src) {
            assets.nilTo(com, Props.spriteFrame, release);
            return null;
        }
        if (typeof src === 'string') {
            ref = assets.spriteFrame(src, bundle);
        } else if (src instanceof SpriteFrame) {
            if (!src || !src.isValid) {
                throw Error('资源错误');
            }
            ref = assets.use(src, SpriteFrame, bundle);
        } else
            ref = src;
        return ref.untilSetTo(com, Props.spriteFrame, release);
    }

    /**
     * 将合图的贴图数据设置到指定目标
     * @param target 目标节点或组件，如果是节点，默认使用Spirte组件
     * @param src 合图路径或者引用对象
     * @param key 贴图在合图中的名称
     * @param arg3
     * @param arg4
     */
    export function setToFromAtlas(target: Node | Component, src: string | AssetReference<SpriteAtlas>, key: string,
        arg3: AssetManager.Bundle | boolean = resources, arg4: boolean = false) {
        if (!target || !target.isValid)
            return;
        const com = toComponent(target);
        let bundle;
        let release;
        if (arg3 instanceof AssetManager.Bundle) {
            bundle = arg3;
            release = arg4;
        } else {
            bundle = resources;
            release = arg3;
        }
        const ref = typeof src === 'string' ? assets.spriteFrame(key, src, bundle) : assets.spriteFrame(key, src);
        return ref.untilSetTo(com, Props.spriteFrame, release);
    }

    /**
     * 获取指定图集资源引用
     * @param path 图集资源路径
     * @param bundle
     */
    export function atlas(path: string, bundle: AssetManager.Bundle = resources) {
        return assets.spriteAtlas(path, bundle);
    }

    /**
     *
     * @param atlas
     * @param bundle
     * @param predicate
     */
    export function atlasFrames(atlas: SpriteAtlas, bundle: AssetManager.Bundle = resources, predicate?: (value: SpriteFrame, index: number, array: SpriteFrame[]) => unknown) {
        let frames;
        if (predicate)
            frames = atlas.getSpriteFrames().filter(predicate);
        else
            frames = atlas.getSpriteFrames();
        let refs = [];
        for (let sf of frames) {
            if (sf.name)
                refs.push(assets.spriteFrame(sf.name, atlas, bundle));
            else {
                refs.push(assets.use(sf, SpriteFrame, bundle));
            }
        }
        return refs;
    }


    /**
     * 清除目标节点的贴图引用
     * @param target 目标节点或组件，如果是节点，默认使用Spirte组件
     * @param release 是否在清除后立即释放
     */
    export function clean(target: Node | Component, release: boolean = false) {
        if (!target || !target.isValid) return;
        const com = toComponent(target);
        assets.nilTo(com, Props.spriteFrame, release);
    }

    export function color(target: Node | Sprite, r: number | string, g?: number, b?: number, a: number = 255) {
        if (!target || !target.isValid) return;
        const component = toComponent(target);
        component.type = Sprite.Type.SIMPLE;
        component.color = typeof r === 'string' ? new math.Color(r) : new math.Color(r, g, b, a);
        component.sizeMode = Sprite.SizeMode.CUSTOM;
        sprites.setTo(component, `textures/normal/common/default_sprite_splash/spriteFrame`);
    }

    /**
     * 设置远程图片资源
     * @param target 
     * @param url 
     */
    export function setRemote(target: Node | Sprite, url: string, useCache: boolean = false) {
        // if (sys.isNative && useCache) {
        //     CacheManager.loadRemote(url, (sf: SpriteFrame) => {
        //         if (sf && target?.isValid) {
        //             toComponent(target).spriteFrame = sf;
        //         }
        //     });
        // } else {
            assetManager.loadRemote<ImageAsset>(url, { ext: ".jpg" }, (err, imageAsset) => {
                if (!err && target?.isValid) {
                    const com = toComponent(target);
                    const spriteFrame = new SpriteFrame();
                    const texture = new Texture2D();
                    texture.image = imageAsset;
                    spriteFrame.texture = texture;
                    com.spriteFrame = spriteFrame;
                }
            });
        // }
    }
}
