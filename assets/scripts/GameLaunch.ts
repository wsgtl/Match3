import './Match_common/Expand'
import { _decorator, Component, Node } from 'cc';
import { ViewManager } from './Match_game/manager/ViewManger';
import { GameStorage } from './Match_game/GameStorage_Match';
import { AudioSource } from 'cc';
import { AudioManager } from './Match_game/manager/AudioManager';
import { i18n } from './Match_common/i18n/I18nManager';
import { AudioStorage } from './Match_common/localStorage/AudioStorage';
import { LangStorage } from './Match_common/localStorage/LangStorage';
import { JackpotManger } from './Match_game/manager/JackpotManager';
import { WithdrawStorage } from './Match_game/view/withdraw/WithdrawStorage';
const { ccclass, property } = _decorator;

@ccclass('GameLaunch')
export class GameLaunch extends Component {
    @property(Node)
    mainNode:Node = null;
    @property(Node)
    upper:Node = null;
    @property(Node)
    lower:Node = null;
    @property(Node)
    toper:Node = null;
    @property(AudioSource)
    bgmNode:AudioSource = null;
    private static Instance: GameLaunch = null;

    start(): void {
        ViewManager.setMainSceneNode(this.mainNode,this.upper,this.lower,this.toper);
        ViewManager.showLoading();
        // ViewManager.showHome();
    }
    onLoad(): void {
        if (GameLaunch.Instance === null) {
            GameLaunch.Instance = this;
        } else {
            this.destroy();
            return;
        }

        GameStorage.init();
        LangStorage.init();
        AudioManager.setBgmNode(this.bgmNode);
        AudioStorage.init();
        JackpotManger.init();
        WithdrawStorage.init();
        i18n.loadLang();//加载多语言

    }

 


}


