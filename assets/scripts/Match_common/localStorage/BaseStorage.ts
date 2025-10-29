import { sys } from "cc";

export enum ITEM_STORAGE {
    LANGUAGE = "Match3_Lang",
    AUDIO = "Match3_audio",
    EventTracking = "Match3_event",
    EventTrackings = "Match3_events",
    Game = "Match3_game",
    JACKPOT = "Match3_jackpot",
    WAITWITHDRWW = "Match3_waitwithdraw",
    WAITWITHDRWWS = "Match3_waitwithdraws",
    GameBoard = "Match3_gameboard",
    GameGift = "Match3_gamegift",
}

/**
 * 可以移除的缓存
 */
export enum REMOVE_ITEM_STORAGE {
    ACCOUNT_TOKEN = "account_token",
    USER_HAS_EXIT_GAME = "user_has_exit_game",
}

export namespace BaseStorageNS {
    /**
     * 获取缓存
     * @param itemName
     */
    export function getItem(itemName: ITEM_STORAGE | string): string | null {
        return sys.localStorage.getItem(itemName);
    }

    /**
     * 设置缓存
     * @param itemName
     * @param value
     */
    export function setItem(
        itemName: ITEM_STORAGE | string,
        value: string | number
    ): void {
        sys.localStorage.setItem(itemName, String(value));
    }

    /**
     * 移除缓存
     * @param item
     */
    export function removeLocalStorageItem(item: string) {
        sys.localStorage.removeItem(item);
    }

    /**
     * 批量清楚缓存
     */
    export function clear() { }
}
