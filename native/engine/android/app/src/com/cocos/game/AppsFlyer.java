package com.cocos.game;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import androidx.annotation.NonNull;

import com.appsflyer.AFInAppEventParameterName;
import com.appsflyer.AppsFlyerLib;
import com.appsflyer.attribution.AppsFlyerRequestListener;
import com.cocos.lib.JsbBridgeWrapper;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class AppsFlyer
{
    private String Tag = "afEvent";
    private Activity mApplication = null;
    /**af的key*/
    private String AfDevKey = "bczkaJCR5tXG4VETeTA2Ea";
    /**af初始化*/
    public void init(Activity application){
        mApplication = application;
        Log.d(Tag, "AppsFlyerLib init key:"+AfDevKey);
        AppsFlyerLib.getInstance().init(AfDevKey, null, mApplication);
//        AppsFlyerLib.getInstance().start(this);
        AppsFlyerLib.getInstance().start(mApplication, AfDevKey, new AppsFlyerRequestListener() {
            @Override
            public void onSuccess() {
                Log.d(Tag, "AppsFlyerLib start success");
            }

            @Override
            public void onError(int i, @NonNull String s) {
                Log.d(Tag, "AppsFlyerLib start failed, code: " + i + " msg: " + s);
            }
        });


        JsbBridgeWrapper jbw = JsbBridgeWrapper.getInstance();
        jbw.addScriptEventListener("sendEvent",this::sendEvent);
    }
    /**埋点上报*/
    public void sendEvent(String data) {
        Log.d(Tag, "=====data:" + data);
        Map<String, Object> m_data = new HashMap<String, Object>();
        try {
            JSONObject json = new JSONObject(data);
            Iterator it = json.keys();
            String eventType = "";
            while (it.hasNext()) {
                String key = it.next().toString();
                Object value = json.get(key);
//                Log.d(Tag, "key" + key+"  value"+value);
                if (key.equals("event_type")) {
                    eventType = value.toString();
                } else {
                    m_data.put(key, value);
                }
            }

            if (!eventType.equals("")) {
                Log.d(Tag, "appsflyer事件:" + eventType);
                Log.d(Tag, m_data.toString());
                this.baseSendEvent(eventType,m_data);
            }
        } catch (JSONException e) {
            e.printStackTrace();
            Log.d(Tag,  e.toString());
        }

    }
    private  void baseSendEvent(String eventType,Map<String,Object> data){
        AppsFlyerLib.getInstance().logEvent(mApplication, eventType, data, new AppsFlyerRequestListener() {
            @Override
            public void onSuccess() {
                Log.d(Tag, "Event sent successfully   eventType:"+eventType+"  data:" + data);
            }

            @Override
            public void onError(int i, @NonNull String s) {
                Log.d(Tag, "Event failed to be sent:\n" +
                        "Error code: " + i + "\n"
                        + "Error description: " + s + "    eventType:"+eventType+"  data:" + data);
            }
        });
    }
    /**广告上报*/
    public void sendEventAd(String network,String format, Double revenue){
        Log.e(Tag,"ad_network_name:"+network+"  ad_format:"+format+"  revenue:"+revenue);
        Map<String,Object> data = new HashMap<String, Object>();
        data.put(AFInAppEventParameterName.CURRENCY, "USD");
        data.put(AFInAppEventParameterName.REVENUE, revenue+"");
        data.put("ad_network_name",network);
        data.put("ad_format",format);
        this.baseSendEvent("af_ad_revenue_custom",data);
    }

/** 持久化记录 用户收入上报 5 10 20*/
    private static final String PREF_NAME = "ad_watch_pref";
    private static final String KEY_AD_COUNT = "ad_watch_count";
    private static final String KEY_AD_TOTAL_REVENUE = "ad_total_revenue";

    public enum KwaiEventActionType {
        AdShowCount(1),            // 用户总广告展示次数
        AdCpmThreshold(2),         // 用户变现cpm达到多少美元
        RewardVideoCount(3),       // 激励视频广告展示次数
        FirstDayRevenue(4),        // 首日变现收益达到值
        FeatureUsage(5),           // 核心功能使用次数
        UserLevel(6),              // 达到某等级
        LevelPass(7);              // 通关某一关

        private final int value;

        KwaiEventActionType(int value) {
            this.value = value;
        }

        public int getValue() {
            return value;
        }

        @Override
        public String toString() {
            return String.valueOf(value);
        }
    }
 /** 广告请求埋点 */
    public void sendAdRequestedEvent(String placement, String adType) {
        Log.d(Tag, "上报广告请求事件: placement=" + placement + ", ad_type=" + adType);
        Map<String, Object> data = new HashMap<>();
        data.put("placement", placement);
        data.put("ad_type", adType);
        this.baseSendEvent("ad_requested", data);
    }

    /** 广告展示埋点 */
    public void sendAdShownEvent(String placement, String adType) {
        Log.d(Tag, "上报广告展示事件: placement=" + placement + ", ad_type=" + adType);
        Map<String, Object> data = new HashMap<>();
        data.put("placement", placement);
        data.put("ad_type", adType);
        this.baseSendEvent("ad_shown", data);
    }

    /** 广告点击埋点 */
    public void sendAdClickedEvent(String placement, String adType) {
        Log.d(Tag, "上报广告点击事件: placement=" + placement + ", ad_type=" + adType);
        Map<String, Object> data = new HashMap<>();
        data.put("placement", placement);
        data.put("ad_type", adType);
        this.baseSendEvent("ad_clicked", data);
    }

    // 在AppsFlyer类里新增方法，保存当前placement，给上报用
    private static String currentAdPlacement = "unknown";

    private static String currentAdType = "unknown";

    public static void setCurrentAdInfo(String placement, String adType) {
        currentAdPlacement = placement;
        currentAdType = adType;
    }

    public static String getCurrentAdPlacement() {
        return currentAdPlacement;
    }

    public static String getCurrentAdType() {
        return currentAdType;
    }

        private SharedPreferences getPrefs() {
        return mApplication.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    public void recordAdRevenue(double revenue) {
        SharedPreferences prefs = getPrefs();
        int count = prefs.getInt(KEY_AD_COUNT, 0) + 1;
        float totalRevenue = prefs.getFloat(KEY_AD_TOTAL_REVENUE, 0f) + (float) revenue;

        // 保存更新
        prefs.edit()
                .putInt(KEY_AD_COUNT, count)
                .putFloat(KEY_AD_TOTAL_REVENUE, totalRevenue)
                .apply();

        // 打印累计进度
        Log.d(Tag, "广告累计进度：count=" + count+ " Revenue=" + revenue + " totalRevenue=" + totalRevenue);

        // 判断是否触发里程碑（5、10、20次）
        if (count == 5 || count == 10 || count == 20) {
            String milestoneEvent = "ipu_" + count;

            Map<String, Object> data = new HashMap<>();

            data.put("Event Revenue USD", String.format("%.6f", revenue));  // 单次广告收益
            data.put("Event Revenue", String.format("%.6f", totalRevenue)); // 累计广告收益

            data.put("kwai_key_event_action_type", KwaiEventActionType.AdShowCount.toString()); // 类型为广告展示次数累计

            data.put("kwai_key_event_action_value", String.valueOf(count)); // 当前达成的次数

            Log.d(Tag, "触发广告累计上报: " + milestoneEvent + " => " + data.toString());

            this.baseSendEvent(milestoneEvent, data);
        }
    }



    //    高价值用户数据上传
    private  String baseUrl ="http://click.dreamad.mobi/sdk/data";

    public void uploadAdInfoToServer(Context context,String gaid, double ecpm, String model, String adPlatform) {
        new Thread(() -> {
            try {
                // 获取包名和版本号
                String packageName = context.getPackageName();
                String versionName = context.getPackageManager()
                        .getPackageInfo(packageName, 0).versionName;
                String fullUrl = baseUrl
                        + "?gaid=" + URLEncoder.encode(gaid, "UTF-8")
                        + "&packageName=" + URLEncoder.encode(packageName, "UTF-8")
                        + "&version=" + URLEncoder.encode(versionName, "UTF-8")
                        + "&ecpm=" + ecpm
                        + "&model=" + URLEncoder.encode(model, "UTF-8")
                        + "&adPlatform=" + URLEncoder.encode(adPlatform, "UTF-8");

                Log.d(Tag, "上传广告信息请求: " + fullUrl);

                URL url = new URL(fullUrl);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);

                int code = conn.getResponseCode();
                Log.d(Tag, "广告数据上传响应码: " + code);
            } catch (Exception e) {
                Log.e(Tag, "上传广告信息失败: " + e.toString());
            }
        }).start();
    }

    static AppsFlyer mInstace = null;
    public static AppsFlyer getInstance() {
        if (null == mInstace) {
            mInstace = new AppsFlyer();
        }
        return mInstace;
    }
}
