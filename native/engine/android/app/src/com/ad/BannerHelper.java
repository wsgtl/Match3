//package com.ad;
//
//
//import android.app.Activity;
//import android.text.TextUtils;
//import android.view.Gravity;
//import android.view.View;
//import android.view.ViewGroup;
//import android.view.ViewParent;
//import android.widget.FrameLayout;
//
//import com.thinkup.banner.api.TUBannerListener;
//import com.thinkup.banner.api.TUBannerView;
//import com.thinkup.banner.api.TUBannerListener;
//import com.thinkup.core.api.TUAdConst;
//import com.thinkup.core.api.TUAdInfo;
//import com.thinkup.core.api.TUAdStatusInfo;
//import com.thinkup.core.api.TUNativeAdCustomRender;
//import com.thinkup.core.api.TUNativeAdInfo;
//import com.thinkup.core.api.AdError;
//import com.cocos.lib.CocosJavascriptJavaBridge;
//
//import org.json.JSONObject;
//
//import java.util.HashMap;
//import java.util.Map;
//
//public class BannerHelper{
//
//    private final String TAG = getClass().getSimpleName();
//    Activity mActivity;
//    String mPlacementId;
//    boolean isReady;
//
//    TUBannerView mBannerView;
//
//    public BannerHelper() {
//        MsgTools.printMsg(TAG + ": " + this);
//        mActivity = JSPluginUtil.getActivity();
//        mPlacementId = "";
//    }
//
//
//
//    public void initBanner(String placementId) {
//        mPlacementId = placementId;
//        MsgTools.printMsg("initBanner: " + placementId);
//
//        mBannerView = new TUBannerView(mActivity);
//        mBannerView.setPlacementId(mPlacementId);
//        //设置广告视图mBannerView的布局参数
////设定一个宽度值，比如屏幕宽度
//        int width = mActivity.getResources().getDisplayMetrics().widthPixels;
//        int height = ViewGroup.LayoutParams.WRAP_CONTENT;
////        int height = 300;
//        mBannerView.setLayoutParams(new FrameLayout.LayoutParams(width, height));
//
////把TUBannerView添加到广告容器中
////如需手动控制广告的展示时机，可以根据自己的业务逻辑选择合适的时机调用此方法
//        FrameLayout frameLayout = new FrameLayout(mActivity);
//        frameLayout.addView(mBannerView);
//
//        mBannerView.setBannerAdListener(new TUBannerListener() {
//            @Override
//            public void onBannerLoaded() {
//                MsgTools.printMsg("横幅广告加载成功");
//            }
//
//            @Override
//            public void onBannerFailed(AdError adError) {
//                //注意：禁止在此回调中执行广告的加载方法进行重试，否则会引起很多无用请求且可能会导致应用卡顿
//                MsgTools.printMsg("横幅广告加载失败"+adError);
//                MsgTools.printMsg("横幅广告error:"+adError.getFullErrorInfo());
//            }
//
//            @Override
//            public void onBannerClicked(TUAdInfo atAdInfo) {}
//
//            @Override
//            public void onBannerShow(TUAdInfo atAdInfo) {
//                MsgTools.printMsg("横幅广告显示成功");
//            }
//
//            @Override
//            public void onBannerClose(TUAdInfo atAdInfo) {
//                if (mBannerView != null && mBannerView.getParent() != null) {
//                    ((ViewGroup) mBannerView.getParent()).removeView(mBannerView);
//                }
//                MsgTools.printMsg("横幅广告关闭");
//            }
//
//            @Override
//            public void onBannerAutoRefreshed(TUAdInfo atAdInfo) {
//                MsgTools.printMsg("横幅广告刷新成功");
//            }
//
//            @Override
//            public void onBannerAutoRefreshFail(AdError adError) {
//                MsgTools.printMsg("横幅广告刷新失败");
//            }
//        });
////可以通过ATAdConst.KEY.AD_WIDTH和ATAdConst.KEY.AD_HEIGHT去设置广告平台返回的横幅广告的宽高
////目前支持设置宽高的广告平台有：AdColony、Mintegral、Pangle、UnityAds、Yandex、Admob
////假设横幅广告的宽高为320x50
//        Map localMap = new HashMap<>();
//        localMap.put(TUAdConst.KEY.AD_WIDTH, dip2px(320));
//        localMap.put(TUAdConst.KEY.AD_HEIGHT, dip2px(50));
//        mBannerView.setLocalExtra(localMap);
//
//        mBannerView.loadAd();
//        MsgTools.printMsg("横幅广告width"+width+"，height:"+height);
//    }
//
//    public void loadBanner(final String placementId, final String settings) {
//        MsgTools.printMsg("loadBanner: " + placementId + ", settings - " + settings);
//        this.initBanner(placementId);
//    }
//
//    public void showBannerWithRect(String rectJson, final String scenario) {
////        MsgTools.printMsg("showBannerWithRect: " + mPlacementId + ", rect >>>" + rectJson + ", scenario: " + scenario);
////
////        if (!TextUtils.isEmpty(rectJson)) {
////            JSONObject jsonObject = null;
////            try {
////                jsonObject = new JSONObject(rectJson);
////
////                int x = 0, y = 0, width = 0, height = 0;
////                if (jsonObject.has(Const.X)) {
////                    x = jsonObject.optInt(Const.X);
////                }
////                if (jsonObject.has(Const.Y)) {
////                    y = jsonObject.optInt(Const.Y);
////                }
////                if (jsonObject.has(Const.WIDTH)) {
////                    width = jsonObject.optInt(Const.WIDTH);
////                }
////                if (jsonObject.has(Const.HEIGHT)) {
////                    height = jsonObject.optInt(Const.HEIGHT);
////                }
////
////                final int finalWidth = width;
////                final int finalHeight = height;
////                final int finalX = x;
////                final int finalY = y;
////                JSPluginUtil.runOnUiThread(new Runnable() {
////                    @Override
////                    public void run() {
////                        if (mBannerView != null) {
////                            FrameLayout.LayoutParams layoutParams = new FrameLayout.LayoutParams(finalWidth, finalHeight);
////                            layoutParams.leftMargin = finalX;
////                            layoutParams.topMargin = finalY;
////                            if (mBannerView.getParent() != null) {
////                                ((ViewGroup) mBannerView.getParent()).removeView(mBannerView);
////                            }
////
////                            if (!TextUtils.isEmpty(scenario)) {
////                                mBannerView.setScenario(scenario);
////                            }
////
////                            mActivity.addContentView(mBannerView, layoutParams);
////                        } else {
////                            MsgTools.printMsg("showBannerWithRect error  ..you must call loadBanner first, placementId >>>  " + mPlacementId);
////                        }
////                    }
////                });
////
////            } catch (Exception e) {
////                MsgTools.printMsg("showBannerWithRect error: " + e.getMessage());
////            }
////        } else {
////            MsgTools.printMsg("showBannerWithRect error without rect, placementId: " + mPlacementId);
////        }
//
//    }
//
//
//    public void showBannerWithPosition(final String position, final String scenario) {
//        MsgTools.printMsg("showBannerWithPostion: " + mPlacementId + ", position: " + position + ", scenario: " + scenario);
//        JSPluginUtil.runOnUiThread(new Runnable() {
//            @Override
//            public void run() {
//                if (mBannerView != null) {
//                    int width = 0;
//                    int height = 0;
//                    if (mBannerView.getLayoutParams() != null) {
//                        width = mBannerView.getLayoutParams().width;
//                        height = mBannerView.getLayoutParams().height;
//                    }
//                    FrameLayout.LayoutParams layoutParams = new FrameLayout.LayoutParams(width, height);
//                    if ("top".equals(position)) {
//                        layoutParams.gravity = Gravity.CENTER_HORIZONTAL | Gravity.TOP;
//                    } else {
//                        layoutParams.gravity = Gravity.CENTER_HORIZONTAL | Gravity.BOTTOM;
//                    }
//                    if (mBannerView.getParent() != null) {
//                        ((ViewGroup) mBannerView.getParent()).removeView(mBannerView);
//                    }
//
//                    if (!TextUtils.isEmpty(scenario)) {
//                        mBannerView.setScenario(scenario);
//                    }
//
//                    mActivity.addContentView(mBannerView, layoutParams);
//                } else {
//                    MsgTools.printMsg("showBannerWithPostion error  ..you must call loadBanner first, placementId: " + mPlacementId);
//                }
//
//            }
//        });
//    }
//
//    public void reshowBanner() {
//        MsgTools.printMsg("reshowBanner: " + mPlacementId);
//        JSPluginUtil.runOnUiThread(new Runnable() {
//            @Override
//            public void run() {
//                if (mBannerView != null) {
//                    mBannerView.setVisibility(View.VISIBLE);
//                } else {
//                    MsgTools.printMsg("reshowBanner error  ..you must call loadBanner first, placementId: " + mPlacementId);
//                }
//            }
//        });
//    }
//
//    public void hideBanner() {
//        MsgTools.printMsg("hideBanner: " + mPlacementId);
//        JSPluginUtil.runOnUiThread(new Runnable() {
//            @Override
//            public void run() {
//                if (mBannerView != null) {
//                    mBannerView.setVisibility(View.GONE);
//                } else {
//                    MsgTools.printMsg("hideBanner error  ..you must call loadBanner first, placementId: " + mPlacementId);
//                }
//
//            }
//        });
//    }
//
//    public void removeBanner() {
//        MsgTools.printMsg("removeBanner: " + mPlacementId);
//        JSPluginUtil.runOnUiThread(new Runnable() {
//            @Override
//            public void run() {
//                if (mBannerView != null && mBannerView.getParent() != null) {
//                    MsgTools.printMsg("removeBanner2 placementId: " + mPlacementId);
//                    ViewParent viewParent = mBannerView.getParent();
//                    ((ViewGroup) viewParent).removeView(mBannerView);
//                } else {
//                    MsgTools.printMsg("removeBanner3 >>> no banner need to be removed, placementId: " + mPlacementId);
//                }
//            }
//        });
//    }
//
//    public boolean isAdReady() {
//        if (mBannerView != null) {
//            TUAdStatusInfo atAdStatusInfo = mBannerView.checkAdStatus();
//            if (atAdStatusInfo != null) {
//                boolean isReady = atAdStatusInfo.isReady();
//                MsgTools.printMsg("banner isAdReady: " + mPlacementId + "：" + isReady);
//            }
//        }
//        return isReady;
//    }
//
//    public String checkAdStatus() {
//        MsgTools.printMsg("banner checkAdStatus: " + mPlacementId);
//
//        if (mBannerView != null) {
//            TUAdStatusInfo atAdStatusInfo = mBannerView.checkAdStatus();
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
//    public int dip2px(int dipValue) {
//        float scale = mActivity.getResources().getDisplayMetrics().density;
//        MsgTools.printMsg("横幅广告scale"+scale);
//        return (int) (dipValue * scale + 0.5f);
//    }
//}
