import { _decorator, Component, Prefab } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PrefabRecycler')
export default class PrefabRecycler extends Component {

    prefab: Prefab;

}