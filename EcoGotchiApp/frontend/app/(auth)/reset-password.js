import * as Font from "expo-font";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";

const { width, height } = Dimensions.get("window");
const OTP_LENGTH = 6;

// ─── Design tokens ────────────────────────────────────────────────────────────
const COLOR = {
  brown: "#422F21",
  brownLight: "#7A5C4A",
  brownFade: "rgba(91,63,45,0.38)",
  green: "#4EC882",
  greenDark: "#2E9E60",
  white: "#FFFFFF",
  card: "rgba(255,255,255,0.55)",
  cardBorder: "rgba(255,255,255,0.72)",
  inputBg: "#FAFFF8",
  shadow: "#000",
  error: "#C0392B",
};

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const inputRefs = useRef([]);

  // Animated values
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(24)).current;
  const logoY = useRef(new Animated.Value(-4)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const glows = useRef(
    Array.from({ length: OTP_LENGTH }, () => new Animated.Value(0)),
  ).current;

  // ── Font loading ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync({
          "Tiny5-Regular": require("../../assets/fonts/Tiny5-Regular.ttf"),
        });
      } catch (e) {
        console.warn("Font loading failed", e);
      } finally {
        setFontsLoaded(true);
      }
    })();
  }, []);

  // ── Entry animations ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!fontsLoaded) return;

    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(logoY, {
          toValue: 4,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoY, {
          toValue: -4,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [fontsLoaded]);

  // ── Per-box focus glow ──────────────────────────────────────────────────────
  const handleFocus = (index) => {
    setFocusedIndex(index);
    Animated.timing(glows[index], {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = (index) => {
    setFocusedIndex(null);
    Animated.timing(glows[index], {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // ── OTP input logic ─────────────────────────────────────────────────────────
  const handleOtpChange = (value, index) => {
    const cleaned = value.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);
    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ── API configuration ──────────────────────────────────────────────────────
  const getApiBaseUrl = () => {
    const extraApi =
      Constants.manifest?.extra?.API_BASE_URL ||
      Constants.expoConfig?.extra?.API_BASE_URL ||
      null;
    if (extraApi) return extraApi;

    const dbgHost = Constants.manifest?.debuggerHost;
    const hostFromDbg = dbgHost ? dbgHost.split(":")[0] : null;

    if (Platform.OS === "android") {
      if (hostFromDbg) return `http://${hostFromDbg}:4000`;
      return "http://10.0.2.2:4000";
    }

    const host = hostFromDbg || "localhost";
    return `http://${host}:4000`;
  };

  // ── Confirm OTP ────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    const otpString = otp.join("");
    if (otpString.length !== OTP_LENGTH) {
      Alert.alert("Incomplete", "Please enter all 6 digits of the OTP.");
      return;
    }

    if (!email) {
      Alert.alert("Error", "Email not found. Please go back and try again.");
      return;
    }

    setVerifying(true);
    const API_BASE_URL = getApiBaseUrl();

    try {
      console.log(`Verifying OTP ${otpString} for ${email}`);
      const resp = await fetch(`${API_BASE_URL}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otpString }),
      });

      let payload = null;
      try {
        payload = await resp.json();
      } catch (jsonErr) {
        console.warn("Failed to parse response", jsonErr);
      }

      if (resp.ok) {
        console.log("OTP verified successfully!");
        Alert.alert("Success", "OTP verified! Now set your new password.");
        router.push({
          pathname: "/enter-password",
          params: { email: email.trim() },
        });
      } else {
        const errorMsg = payload?.error || "Invalid OTP. Please try again.";
        Alert.alert("Verification Failed", errorMsg);
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      Alert.alert("Error", "Failed to verify OTP. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // ── Button press ────────────────────────────────────────────────────────────
  const handlePressIn = () =>
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();

  const handlePressOut = () =>
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 5,
      tension: 140,
      useNativeDriver: true,
    }).start();

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* ── Background ───────────────────────────────────────────────────── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Image
          source={require("../../assets/images/blue_bg.png")}
          style={styles.bgImage}
          resizeMode="cover"
        />
        <View style={styles.bgVignette} />
      </View>

      {/* ── Back button ──────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.75}
        onPress={() => router.back()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.inner,
              { opacity: fadeIn, transform: [{ translateY: slideUp }] },
            ]}
          >
            {/* ── Logo ───────────────────────────────────────────────────── */}
            <Animated.View style={{ transform: [{ translateY: logoY }] }}>
              <Image
                source={require("../../assets/images/ecogotchi_logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </Animated.View>

            {/* ── Headline ───────────────────────────────────────────────── */}
            <View style={styles.headlineBlock}>
              <Text style={styles.headline}>Enter</Text>
              <Text style={[styles.headline, styles.headlineAccent]}>
                OTP Code
              </Text>
            </View>

            {/* ── Subheadline ────────────────────────────────────────────── */}
            <Text style={styles.subheadline}>
              Enter the pin code sent to your email{"\n"}to confirm your
              identity.
            </Text>

            {/* ── Form card ──────────────────────────────────────────────── */}
            <View style={styles.formCard}>
              <View style={styles.cardAccentBar} />

              <Text style={styles.label}>6-Digit Code</Text>

              {/* OTP boxes */}
              <View style={styles.otpRow}>
                {otp.map((digit, index) => {
                  const borderColor = glows[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: ["rgba(200,210,200,0.6)", COLOR.green],
                  });
                  const shadowOpacity = glows[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.25],
                  });

                  return (
                    <Animated.View
                      key={index}
                      style={[
                        styles.otpBoxWrapper,
                        {
                          borderColor,
                          shadowColor: COLOR.green,
                          shadowOpacity,
                          shadowRadius: 10,
                          shadowOffset: { width: 0, height: 0 },
                          elevation: focusedIndex === index ? 6 : 2,
                        },
                      ]}
                    >
                      <TextInput
                        ref={(ref) => (inputRefs.current[index] = ref)}
                        style={styles.otpInput}
                        value={digit}
                        onChangeText={(val) => handleOtpChange(val, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        onFocus={() => handleFocus(index)}
                        onBlur={() => handleBlur(index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        textAlign="center"
                        selectionColor={COLOR.green}
                      />
                    </Animated.View>
                  );
                })}
              </View>

              {/* Resend row */}
              <View style={styles.resendRow}>
                <Text style={styles.resendText}>Didn't receive OTP? </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => console.log("Resend OTP")}
                >
                  <Text style={styles.resendLink}>Resend Code</Text>
                </TouchableOpacity>
              </View>

              {/* Confirm button */}
              <Animated.View
                style={[
                  styles.buttonOuter,
                  { transform: [{ scale: buttonScale }] },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.92}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={handleConfirm}
                  disabled={verifying}
                  style={styles.buttonTouchable}
                >
                  <ImageBackground
                    source={require("../../assets/images/green-dialogue.png")}
                    style={styles.buttonBackground}
                    resizeMode="stretch"
                  >
                    <Text style={styles.buttonText}>
                      {verifying ? "VERIFYING..." : "CONFIRM"}
                    </Text>
                  </ImageBackground>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#E8F8EF",
  },
  bgImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  bgVignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(220,245,230,0.18)",
  },
  backButton: {
    position: "absolute",
    top: 58,
    left: 20,
    zIndex: 20,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.88)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLOR.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backArrow: {
    fontSize: 22,
    color: COLOR.brown,
    marginTop: -1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
  },
  inner: {
    width: "100%",
    alignItems: "center",
  },
  logoImage: {
    width: width * 0.38,
    aspectRatio: 1,
    maxHeight: 200,
    marginTop: -20,
  },
  headlineBlock: {
    alignItems: "center",
    marginTop: -40,
    marginBottom: 6,
  },
  headline: {
    fontFamily: "System",
    fontSize: 36,
    fontWeight: "900",
    color: COLOR.brown,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  headlineAccent: {
    color: COLOR.greenDark,
  },
  subheadline: {
    fontFamily: "System",
    fontSize: 14,
    lineHeight: 20,
    color: COLOR.brownLight,
    textAlign: "center",
    marginBottom: 26,
    paddingHorizontal: 40,
    opacity: 0.85,
  },
  formCard: {
    width: width * 0.84,
    backgroundColor: COLOR.card,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: COLOR.cardBorder,
    paddingHorizontal: 22,
    paddingBottom: 26,
    paddingTop: 20,
    alignItems: "stretch",
    shadowColor: COLOR.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
    overflow: "hidden",
  },
  cardAccentBar: {
    position: "absolute",
    top: 0,
    left: 28,
    right: 28,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: COLOR.green,
    opacity: 0.7,
  },
  label: {
    fontFamily: "System",
    fontSize: 12,
    fontWeight: "600",
    color: COLOR.brownLight,
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 6,
  },
  otpBoxWrapper: {
    flex: 1,
    height: 62,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: COLOR.inputBg,
    justifyContent: "center",
    alignItems: "center",
  },
  otpInput: {
    width: "100%",
    height: "100%",
    fontSize: 26,
    fontWeight: "700",
    color: COLOR.brown,
    textAlign: "center",
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 20,
  },
  resendText: {
    fontFamily: "System",
    fontSize: 13,
    color: COLOR.brownLight,
  },
  resendLink: {
    fontFamily: "System",
    fontSize: 13,
    fontWeight: "700",
    color: COLOR.greenDark,
    textDecorationLine: "underline",
  },
  buttonOuter: {
    width: "100%",
    shadowColor: COLOR.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonTouchable: {
    width: "100%",
    height: 64,
    borderRadius: 18,
    overflow: "hidden",
  },
  buttonBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "Tiny5-Regular",
    fontSize: 19,
    color: COLOR.white,
    letterSpacing: 2,
    paddingTop: 5,
    paddingLeft: 8,
    textShadowColor: "rgba(0,0,0,0.18)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
