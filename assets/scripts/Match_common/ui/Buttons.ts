
import { Enum } from 'cc';
import { v2 } from 'cc';
import { UITransform } from 'cc';
import { __private } from 'cc';
import { _decorator, Component, SpriteAtlas, Sprite, Node, Layout, SpriteFrame, Layers } from 'cc';
import { UIUtils } from '../utils/UIUtils';
import { Button } from 'cc';
import { AudioManager } from '../../Match_game/manager/AudioManager';

const { ccclass, property, menu } = _decorator;
// type Aligning = "center"|"bottom"|"top"

enum SoundType {
    btn = 0,
    click,
    switch,
}
@ccclass('Buttons')
@menu('项目组件/Buttons')
export class Buttons extends Button {

    @property({ type:  Enum(SoundType), tooltip: '音效' })
    private soundType: SoundType = 0;


    protected onLoad(): void {
        this.node.on(Node.EventType.TOUCH_START, this.sound, this);
    }
    private sounds = ["btn","click","switch"];
    private sound() {
        AudioManager.playEffect(this.sounds[this.soundType]);
    }


}
