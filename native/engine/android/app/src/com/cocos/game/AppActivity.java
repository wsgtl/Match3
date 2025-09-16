/****************************************************************************
Copyright (c) 2015-2016 Chukong Technologies Inc.
Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/
package com.cocos.game;

import android.app.Activity;
import android.net.Uri;
import android.os.Bundle;
import android.content.Intent;
import android.content.res.Configuration;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.appsflyer.AFInAppEventParameterName;
import com.appsflyer.AFInAppEventType;
import com.appsflyer.attribution.AppsFlyerRequestListener;
import com.cocos.lib.JsbBridgeWrapper;
import com.cocos.service.SDKWrapper;
import com.cocos.lib.CocosActivity;

import org.json.JSONException;
import org.json.JSONObject;

import com.appsflyer.AppsFlyerLib;
import com.luckbash.lksma.WebviewActivity;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Locale;
import java.util.Map;


public class AppActivity extends CocosActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // DO OTHER INITIALIZATION BELOW
        SDKWrapper.shared().init(this);
        AdMax ad = new AdMax();
        ad.init(this,this);
//        AdHelper ad = new AdHelper();
//        ad.init(this);

        JsbBridgeWrapper jbw = JsbBridgeWrapper.getInstance();
        jbw.addScriptEventListener("jumpWeb",this::jumpWeb);
        jbw.addScriptEventListener("vibrate",this::vibrate);
        jbw.addScriptEventListener("locale",this::locale);
        jbw.addScriptEventListener("showH5Game",this::showH5Game);

        AdjustSDK.getInstance().init(getApplication());
        AppsFlyer.getInstance().init(this);


        //默认集成直接启用，如需关闭或单独开启，使用以下方法
//        ViewSdk.getConfig().setGlobalEnabled(false);    //关闭全局
//        ViewSdk.enableFor(AppActivity.class);  //指定Activity
//        ViewSdk.enableFor(WebviewActivity.class);
    }

    @Override
    protected void onResume() {
        super.onResume();
        SDKWrapper.shared().onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        SDKWrapper.shared().onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // Workaround in https://stackoverflow.com/questions/16283079/re-launch-of-activity-on-home-button-but-only-the-first-time/16447508
        if (!isTaskRoot()) {
            return;
        }
        SDKWrapper.shared().onDestroy();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        SDKWrapper.shared().onActivityResult(requestCode, resultCode, data);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        SDKWrapper.shared().onNewIntent(intent);
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        SDKWrapper.shared().onRestart();
    }

    @Override
    protected void onStop() {
        super.onStop();
        SDKWrapper.shared().onStop();
    }

    @Override
    public void onBackPressed() {
        SDKWrapper.shared().onBackPressed();
        super.onBackPressed();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        SDKWrapper.shared().onConfigurationChanged(newConfig);
        super.onConfigurationChanged(newConfig);
    }

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        SDKWrapper.shared().onRestoreInstanceState(savedInstanceState);
        super.onRestoreInstanceState(savedInstanceState);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        SDKWrapper.shared().onSaveInstanceState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onStart() {
        SDKWrapper.shared().onStart();
        super.onStart();
    }

    @Override
    public void onLowMemory() {
        SDKWrapper.shared().onLowMemory();
        super.onLowMemory();
    }


    public  void jumpWeb(String url){
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        startActivity(intent);
    }
    public void vibrate(String args){
        Log.e("震动", args);
        try {
            JSONObject json = new JSONObject(args);
            int duration = json.getInt("duration");
            int amplitude = json.getInt("amplitude");
            if(amplitude>=0){//振幅控制
               VibrationUtils.vibrateWithAmplitude(this, duration,amplitude);
            }else{
                VibrationUtils.vibrate(this, duration);
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }
    }
    /**获取默认国家地区码*/
    public void locale(String s){
        String countryCode = Locale.getDefault().getCountry(); // 返回ISO国家码
        Log.d("国家地区码",countryCode);
        JsbBridgeWrapper jbw = JsbBridgeWrapper.getInstance();
        jbw.dispatchEventToScript("getCode",countryCode);
    }
    /**调用h5 aar包*/
    public void showH5Game(String s){
        Log.d("h5","调用h5");
        // 使用显式Intent启动Activity
        Intent intent = new Intent(AppActivity.this, WebviewActivity.class);
        startActivity(intent);
    }
}
