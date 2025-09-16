import { __private, Asset, AssetManager, assetManager, Component, director, instantiate, Material, Node, Prefab, resources, sp, SpriteAtlas, SpriteFrame } from 'cc';
import Debugger from '../Debugger';
import PrefabRecycler from './PrefabRecycler';

const logger = Debugger('RecordMemory');

export enum Props {
    spriteFrame = 'spriteFrame',
    skeletonData = 'skeletonData',
    spriteAtlas = 'spriteAtlas',
    selectedSpriteFrame = 'selectedSpriteFrame',
    unselectedSpriteFrame = 'unselectedSpriteFrame',
    material = 'material',
    customMaterial = 'customMaterial',
    prefab = 'prefab'
}

/**
 * 资源引用管理器
 * 单例对象 懒加载
 * 对所有非编辑器面板指定的资源进行加载与引用计数和释放管理
 */
export class AssetReferenceManager {
    assetReferences: Map<string, AssetReference<any>>;
    assetConsumeds: Map<Node, Set<ReleaseTarget>>;

    private static _instance: AssetReferenceManager;

    public static instance() {
        if (!AssetReferenceManager._instance)
            AssetReferenceManager._instance = new AssetReferenceManager();
        return AssetReferenceManager._instance;
    }

    private constructor() {
        this.assetReferences = new Map<string, AssetReference<any>>();
        this.assetConsumeds = new Map<Node, Set<ReleaseTarget>>();
    }

    public clear() {
        this.assetConsumeds.clear();
        this.assetReferences.clear();
    }

    /**
     * 加载指定路径下的资源
     * 用于替代 resources.load方法
     * @param path 资源路径
     * @param type 资源类型
     * @param bundle 资源所属的bundle
     */
    load<T extends Asset>(path: string, type: __private._cocos_core_asset_manager_shared__AssetType<T>, bundle: AssetManager.Bundle): AssetReference<T> {
        const key = `${path}_${bundle.name}`;
        let refAsset = this.assetReferences.get(key);
        if (!refAsset || !refAsset.isValid) {
            const loader = new BundleLoader(path, type, bundle);
            refAsset = new AssetReference(loader);
            this.assetReferences.set(key, refAsset);
        }
        return refAsset;
    }

    /**
     * 直接使用通过指定的AssetLoader所加载的资源引用对象
     * @param loader
     */
    use<T extends Asset>(loader: BaseLoader<T>): AssetReference<T>
    /**
     * 直接使用指定的已经加载的资源
     * @param asset
     * @param type
     * @param bundle
     */
    use<T extends Asset>(asset: T, type: __private._cocos_core_asset_manager_shared__AssetType, bundle: AssetManager.Bundle): AssetReference<T>
    use<T extends Asset>(arg1: T | BaseLoader<T>, type?: __private._cocos_core_asset_manager_shared__AssetType, bundle?: AssetManager.Bundle): AssetReference<T> {
        if (!arg1) return null;
        let loader;
        if (arg1 instanceof Asset)
            loader = new AssetLoader(arg1, type, bundle);
        else
            loader = arg1;
        const key = loader.key();
        let refAsset;
        if (!this.assetReferences.has(key)) {
            refAsset = new AssetReference(loader);
            if (!refAsset.isStatic)
                this.assetReferences.set(key, refAsset);
        } else {
            refAsset = this.assetReferences.get(key);
        }
        return refAsset;
    }

    /**
     * 获取指定贴图资源引用
     * @param path 贴图资源路径
     * @param bundle
     */
    spriteFrame(path: string, bundle: AssetManager.Bundle): AssetReference<SpriteFrame>
    /**
     * 通过图集获取指定贴图资源引用
     * @param name 贴图资源名称
     * @param atlasPath 图集路径
     * @param bundle
     */
    spriteFrame(name: string, atlasPath: string, bundle?: AssetManager.Bundle): AssetReference<SpriteFrame>
    /**
     * 通过图集获取指定贴图资源引用
     * @param name 贴图资源名称
     * @param atlasRef 图集资源引用
     */
    spriteFrame(name: string, atlasRef: AssetReference<SpriteAtlas>): AssetReference<SpriteFrame>
    /**
     * 通过图集获取指定贴图资源引用
     * @param name 贴图资源名称
     * @param atlas 图集资源
     * @param bundle
     */
    spriteFrame(name: string, atlas: SpriteAtlas, bundle?: AssetManager.Bundle): AssetReference<SpriteFrame>
    spriteFrame(arg1: string, arg2: SpriteAtlas | AssetReference<SpriteAtlas> | string | AssetManager.Bundle, bundle?: AssetManager.Bundle): AssetReference<SpriteFrame> {
        if (arg2 instanceof AssetManager.Bundle) {
            let path = arg1;
            const pos = path.lastIndexOf('/');
            if (pos === path.length) {
                path = path.substring(0, path.length - 1);
            }
            if (path.substring(path.length - '/spriteFrame'.length, path.length) !== '/spriteFrame') {
                path += '/spriteFrame';
            }
            return this.load(path, SpriteFrame, arg2);// 直接加载纹理
        } // 从图集中取纹理
        if (typeof arg2 === 'string') // 加载图集
            return this.use(new SpriteFrameFromAtlasRefLoader(this.spriteAtlas(arg2, bundle), arg1, bundle));
        if (arg2 instanceof SpriteAtlas) // 指定的图集
            return this.use(new SpriteFrameFromAtlasLoader(arg2, arg1, bundle));
        return this.use(new SpriteFrameFromAtlasRefLoader(arg2 as AssetReference<SpriteAtlas>, arg1, arg2.bundle));

    }

    /**
     * 获取指定图集资源引用
     * @param path 图集资源路径
     * @param bundle
     */
    spriteAtlas(path: string, bundle: AssetManager.Bundle) {
        return this.load(path, SpriteAtlas, bundle);
    }


    /**
     * 骨骼数据
     * @param path 骨骼资源路径
     * @param bundle
     */
    skeleton(path: string, bundle: AssetManager.Bundle) {
        return this.load(path, sp.SkeletonData, bundle);
    }

    /**
     * 将资源赋值到组件属性中，增加资源引用数，并减少组件属性的原持有资源的引用数
     * 不建议自行调用该方法
     * @param ref
     * @param component
     * @param prop 属性名
     * @param release 是否直接释放对应属性原持有的资源
     */
    async setTo(ref: AssetReference<Asset>, component: Component, prop: Props | string = 'spriteFrame', release: boolean = false) {
        const sceneName = this.getSceneName();
        if (sceneName)
            ref.referencedScene.add(sceneName);
        const asset = await ref.take();
        const arg: Component | any = component;
        if (!arg || !arg.isValid)
            return;

        if (!asset) {
            logger.error(`[${ref.key}] 加载为空`);
            this.nilTo(arg, prop, release);
            return;
        }
        if (!asset.isValid) {
            throw Error(`[${ref.key}] 资源加载出错`);
        }

        const old: Asset = arg[prop];

        try {
            if (old && old.isValid && old._uuid !== asset._uuid) // 当设置的资源不同时，才增加计数
                asset.addRef();
            arg[prop] = asset;
        } catch (e) {
            throw Error(`[${ref.key}] 资源加载出错`);
        }
        if (old && old._uuid !== asset._uuid)
            this.decRef(old, release);
        // 下方逻辑无论是否重复赋值，都应检查绑定
        const node: Node = arg.node;
        if (!node) {
            throw Error('节点未添加 无法进入正常回收流程');
        }
        let releaseTargets = this.assetConsumeds.get(node);
        const releaseTarget: ReleaseTarget = { component: arg, prop, release };
        if (!releaseTargets) {// 说明该节点未绑定过回收事件，或者曾经绑定的事件已经被回收
            releaseTargets = new Set<ReleaseTarget>();
            this.assetConsumeds.set(node, releaseTargets);
            node.once(Node.EventType.NODE_DESTROYED, () => {
                const components = this.assetConsumeds.get(node);
                if (!components)
                    return;
                components.forEach((destroyer) => {
                    this.nilTo(destroyer.component, destroyer.prop, destroyer.release);
                });
                this.assetConsumeds.delete(node);
            });
        }
        let has = false;
        releaseTargets.forEach((target) => {
            if (!has && target.component === releaseTarget.component && target.prop === releaseTarget.prop && target.release === releaseTarget.release) {
                has = true;
            }
        });
        if (!has)
            releaseTargets.add(releaseTarget);
    }

    /**
     * 减少组件属性的原持有资源的引用
     * @param component 组件
     * @param prop 属性名
     * @param release 是否直接释放对应属性原持有的资源
     */
    nilTo(component: Component | any, prop: Props | string = Props.spriteFrame, release: boolean = false) {
        if (!component) return;
        if (component.isValid) {
            const old: Asset = component[prop];
            component[prop] = null;
            this.decRef(old, release);
        } else
            component[prop] = null;

        const node: Node = component.node;
        if (!node) return;
        const releaseTargets = this.assetConsumeds.get(node);
        if (releaseTargets) {
            releaseTargets.forEach((target) => {
                if (target.component === component && target.prop === prop && target.release === release) {
                    releaseTargets.delete(target);
                }
            });
        }
    }

    material(path: string, bundle: AssetManager.Bundle) {
        return this.load(path, Material, bundle);
    }

    prefab(path: string, bundle: AssetManager.Bundle = resources) {
        return this.load(path, Prefab, bundle);
    }

    async instantiate(ref: AssetReference<Asset>, release: boolean = false): Promise<Node> {
        return ref.take().then((prefab) => {
            if (prefab && prefab.isValid) {
                const instance = instantiate(prefab as Prefab);

                let prefabRecycler = instance.getComponent(PrefabRecycler);
                if (!prefabRecycler)
                    prefabRecycler = instance.addComponent(PrefabRecycler);

                ref.setTo(prefabRecycler, Props.prefab, release);
                return instance;
            }
            logger.error('预制件初始化失败：', ref.path);
            return new Node();
        });
    }

    /**
     * 打印未释放资源的日志
     */
    unrelease() {
        const map = new Map<string, AssetReference<Asset>>();
        this.assetReferences.forEach((targets, key) => {
            const uuid = targets.asset?._uuid;
            if (uuid) {
                map.set(uuid, targets);
            }
        });
        assetManager.assets.forEach((cacheAsset) => {
            const assetRef = map.get(cacheAsset._uuid);
            if (assetRef) {
                if (!assetRef.isStatic)
                    logger.log(`[${assetRef.key}] refCount: ${cacheAsset.refCount}`, assetRef.referencedScene);
            } else {
                const path = this.getPathByUUID(cacheAsset._uuid);
                if (path) {
                    const key = path + `_` + cacheAsset.constructor.name;
                    logger.warn(`[${key}] refCount: ${cacheAsset.refCount}`);
                }
            }
        });
    }

    references(filter?: string) {
        this.assetReferences.forEach((targets, key) => {
            if (!filter || key.indexOf(filter) >= 0)
                logger.log(`[${key}]`, targets.referencedScene);
        });
        // const statics: Asset[] = [];
        assetManager.assets.forEach((cacheAsset) => {
            const path = this.getPathByUUID(cacheAsset._uuid);
            if (path) {
                const key = path + `_` + cacheAsset.constructor.name;
                if (!filter || key.indexOf(filter) === 0)
                    logger.warn(`[${key}] refCount: ${cacheAsset.refCount}`);
            } else {
                // statics.push(cacheAsset);
            }
        });
        // statics.forEach(unknown => logger.error(unknown));
    }

    undestoryNodes() {
        const sceneName = this.getSceneName();
        this.assetConsumeds.forEach((value, key, map) => {
            // @ts-ignore
            const nodeSceneName = key?.scene?._name;
            if (nodeSceneName !== sceneName)
                logger.error(key, value);
        });
    }

    get assetConsumedsSceneNames() {
        const name = new Set<string>();
        this.assetConsumeds.forEach((value, key, map) => {
            // @ts-ignore
            name.add(key?.scene?._name);
        });
        return name;
    }


    /**
     * 释放指定场景下的可释放资源
     * @param sceneName
     * @param releaseCaches
     */
    async releaseCacheAsset(sceneName: string) {
        if (!sceneName) return;
        // logger.log(`-----------------------【${sceneName}】-------------------------`);

        if (sceneName.indexOf('-') === 0) {
            this.assetConsumeds.forEach((value, node) => {
                // @ts-ignore
                // const nodeSceneName = value?.values()?.next()?.value?.component?.node?.scene?._name;
                const nodeSceneName = node?.scene?._name;
                const keepSceneName = sceneName.substring(1, sceneName.length);
                if (!keepSceneName) {
                    logger.error(`节点没有被添加进View keepSceneName`);
                } else if (nodeSceneName !== keepSceneName) {
                    // this.assetConsumeds.delete(node);
                    if (node.isValid) {
                        node.destroy();
                    }
                }
            });
        } else {
            this.assetConsumeds.forEach((value, node) => {
                // @ts-ignore
                const nodeSceneName = node?.scene?._name;
                if (!nodeSceneName) {
                    logger.error(`节点没有被添加进View nodeSceneName`);
                } else if (nodeSceneName === sceneName) {
                    if (node.isValid) {
                        node.destroy();
                    }
                }
            });
        }
        const todos: any[] = [];
        let count = 0;
        this.assetReferences.forEach((targets, key) => {
            if (targets) {
                count++;
                todos.push(targets.release(sceneName, true));
            }
        });
        await Promise.all(todos);
        logger.log(`资源回收完成 共计${count}个`);
    }

    getPathByUUID(uuid: string, bundle?: AssetManager.Bundle) {
        let path: string = null;
        if (!bundle) {
            assetManager.bundles.forEach((selBundle, name) => {
                if (!path) {
                    const assetInfo: any = selBundle.getAssetInfo(uuid);
                    if (assetInfo && assetInfo.path) {
                        path = assetInfo.path;
                    }
                }
            });
        } else {
            const assetInfo: any = bundle.getAssetInfo(uuid);
            if (assetInfo && assetInfo.path) {
                path = assetInfo.path;
            }
        }
        return path;
    }

    findBundleByUUID(uuid: string) {
        let finded: AssetManager.Bundle;
        assetManager.bundles.forEach((bundle) => {
            if (!finded) {
                const assetInfo: any = bundle.getAssetInfo(uuid);
                if (assetInfo && assetInfo.path) {
                    finded = bundle;
                }
            }
        });
        return finded;
    }


    /**
     * 对资源去除引用
     * @param decAsset
     * @param release
     * @private
     */
    private decRef(decAsset: Asset, release: boolean) {
        if (decAsset && decAsset.isValid) {
            if (release) {
                this.destoryAssetRef(decAsset);
            } else {
                let breaked = false;
                assetManager.bundles.forEach((bundle, name) => {
                    if (!breaked) {
                        const assetInfo: any = bundle.getAssetInfo(decAsset._uuid);
                        if (assetInfo && assetInfo.path) {
                            // const path = this.getPathByUUID(decAsset._uuid, bundle) ?? decAsset._uuid;
                            if (decAsset.refCount)
                                decAsset.decRef(false);
                            breaked = true;
                        }
                    }
                });
            }

        }
    }

    private destoryAssetRef(decAsset: Asset) {
        // const sceneName = this.getSceneName();
        const pro: any = [];
        this.assetReferences.forEach((value, key) => {
            if (!value) {
                this.assetReferences.delete(key);
            } else if (value.asset && !value.loading && value.asset._uuid === decAsset._uuid) { // 如果资源引用不存在，或者资源引用所持有的资源的uuid等于当前要释放的资源的uuid
                // logger.error(`[${key}] 销毁于 场景：${sceneName}`, value.referencedScene);
                value.destroy();  // 销毁资源引用对象
            } else if (value.loading) { // 否则如果资源正在加载中
                pro.push(value.take().then((asset) => {
                    if (asset._uuid === decAsset._uuid) { // 则等到资源加载完成后，判断uuid是否与当前要释放的资源的uuid相等
                        // logger.error(`[${key}] 销毁于 场景：${sceneName}`, value.referencedScene);
                        value.destroy(); // 销毁资源引用对象
                    }
                    return asset;
                }));
            }
        });
        Promise.all(pro).then(() => {
            try {
                decAsset.decRef();
                // assetManager.releaseAsset(decAsset);
            } catch (e) {
                logger.log(e);
            }
        });
    }

    getSceneName() {
        const main = assetManager.getBundle('main');
        if (main && director.getScene()) {
            const path: any = main.getAssetInfo(director.getScene().uuid);
            if (path) {
                const url: string = path?.url;
                if (url)
                    return url.replace('db://assets/scenes/', '').replace('.scene', '');
            }
            return director.getScene().name;
        }
        return null;
    }

    bundleOf(uuid: string) {
        let thisBundle: AssetManager.Bundle = null;
        assetManager.bundles.forEach((bundle, name) => {
            if (!thisBundle) {
                const assetInfo: any = bundle.getAssetInfo(uuid);
                if (assetInfo && assetInfo.path) {
                    thisBundle = bundle;
                }
            }
        });
        return thisBundle;
    }


}


/**
 * 资源引用对象
 */
export class AssetReference<A extends Asset> {
    private _loader: BaseLoader<A>;

    private _keep: boolean = false;
    private _referencedScene = new Set<string>();

    constructor(loader: BaseLoader<A>) {
        this._loader = loader;
    }

    /**
     * 预加载资源引用
     * @param keep 是否保持在内存
     */
    preLoad(keep: boolean = false) {
        this._keep = keep;
        return this.take();
    }

    /**
     * 将资源赋值到组件属性中，增加资源引用数，并减少组件属性的原持有资源的引用数
     * @param component 引用对象
     * @param prop 属性名
     * @param release 是否直接释放对应属性原持有的资源
     */
    setTo(component: Component, prop: Props | string = 'spriteFrame', release: boolean = false): Promise<void> {
        if (!this.isValid) return null;
        if (!this.path && !this.isStatic) {
            throw Error(`bundle[${this._loader.bundle.name}]不存在该资源 - ${this._loader.uuid} `);
        }
        return assets.setTo(this, component, prop, release);
    }

    /**
     * 将资源赋值到组件属性中，增加资源引用数，并减少组件属性的原持有资源的引用数
     * @param component
     * @param prop
     * @param release
     */
    async untilSetTo(component: Component, prop: Props | string = 'spriteFrame', release: boolean = false) {
        const asset = await this._loader.load();
        await this?.setTo(component, prop, release);
        return asset;
    }

    /**
     * 减少组件属性的原持有资源的引用
     * @param component 组件
     * @param prop 属性名
     * @param release 是否直接释放对应属性原持有的资源
     */
    nilTo(component: Component | any, prop: Props | string = 'spriteFrame', release: boolean = false) {
        assets.nilTo(component, prop, release);
    }

    instantiate(release: boolean = false): Promise<Node> {
        return assets.instantiate(this, release);
    }

    /**
     * 获取资源本身，如果为空或失效，不会进行加载
     * @private
     */
    get asset(): A | null {
        // if (this._loader._asset && !this._loader._asset.isValid) {
        //     throw  Error('资源已过期');
        // }
        return this._loader._asset;
    };

    /**
     * 加载资源本身 如果原资源失效或为null，则会重新加载
     * 请勿直接通过该方法获取资源并使用
     * errorCode  1 资源不存在 2 资源过期
     */
    async take() {
        if (!this.isValid)
            return null;
        if (!this.bundle || !this.bundle.name)
            return null;
        return this?._loader.load().then((asset) => {
            if (!asset)
                throw Error(`资源不存在或加载失败[${this.key}]`);
            if (!asset.isValid)
                throw Error(`资源已过期[${this.key}]`);

            return asset;
        });
    } 

    get referencedScene() {
        return this._referencedScene;
    }

    /**
     * 资源路径
     */
    get path() {
        return this._loader.path();
    }

    get isStatic() {
        return this._loader?.bundle?.name === staticRes.name;
    }

    get bundle() {
        return this._loader?.bundle;
    }

    /**
     * 资源加载中
     */
    get loading() {
        return this._loader._loading;
    }

    /**
     * 资源引用的唯一标识
     */
    get key() {
        return this._loader.key();
    }

    /**
     * 是否持久保留在内存
     * @param value
     */
    set keep(value) {
        this._keep = value;
    }

    get keep() {
        return this._keep;
    }

    get uuid() {
        return this._loader.uuid;
    }

    /**
     * 释放资源
     * @param sceneNameArg
     * @param destroy
     */
    release(sceneNameArg?: string, destroy?: boolean) { // 仅仅释放资源
        return new Promise<void>((resolve) => {
            const sceneName = sceneNameArg || assets.getSceneName();
            if (sceneName)
                if (sceneName.indexOf('-') === 0) {
                    if (!this.referencedScene.has(sceneName.substring(1, sceneName.length)))
                        this.referencedScene.clear();
                    else {
                        //资源存在引用 暂不销毁
                        logger.log('资源存在引用 暂不销毁：', this.path);
                        resolve();
                        return;
                    }
                } else if (sceneName === 'AnyScene') {
                    this.referencedScene.clear();
                } else {
                    this.referencedScene.delete(sceneName);
                }
            if (!this.asset && !this.loading && destroy) {//只有当资源未加载，且 destroy 为true时，才可以直接销毁该资源引用
                logger.log('资源为空，且不是正在加载，直接销毁：', this.path);
                this.destroy();
            }
            //否则需保证资源已加载的同时，满足其他回收条件，才开始回收资源，并在回收后，根据destroy来判断是否销毁当前资源引用
            if (this.asset && !this.asset.refCount && !this.referencedScene.size && !this.isStatic && !this.keep) {
                let oldAsset = this.asset;
                this._loader._asset = null;
                if (this.loading) {
                    this.take().then((asset) => {
                        if (!this.referencedScene.size) {
                            oldAsset = asset;
                            this._loader._asset = null;
                            if (destroy) {
                                assetManager.releaseAsset(oldAsset);
                                this.destroy();
                            } else
                                oldAsset.decRef();
                            resolve();
                        }
                    });
                    return;
                }
                if (destroy) {
                    assetManager.releaseAsset(oldAsset);
                    this.destroy();
                } else
                    oldAsset.decRef();
            }
            resolve();
        });
    }

    private _isValid = true;
    get isValid() {
        return this._isValid;
    }

    /**
     * 销毁资源引用对象
     */
    destroy() {
        this._isValid = false;
        assets.assetReferences.delete(this.key); // 则移除该资源引用
        this._loader.destroy();
        this._referencedScene.clear();
    }

}

interface ReleaseTarget {
    component: Component;
    prop: string;
    release: boolean;
}

export const assets = AssetReferenceManager.instance();

class StaticRes extends AssetManager.Bundle {
    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    private _name = 'staticRes';
}

export const staticRes = new StaticRes();


/**
 * 资源加载器基类
 */
export class BaseLoader<T extends Asset> {
    protected _path: string;
    protected _key: string;

    protected _bundle: AssetManager.Bundle;
    protected _uuid: string | null;
    _asset: T = null;
    _loading: boolean = false;

    constructor(bundle: AssetManager.Bundle, uuid: string) {
        this._bundle = bundle;
        this._uuid = uuid;
    }

    load(): Promise<T> {
        return null;
    };

    path(): string {
        if (!this._path) {
            this._path = this.getPathByUUID(this._uuid, this._bundle);
        }
        return this._path;
    }


    key() {
        if (!this._key) {
            const path = this.path();
            if (path) {
                this._key = `${path}_${this._bundle.name}`;
            }
        }
        return this._key;
    };

    get bundle() {
        return this._bundle;
    }

    get uuid() {
        return this._uuid;
    }

    protected _isValid = true;
    get isValid() {
        return this._isValid;
    }

    protected getPathByUUID(uuid: string, bundle: AssetManager.Bundle) {
        if (uuid && bundle && bundle.name !== staticRes.name) {
            const info: any = bundle.getAssetInfo(uuid);
            if (info && info.path)
                return info.path;
        }
        return null;
    }

    destroy() {
        this._isValid = false;
        this._path = null;
        this._key = null;
        this._bundle = null;
        this._uuid = null;
        this._asset = null;
    }
}


const bundleLoaderCache = new Map<string, Promise<Asset>>();

/**
 * 通过Bundle加载资源
 */
export class BundleLoader<T extends Asset> extends BaseLoader<T> {

    constructor(path: string, type: __private._cocos_core_asset_manager_shared__AssetType<T>, bundle: AssetManager.Bundle) {
        if (!bundle || bundle.name === staticRes.name)
            throw Error('bundle为空，或者指定了staticRes做为bundle');
        super(bundle, null);
        this._path = path;
        this._key = `${path}_${bundle.name}`;
        this.load = () => new Promise<T>((resolve) => {
            if (this._asset && this._asset.isValid) {
                resolve(this._asset);
                return;
            }
            if (bundle) {
                this._loading = true;
                const time = Date.now();
                let loadingPromise = bundleLoaderCache.get(this._key);
                let fromCache = true;
                if (!loadingPromise) {//如果已经正在加载，则直接获取加载中的结果 如果没有 则创建相应的加载promis对象缓存，并在加载完成后移出缓存
                    loadingPromise = new Promise<T>((loadingResolve) => {
                        bundle.load(path, type, (err, asset) => {
                            loadingResolve(asset);
                            bundleLoaderCache.delete(this._key);
                        });
                    });
                    bundleLoaderCache.set(this._key, loadingPromise);
                    fromCache = false;
                }
                loadingPromise.then((asset) => {
                    if (asset) {
                        this._asset = asset as T;
                        logger.log(`loaded:${fromCache ? 'CACHE' : ''}`, Date.now() - time, path);
                        resolve(this._asset);
                    } else {
                        logger.log('loadfailed:', Date.now() - time, path);
                        resolve(null);
                    }
                    this._loading = false;
                });
                // bundle.load(path, type, (err, asset) => {
                //     if (asset) {
                //         this._asset = asset;
                //         console.log('loaded:', Date.now() - time);
                //         resolve(asset);
                //     } else {
                //         console.log('loadfailed:', Date.now() - time);
                //         resolve(null);
                //     }
                //     this._loading = false;
                // });
            } else resolve(null);
        });
    }
}

/**
 * 通过资源加载对应资源
 */
export class AssetLoader<T extends Asset> extends BaseLoader<T> {
    private type: __private._cocos_core_asset_manager_shared__AssetType<T>;

    constructor(asset: T, type: __private._cocos_core_asset_manager_shared__AssetType<T>, bundle: AssetManager.Bundle) {
        if (!asset || !asset.isValid)
            throw Error(`资源为空，或者已过期-${asset}`);
        super(bundle, asset._uuid);
        this.path(); // 先记录path
        this._asset = asset;
    }


    load() {
        return new Promise<T>((resolve) => {
            this._loading = true;
            if (!this._asset || !this._asset.isValid) {
                if (this._path && this._bundle) {
                    this._bundle.load(this._path, this.type, (err, asset) => {
                        if (!this.isValid) {
                            resolve(null);
                            return;
                        }
                        if (asset && asset.isValid) {
                            this._uuid = asset._uuid;
                        }
                        this._asset = asset;
                        resolve(this._asset);
                        this._loading = false;
                    });
                    return;
                }
                this._asset = null;
            }
            resolve(this._asset);
            this._loading = false;
        });
    }
}

/**
 * 通过图集资源加载贴图资源
 */
export class SpriteFrameFromAtlasLoader extends BaseLoader<SpriteFrame> {
    private _atlas: SpriteAtlas;
    private readonly _atlasUuid: string;
    private readonly _sfKey: string;
    private _atlasPath: string;

    constructor(atlas: SpriteAtlas, sfKey: string, bundle: AssetManager.Bundle) {
        if (!sfKey)
            throw Error(`${atlas._uuid} 没有为图集指定spriteFrame的name`);
        const spriteFrame = atlas.getSpriteFrame(sfKey);
        super(bundle, spriteFrame?._uuid);
        this._atlas = atlas;
        this._atlasUuid = atlas._uuid;
        this._sfKey = sfKey;
    }

    async load(): Promise<SpriteFrame> {
        this._loading = true;
        const sfKey = this._sfKey;
        const bundle = this._bundle;
        if (!this._asset || !this._asset.isValid) { // 如果待使用资源为空或者已失效
            if (this._atlas && this._atlas.isValid) // 则判断当前图集是否有效
                this._asset = this._atlas.getSpriteFrame(sfKey); // 如果有效 则取对应帧做为待使用资源
            else if (bundle && bundle.name !== staticRes.name) { // 如果当前图集无效，则尝试先加载图集
                if (!this._atlasPath)
                    this._atlasPath = this.getPathByUUID(this._atlasUuid, bundle);
                if (this._atlasPath) {
                    this._atlas = await load(this._atlasPath, SpriteAtlas, bundle);
                    if (!this.isValid) // 此时已经经历过一次await 故需要校验有消息
                    {
                        this._asset = null;
                        this._loading = false;
                        return this._asset;
                    }
                    if (this._atlas)
                        this._asset = this._atlas.getSpriteFrame(sfKey);
                    else
                        this._asset = null;
                }
            } else
                this._asset = null;

            if (this._asset && !this._asset.isValid) {
                this._asset = await load(this.path(), SpriteFrame, bundle);
                if (!this.isValid) // 此时已经经历过一次await 故需要校验有消息
                {
                    this._asset = null;
                    this._loading = false;
                    return this._asset;
                }
            }
        }
        this._loading = false;
        return this._asset;
    }

    path(): string {
        if (!this._path) {
            if (!this._atlasPath)
                this._atlasPath = this.getPathByUUID(this._atlasUuid, this._bundle);
            if (this._atlasPath) {
                this._path = `${this._atlasPath}/${this._sfKey}`;// 图集资源路径后方不需要接 spriteFrame
            }
        }
        return this._path;
    }

}

/**
 * 通过图集资源引用加载贴图资源
 */
export class SpriteFrameFromAtlasRefLoader extends BaseLoader<SpriteFrame> {
    private atlasRef: AssetReference<SpriteAtlas>;
    private readonly sfKey: string;

    /**
     * 构建SpriteFrameFromAtlasRefLoader对象
     * @param atlasRef
     * @param sfKey 精灵帧key
     * @param bundle
     */
    constructor(atlasRef: AssetReference<SpriteAtlas>, sfKey: string, bundle: AssetManager.Bundle) {
        if (!sfKey)
            throw Error(`${atlasRef.key} 没有为图集指定spriteFrame的name`);
        super(bundle, null);
        this.atlasRef = atlasRef;
        this.sfKey = sfKey;
    }

    /**
     * 加载资源
     */
    async load(): Promise<SpriteFrame> {
        if (this._asset && this._asset.isValid)
            return this._asset;
        this._loading = true;
        const atlas = await this.atlasRef.take();
        if (atlas && atlas.isValid) {
            this._asset = atlas.getSpriteFrame(this.sfKey);
            if (this._asset?._uuid)
                this._uuid = this._asset._uuid;
            if (this._asset && !this._asset.isValid) {
                this._asset = await load(this.path(), SpriteFrame, this.bundle);
                if (!this.isValid)
                    this._asset = null;
            }
        } else
            this._asset = null;
        this._loading = false;
        return this._asset;
    }

    path(): string {
        if (!this._path) {
            const atlaPath = this.atlasRef.path;
            if (atlaPath) {
                this._path = `${atlaPath}/${this.sfKey}`; // 图集资源路径后方不需要接 spriteFrame
            }
        }
        return this._path;
    }
}

/**
 * 异步通过Bundle加载资源
 * @param path 资源路径
 * @param type 资源类型
 * @param bundle
 */
async function load<T extends Asset>(path: string, type: __private._cocos_core_asset_manager_shared__AssetType<T>, bundle: AssetManager.Bundle) {
    return new Promise<T>((resolve) => {
        if (!bundle || bundle.name === staticRes.name)
            resolve(null);
        else
            bundle.load(path, type, (err, as) => {
                if (err) {
                    console.error(err);
                    resolve(null);
                } else {
                    resolve(as);
                }
            });
    });
}
