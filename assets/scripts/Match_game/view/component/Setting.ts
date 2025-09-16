import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { ButtonLock } from '../../../Match_common/Decorator';
import { SettingManger } from '../../manager/SettingManger';
const { ccclass, property } = _decorator;

@ccclass('Setting')
export class Setting extends Component {
    protected onLoad(): void {
        
        this.node.on(Button.EventType.CLICK,this.click,this);
    }
    @ButtonLock(1)
    click(){
        SettingManger.instance.showDialog();
    }
}


