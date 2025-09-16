package com.ad;
import android.app.Activity;

import com.cocos.lib.CocosActivity;
import com.cocos.lib.CocosHelper;
import com.cocos.lib.GlobalObject;
import com.cocos.lib.JsbBridgeWrapper;


import java.sql.ParameterMetaData;
public class JSPluginUtil {
    public static final String TAG = "ATJSBridge";

    public static Activity getActivity() {

        return  (CocosActivity) GlobalObject.getActivity();
    }

    public static void runOnUiThread(final Runnable runnable) {
        try {
            getActivity().runOnUiThread(runnable);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void runOnGLThread(final Runnable runnable) {
        try {
            CocosHelper.runOnGameThread(runnable);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**游戏暂停*/
    public static void pause(){
        JsbBridgeWrapper jbw = JsbBridgeWrapper.getInstance();
        jbw.dispatchEventToScript("gamePause");
    }
    /**游戏恢复*/
    public static void resume(){
        JsbBridgeWrapper jbw = JsbBridgeWrapper.getInstance();
        jbw.dispatchEventToScript("gameResume");
    }
}
