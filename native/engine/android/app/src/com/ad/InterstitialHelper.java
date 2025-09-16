//package com.ad;
//
//import android.app.Activity;
//import android.text.TextUtils;
//
//
//import com.thinkup.core.api.TUAdInfo;
//import com.thinkup.core.api.TUAdStatusInfo;
//import com.thinkup.core.api.TUShowConfig;
//import com.thinkup.core.api.AdError;
//import com.thinkup.interstitial.api.TUInterstitial;
//import com.thinkup.interstitial.api.TUInterstitialListener;
//import com.cocos.lib.CocosJavascriptJavaBridge;
//
//
//import org.json.JSONObject;
//
//import java.util.HashMap;
//import java.util.Map;
//
//public class InterstitialHelper {
//
//    private static final String TAG = InterstitialHelper.class.getSimpleName();
//
//    TUInterstitial mInterstitialAd;
//    String mPlacementId;
//    Activity mActivity;
//
//    boolean isReady = false;
//
//    public InterstitialHelper() {
//        MsgTools.printMsg(TAG + ": " + this);
//        mActivity = JSPluginUtil.getActivity();
//    }
//
//
//
//    private void initInterstitial(final String placementId) {
//        mPlacementId = placementId;
//        MsgTools.printMsg("initInterstitial: " + mPlacementId);
//
//        mInterstitialAd = new TUInterstitial(mActivity, placementId);
//
////设置广告监听
//        mInterstitialAd.setAdListener(new TUInterstitialListener() {
//            @Override
//            public void onInterstitialAdLoaded() {}
//
//            @Override
//            public void onInterstitialAdLoadFail(AdError adError) {
//                //注意：禁止在此回调中执行广告的加载方法进行重试，否则会引起很多无用请求且可能会导致应用卡顿
//            }
//            @Override
//            public void onInterstitialAdShow(TUAdInfo adInfo) {
//                //建议在此回调中调用load进行广告的加载，方便下一次广告的展示（不需要调用isAdReady()）
//                mInterstitialAd.load();
//                JSPluginUtil.pause();
//                MsgTools.printMsg("加载插屏视频广告");
//            }
//            @Override
//            public void onInterstitialAdVideoStart(TUAdInfo adInfo) {
//                JSPluginUtil.pause();
//                MsgTools.printMsg("开始播放插屏视频广告");
//            }
//
//            @Override
//            public void onInterstitialAdVideoEnd(TUAdInfo atAdInfo) {}
//
//            @Override
//            public void onInterstitialAdVideoError(AdError adError) {
//                JSPluginUtil.resume();
//                MsgTools.printMsg("播放插屏视频广告错误");
//            }
//
//            @Override
//            public void onInterstitialAdClose(TUAdInfo atAdInfo) {
//                JSPluginUtil.resume();
//                MsgTools.printMsg("播放插屏视频广告关闭");
//            }
//
//            @Override
//            public void onInterstitialAdClicked(TUAdInfo atAdInfo) {}
//        });
//        mInterstitialAd.load();
//    }
//
//    public void loadInterstitial(final String placementId, final String settings) {
//        MsgTools.printMsg("loadInterstitial: " + placementId + ", settings: " + settings);
//        this.initInterstitial(placementId);
//    }
//
//    public void showInterstitial(final String scenario) {
//        MsgTools.printMsg("showInterstitial: " + mPlacementId + ", scenario: " + scenario);
//        if (this.isAdReady()) {
//            TUShowConfig showConfig = new TUShowConfig.Builder()
//                    .scenarioId("your scenario id")
//                    .build();
//            mInterstitialAd.show(mActivity,showConfig);
//        } else {
//            mInterstitialAd.load();
//        }
//
//    }
//
//    public boolean isAdReady() {
//        MsgTools.printMsg("interstitial isAdReady: " + mPlacementId);
//
//        try {
//            if (mInterstitialAd != null) {
//                boolean isAdReady = mInterstitialAd.isAdReady();
//                MsgTools.printMsg("interstitial isAdReady: " + mPlacementId + ", " + isAdReady);
//                return isAdReady;
//            } else {
//                MsgTools.printMsg("interstitial isAdReady error, you must call loadInterstitial first " + mPlacementId);
//            }
//            MsgTools.printMsg("interstitial isAdReady, end: " + mPlacementId);
//        } catch (Throwable e) {
//            MsgTools.printMsg("interstitial isAdReady, Throwable: " + e.getMessage());
//            return isReady;
//        }
//        return isReady;
//    }
//
//    public String checkAdStatus() {
//        MsgTools.printMsg("interstitial checkAdStatus: " + mPlacementId);
//
//        if (mInterstitialAd != null) {
//            TUAdStatusInfo atAdStatusInfo = mInterstitialAd.checkAdStatus();
//            boolean loading = atAdStatusInfo.isLoading();
//            boolean ready = atAdStatusInfo.isReady();
//            TUAdInfo atTopAdInfo = atAdStatusInfo.getTUTopAdInfo();
//
//            try {
//                JSONObject jsonObject = new JSONObject();
//                jsonObject.put("isLoading", loading);
//                jsonObject.put("isReady", ready);
//                jsonObject.put("adInfo", atTopAdInfo);
//
//                return jsonObject.toString();
//            } catch (Throwable e) {
//                e.printStackTrace();
//            }
//        }
//        return "";
//    }
//
//}
//
