import { Node } from "cc";
import { ViewManager } from "./ViewManger";

export class SettingManger {
    public static _instance: SettingManger = null;
    public static get instance(): SettingManger {
        if (!this._instance) {
            this._instance = new SettingManger();
        }
        return this._instance;
    }
    private _curDialog: Node = null;
    /**记录当前弹窗，防止显示多个 */
    public setDialog(cur: Node) {
        this._curDialog = cur;
    }
    /**显示弹窗 */
    public showDialog() {
        if (!this._curDialog) {//已经有弹窗不显示
            ViewManager.showSettings();
        }
    }
}