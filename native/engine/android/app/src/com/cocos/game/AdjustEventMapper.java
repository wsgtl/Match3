package com.cocos.game;

import java.util.HashMap;
import java.util.Map;

public class AdjustEventMapper {

    private static final Map<String, String> EVENT_TOKEN_MAP = new HashMap<>();

    static {
        // 📊 广告曝光里程碑
        EVENT_TOKEN_MAP.put("revvideo_5",  "59okl7");
        EVENT_TOKEN_MAP.put("revvideo_8", "2ps46m");
        EVENT_TOKEN_MAP.put("revvideo_10", "30bl59");
        EVENT_TOKEN_MAP.put("revvideo_20", "w2kh6l");
        EVENT_TOKEN_MAP.put("revvideo_30", "6gc651");
        EVENT_TOKEN_MAP.put("revvideo_40", "1nlkw4");

        // 🎮 关卡事件
        EVENT_TOKEN_MAP.put("level 1", "i5iohc");
        EVENT_TOKEN_MAP.put("level 2", "2v2e3b");
        EVENT_TOKEN_MAP.put("level 3", "sxz24n");
        EVENT_TOKEN_MAP.put("level 4", "97oqy2");
        EVENT_TOKEN_MAP.put("level 5", "vzrjxq");
        EVENT_TOKEN_MAP.put("level 6", "pk6i3i");
        EVENT_TOKEN_MAP.put("level 7", "so5vk7");
        EVENT_TOKEN_MAP.put("level 8", "l3m1hr");
        EVENT_TOKEN_MAP.put("level 9", "eu01xz");
        EVENT_TOKEN_MAP.put("level 10", "mt35sm");
//        EVENT_TOKEN_MAP.put("Level_11", "xmjqiw");
//        EVENT_TOKEN_MAP.put("Level_12", "5nr2eu");
//        EVENT_TOKEN_MAP.put("Level_13", "subk8d");
//        EVENT_TOKEN_MAP.put("Level_14", "1lazcz");
//        EVENT_TOKEN_MAP.put("Level_15", "2em870");
//        EVENT_TOKEN_MAP.put("Level_16", "x9g7yy");
//        EVENT_TOKEN_MAP.put("Level_17", "ygx3hw");
//        EVENT_TOKEN_MAP.put("Level_18", "y0z85v");
//        EVENT_TOKEN_MAP.put("Level_19", "6yrsac");
//        EVENT_TOKEN_MAP.put("Level_20", "s4p9lk");

        // 🚀 启动事件
//        EVENT_TOKEN_MAP.put("app_launch", "cvc5mz");   // 每次打开应用
//        EVENT_TOKEN_MAP.put("first_launch", "tpdilj"); // 首次启动（激活）
    }

    public static String getToken(String eventName) {
        return EVENT_TOKEN_MAP.get(eventName);
    }
}
