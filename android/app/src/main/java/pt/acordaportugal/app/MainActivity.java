package pt.acordaportugal.app;

import android.os.Bundle;
import android.webkit.WebStorage;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.clearCache(true);
            }
            WebStorage.getInstance().deleteAllData();
        } catch (Exception ignored) {}
    }
}
