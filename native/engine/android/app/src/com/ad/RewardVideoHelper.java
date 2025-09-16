//package com.ad;
//
//import android.app.Activity;
//import android.content.Context;
//import android.text.TextUtils;
//
//
//import com.ad.JSPluginUtil;
//import com.ad.MsgTools;
//import com.thinkup.core.api.TUAdInfo;
//import com.thinkup.core.api.TUAdStatusInfo;
//import com.thinkup.core.api.TUNetworkConfirmInfo;
//import com.thinkup.core.api.TUShowConfig;
//import com.thinkup.core.api.AdError;
//import com.thinkup.rewardvideo.api.TURewardVideoAd;
//import com.thinkup.rewardvideo.api.TURewardVideoExListener;
//import com.thinkup.rewardvideo.api.TURewardVideoListener;
//import com.cocos.lib.CocosJavascriptJavaBridge;
//import com.cocos.lib.CocosSensorHandler;
//import com.cocos.lib.JsbBridgeWrapper;
//
//import org.json.JSONObject;
//
//
//public class RewardVideoHelper {
//    private CocosSensorHandler mSensorHandler;
//    private static final String TAG = RewardVideoHelper.class.getSimpleName();
//
//    TURewardVideoAd mRewardVideoAd;
//    String mPlacementId;
//    Activity mActivity;
//    JsbBridgeWrapper jbw;
//
//    boolean isReady = false;
//
//    public RewardVideoHelper() {
//        MsgTools.printMsg(TAG + ": " + this);
//
//        mActivity = JSPluginUtil.getActivity();
//        jbw = JsbBridgeWrapper.getInstance();
//    }
//
//    public void load(final String placementId) {
//        this.initVideo(placementId);
//    }
//
//    private void initVideo(final String placementId) {
//        MsgTools.printMsg("初始化广告");
//
//        RewardVideoHelper rvh = this;
//        mPlacementId = placementId;
//
//        mRewardVideoAd = new TURewardVideoAd(mActivity, placementId);
//
//        //设置广告监听
//        mRewardVideoAd.setAdListener(new TURewardVideoListener() {
//            @Override
//            public void onRewardedVideoAdLoaded() {
//            }
//
//            @Override
//            public void onRewardedVideoAdFailed(AdError adError) {
//                //注意：禁止在此回调中执行广告的加载方法进行重试，否则会引起很多无用请求且可能会导致应用卡顿
//                jbw.dispatchEventToScript("getRewardVideoFail","0");
//                MsgTools.printMsg("激励视频广告加载失败err"+adError.toString());
//            }
//
//            @Override
//            public void onRewardedVideoAdPlayStart(TUAdInfo adInfo) {
//                //建议在此回调中调用load进行广告的加载，方便下一次广告的展示（不需要调用isAdReady()）
//                MsgTools.printMsg("开始播放视频广告");
//                mRewardVideoAd.load();
//                JSPluginUtil.pause();
//            }
//
//            @Override
//            public void onRewardedVideoAdPlayEnd(TUAdInfo atAdInfo) {
////                rvh.resume();
//            }
//
//            @Override
//            public void onRewardedVideoAdPlayFailed(AdError adError, TUAdInfo atAdInfo) {
//                JSPluginUtil.resume();
//                jbw.dispatchEventToScript("getRewardVideoFail","1");
//
//            }
//
//            @Override
//            public void onRewardedVideoAdClosed(TUAdInfo atAdInfo) {
//                JSPluginUtil.resume();
//            }
//
//            @Override
//            public void onReward(TUAdInfo atAdInfo) {
//                //建议在此回调中下发奖励
//                JSPluginUtil.resume();
//                MsgTools.printMsg("广告已经获得奖励了");
//                jbw.dispatchEventToScript("getRewardVideo");
//            }
//
//            @Override
//            public void onRewardedVideoAdPlayClicked(TUAdInfo atAdInfo) {
//            }
//        });
//
//        mRewardVideoAd.load();
//    }
//
//
//    public void showVideo(final String scenario) {
////        MsgTools.printMsg("显示广告");
//
//        if (this.isAdReady()) {
//            TUShowConfig showConfig = new TUShowConfig.Builder()
//                    .scenarioId(scenario)
//                    .build();
//            mRewardVideoAd.show(mActivity, showConfig);
//        } else {
//            mRewardVideoAd.load();
//            jbw.dispatchEventToScript("getRewardVideoFail","2");
//            MsgTools.printMsg("激励视频广告未ready");
//        }
//    }
//
//    public boolean isAdReady() {
//        MsgTools.printMsg("video isAdReady: " + mPlacementId);
//
//        try {
//            if (mRewardVideoAd != null) {
//                boolean isAdReady = mRewardVideoAd.isAdReady();
//                MsgTools.printMsg("video isAdReady: " + mPlacementId + ", " + isAdReady);
//                return isAdReady;
//            } else {
//                MsgTools.printMsg("video isAdReady error, you must call loadRewardedVideo first " + mPlacementId);
//            }
//            MsgTools.printMsg("video isAdReady, end: " + mPlacementId);
//        } catch (Throwable e) {
//            MsgTools.printMsg("video isAdReady, Throwable: " + e.getMessage());
//            return isReady;
//        }
//        return isReady;
//    }
//
//    public String checkAdStatus() {
//        MsgTools.printMsg("video checkAdStatus: " + mPlacementId);
//
//        if (mRewardVideoAd != null) {
//            TUAdStatusInfo atAdStatusInfo = mRewardVideoAd.checkAdStatus();
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
//
//}
