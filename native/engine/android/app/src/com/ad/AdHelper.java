//package com.ad;
//
//import static com.thinkup.core.api.DeviceDataInfo.GAID;
//
//import android.content.Context;
//
//import com.cocos.lib.CocosHelper;
//import com.cocos.lib.JsbBridgeWrapper;
//import com.ad.MsgTools;
//import com.thinkup.core.api.TUSDK;
//
//public class AdHelper {
//    private String appId = "h686f901e4e5c3";
//    private String appKey = "a0d865312ac4c82c281147861e8d5a471";
//    /**横幅广告id*/
//    private String bannerId = "";
//    /**激励视频广告id*/
//    private String videoId = "n686f903552e3a";
//    /**插屏广告id*/
//    private String interstitialId = "n686f902c19f10";
//
//    private final RewardVideoHelper rewardVideo = new RewardVideoHelper();
//    private InterstitialHelper interstitial = new InterstitialHelper();
//    private BannerHelper banner = new BannerHelper();
//    public void init(Context context){
//        //初始化topon广告
//        TUSDK.init(context, appId, appKey);
////        ATDebuggerUITest.showDebuggerUI(context);
////        ATSDK.setDebuggerConfig(context, GAID, new ATDebuggerConfig.Builder(Ironsource_NETWORK).build());
//        this.bindEvent();
//    }
//
//    private  void bindEvent(){
//        JsbBridgeWrapper jbw = JsbBridgeWrapper.getInstance();
//
////        jbw.addScriptEventListener("loadRewardVideo",this::loadVideo);
////        jbw.addScriptEventListener("showRewardVideo",this::showVideo);
//
//        jbw.addScriptEventListener("loadInterstitial",this::loadInterstitial);
//        jbw.addScriptEventListener("showInterstitial",this::showInterstitial);
//
////        jbw.addScriptEventListener("loadBanner",this::loadBanner);
////        jbw.addScriptEventListener("showBanner",this::showBanner);
////        jbw.addScriptEventListener("hideBanner",this::hideBanner);
//    }
//    /**加载激励视频广告*/
//    private void loadVideo(String s){
//        MsgTools.printMsg("将要加载激励视频广告");
//        rewardVideo.load(videoId);
//
//    }
//    /**显示激励视频广告*/
//    private void showVideo(String s) {
//        MsgTools.printMsg("将要显示激励视频广告");
//        rewardVideo.showVideo("");
//
//    }
//
//    /**加载插屏广告*/
//    private void loadInterstitial(String s){
//        MsgTools.printMsg("将要加载插屏广告");
//        interstitial.loadInterstitial(interstitialId,"");
//    }
//    /**显示插屏广告*/
//    private void showInterstitial(String s){
//        MsgTools.printMsg("将要显示插屏广告");
//        interstitial.showInterstitial(interstitialId);
//    }
//
//    /**加载横幅广告*/
//    private void loadBanner(String s){
//        MsgTools.printMsg("将要加载横幅广告");
//        banner.loadBanner(bannerId,"");
//    }
//    /**显示横幅广告*/
//    private void showBanner(String s){
//        MsgTools.printMsg("将要显示横幅广告");
//        banner.showBannerWithPosition("","");
////        banner.reshowBanner();
//    }
//    /**隐藏横幅广告*/
//    private void hideBanner(String s){
//        MsgTools.printMsg("将要隐藏横幅广告");
//        banner.hideBanner();
//    }
//
//
//}
