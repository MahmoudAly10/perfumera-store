import { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Linking,
  Platform,
  StatusBar as RNStatusBar,
  Share,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import Constants from "expo-constants";
import {
  ShoppingBag,
  RefreshCw,
  Share2,
  Home,
  ChevronLeft,
  ChevronRight,
  X,
  Wifi,
  WifiOff,
} from "lucide-react-native";

const SHOP_URL =
  Constants.expoConfig?.extra?.shopUrl || "https://ocqnqqqlfxbrv.space.minimax.io/";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const webRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  // Show custom splash for ~1.2s, then hide
  useEffect(() => {
    const t = setTimeout(async () => {
      setShowSplash(false);
      try {
        await SplashScreen.hideAsync();
      } catch {}
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    webRef.current?.reload();
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const goHome = useCallback(() => {
    webRef.current?.injectJavaScript(
      `window.location.href = ${JSON.stringify(SHOP_URL)}; true;`
    );
  }, []);

  const goBack = useCallback(() => {
    if (canGoBack) webRef.current?.goBack();
  }, [canGoBack]);

  const goForward = useCallback(() => {
    if (canGoForward) webRef.current?.goForward();
  }, [canGoForward]);

  const onShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Check out Perfumeria — curated niche & designer fragrances. ${SHOP_URL}`,
        url: SHOP_URL,
      });
    } catch {}
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        {showSplash ? (
          <SplashView />
        ) : (
          <>
            <Header onShare={onShare} isOnline={isOnline} />

            {/* Progress bar */}
            {loading && progress < 1 && (
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.round(progress * 100)}%` },
                  ]}
                />
              </View>
            )}

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#b08a3e"
                />
              }
              style={styles.webScroll}
            >
              <WebView
                ref={webRef}
                source={{ uri: SHOP_URL }}
                style={styles.web}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onLoadProgress={({ nativeEvent }) =>
                  setProgress(nativeEvent.progress)
                }
                onNavigationStateChange={(nav) => {
                  setCanGoBack(nav.canGoBack);
                  setCanGoForward(nav.canGoForward);
                }}
                onError={() => setIsOnline(false)}
                onHttpError={() => setIsOnline(false)}
                onShouldStartLoadWithRequest={(req) => {
                  // Open external links in the system browser instead of inside the app
                  if (
                    req.url.startsWith("http") &&
                    !req.url.startsWith(SHOP_URL)
                  ) {
                    Linking.openURL(req.url).catch(() => {});
                    return false;
                  }
                  return true;
                }}
                javaScriptEnabled
                domStorageEnabled
                cacheEnabled
                allowsBackForwardNavigationGestures={Platform.OS === "ios"}
                decelerationRate="normal"
                pullToRefreshEnabled={Platform.OS === "ios"}
                renderError={() => (
                  <View style={styles.errorState}>
                    <WifiOff size={32} color="#8a8a8a" />
                    <Text style={styles.errorTitle}>Connection lost</Text>
                    <Text style={styles.errorText}>
                      Check your internet and try again.
                    </Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
                      <RefreshCw size={14} color="#fff" />
                      <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                )}
                startInLoadingState
                scalesPageToFit={false}
                mixedContentMode="compatibility"
                setSupportMultipleWindows={false}
              />
            </ScrollView>

            {/* Bottom tab bar */}
            <View style={styles.tabBar}>
              <TabButton
                icon={<ChevronLeft size={22} color={canGoBack ? "#1a1a1a" : "#c5bda9"} />}
                label="Back"
                onPress={goBack}
                disabled={!canGoBack}
              />
              <TabButton
                icon={<Home size={20} color="#1a1a1a" />}
                label="Home"
                onPress={goHome}
              />
              <TabButton
                icon={<RefreshCw size={20} color="#1a1a1a" />}
                label="Reload"
                onPress={onRefresh}
              />
              <TabButton
                icon={<ChevronRight size={22} color={canGoForward ? "#1a1a1a" : "#c5bda9"} />}
                label="Forward"
                onPress={goForward}
                disabled={!canGoForward}
              />
              <TabButton
                icon={<Share2 size={20} color="#1a1a1a" />}
                label="Share"
                onPress={onShare}
              />
            </View>
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function Header({
  onShare,
  isOnline,
}: {
  onShare: () => void;
  isOnline: boolean;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.brandDot} />
        <View>
          <Text style={styles.brandName}>Perfumeria</Text>
          <Text style={styles.brandTagline}>A library of scent</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        {isOnline ? (
          <View style={styles.statusPill}>
            <Wifi size={12} color="#4a5d3a" />
            <Text style={styles.statusText}>Live</Text>
          </View>
        ) : (
          <View style={[styles.statusPill, styles.statusOffline]}>
            <WifiOff size={12} color="#b85c6e" />
            <Text style={[styles.statusText, { color: "#b85c6e" }]}>Offline</Text>
          </View>
        )}
        <TouchableOpacity style={styles.iconBtn} onPress={onShare}>
          <Share2 size={18} color="#1a1a1a" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TabButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.tabBtn, disabled && { opacity: 0.4 }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon}
      <Text style={styles.tabLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function SplashView() {
  return (
    <View style={styles.splash}>
      <View style={styles.splashLogo}>
        <Text style={styles.splashMark}>P</Text>
      </View>
      <Text style={styles.splashTitle}>Perfumeria</Text>
      <Text style={styles.splashSub}>Curated niche & designer fragrances</Text>
      <View style={{ marginTop: 28 }}>
        <ActivityIndicator color="#b08a3e" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#faf7f2" },
  scrollContent: { flexGrow: 1 },
  webScroll: { flex: 1 },
  web: { flex: 1, minHeight: 600, backgroundColor: "transparent" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#faf7f2",
    borderBottomWidth: 1,
    borderBottomColor: "#e5dccf",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    fontSize: 18,
    color: "#1a1a1a",
    letterSpacing: -0.2,
  },
  brandTagline: {
    fontSize: 10,
    color: "#8a8a8a",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#e8efe1",
    borderRadius: 999,
  },
  statusOffline: { backgroundColor: "#f7e1e4" },
  statusText: { fontSize: 10, fontWeight: "600", color: "#4a5d3a", letterSpacing: 0.4 },
  iconBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: "#f1ebe0",
  },

  // Progress
  progressBar: {
    height: 2,
    backgroundColor: "#f1ebe0",
    width: "100%",
  },
  progressFill: {
    height: 2,
    backgroundColor: "#b08a3e",
  },

  // Tab bar
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: "#faf7f2",
    borderTopWidth: 1,
    borderTopColor: "#e5dccf",
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 10,
    color: "#1a1a1a",
    marginTop: 2,
    letterSpacing: 0.4,
  },

  // Error state
  errorState: {
    paddingVertical: 60,
    alignItems: "center",
    backgroundColor: "#faf7f2",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginTop: 12,
  },
  errorText: {
    fontSize: 13,
    color: "#8a8a8a",
    marginTop: 4,
    marginBottom: 20,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#1a1a1a",
    borderRadius: 4,
  },
  retryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // Splash
  splash: {
    flex: 1,
    backgroundColor: "#faf7f2",
    alignItems: "center",
    justifyContent: "center",
  },
  splashLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  splashMark: {
    color: "#b08a3e",
    fontSize: 38,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    fontWeight: "500",
  },
  splashTitle: {
    color: "#1a1a1a",
    fontSize: 30,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
    letterSpacing: -0.5,
  },
  splashSub: {
    color: "#8a8a8a",
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 6,
  },
});
