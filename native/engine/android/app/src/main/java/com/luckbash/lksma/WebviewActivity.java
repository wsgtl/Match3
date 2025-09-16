package com.luckbash.lksma;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.ImageButton;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.jackpot.nezhaslotsqq.R;


public class WebviewActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_webview);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        // 找到按钮
        ImageButton button = findViewById(R.id.btn_back);

        // 设置点击事件
        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // 在这里处理点击事件
                Log.d("button","点击了按钮");
                finish();
            }
        });

        this.initWebview();
    }
    void initWebview(){
        // 初始化WebView
        WebView webView = findViewById(R.id.webview);
        // 配置WebView设置
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true); // 启用JavaScript
        webSettings.setDomStorageEnabled(true); // 启用DOM存储
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT); // 缓存策略
        webSettings.setLoadWithOverviewMode(true); // 缩放至屏幕大小
        webSettings.setUseWideViewPort(true); // 使用宽视口

        // 设置WebViewClient以在应用内打开链接
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });

        // 加载URL
        webView.loadUrl("https://ppcq021202.minigame.vip");
    }
}