package com.cocos.game;

import android.content.Context;
import android.util.Log;

import com.google.android.gms.ads.identifier.AdvertisingIdClient;

public class GAIDHelper {

    public interface GAIDCallback {
        void onGAIDAvailable(String gaid);
    }

    // 异步获取 GAID，避免在主线程报错
    public static void fetchGAID(final Context context, final GAIDCallback callback) {
        new Thread(() -> {
            try {
                AdvertisingIdClient.Info adInfo = AdvertisingIdClient.getAdvertisingIdInfo(context);
                String gaid = adInfo != null ? adInfo.getId() : "unknown";
                Log.d("GAID", "获取GAID成功: " + gaid);

                if (callback != null) {
                    callback.onGAIDAvailable(gaid);
                }

            } catch (Exception e) {
                Log.e("GAID", "获取GAID失败: " + e.toString());
                if (callback != null) {
                    callback.onGAIDAvailable("unknown");
                }
            }
        }).start();
    }
}
