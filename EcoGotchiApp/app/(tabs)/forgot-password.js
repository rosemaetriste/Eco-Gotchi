import * as Font from "expo-font";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

// ─── Design tokens ────────────────────────────────────────────────────────────
const COLOR = {
  brown:      "#422F21",
  brownLight: "#7A5C4A",
  brownFade:  "rgba(91,63,45,0.38)",
  green:      "#4EC882",
  greenGlow:  "rgba(78,200,130,0.28)",
  white:      "#FFFFFF",
  card:       "rgba(255,255,255,0.55)",
  cardBorder: "rgba(255,255,255,0.72)",
  inputBg:    "#FAFFF8",
  shadow:     "#000",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [email, setEmail]             = useState("");
  const [isFocused, setIsFocused]     = useState(false);

  // Animated values
  const fadeIn      = useRef(new Animated.Value(0)).current;
  const slideUp     = useRef(new Animated.Value(24)).current;
  const logoY       = useRef(new Animated.Value(-4)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const inputGlow   = useRef(new Animated.Value(0)).current;
  const labelSlide  = useRef(new Animated.Value(0)).current;

  // ── Font loading ─────────────────────────────────────────────────────────
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

  // ── Entry animations ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!fontsLoaded) return;

    // Fade + slide up the whole screen
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

    // Gentle logo float
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

  // ── Input focus glow ──────────────────────────────────────────────────────
  useEffect(() => {
    Animated.timing(inputGlow, {
      toValue: isFocused ? 1 : 0,
      duration: 250,
      useNativeDriver: false,   // border/shadow can't use native driver
    }).start();

    Animated.timing(labelSlide, {
      toValue: isFocused || email.length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, email]);

  // ── Button press ──────────────────────────────────────────────────────────
  const handlePressIn = () =>
    Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }).start();

  const handlePressOut = () =>
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 5,
      tension: 140,
      useNativeDriver: true,
    }).start();

  if (!fontsLoaded) return null;

  // Interpolations
  const borderColor = inputGlow.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(200,210,200,0.6)", COLOR.green],
  });

  const shadowOpacity = inputGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.22],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Background ─────────────────────────────────────────────────── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Image
          source={require("../../assets/images/blue_bg.png")}
          style={styles.bgImage}
          resizeMode="cover"
        />
        {/* Soft vignette overlay */}
        <View style={styles.bgVignette} />
      </View>

      {/* ── Back button ────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.75}
        onPress={() => router.back()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      {/* ── Scrollable content ─────────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
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

            {/* ── Logo ─────────────────────────────────────────────────── */}
            <Animated.View style={{ transform: [{ translateY: logoY }] }}>
              <Image
                source={require("../../assets/images/ecogotchi_logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </Animated.View>

            {/* ── Headline ─────────────────────────────────────────────── */}
            <View style={styles.headlineBlock}>
              <Text style={styles.headline}>Forgot</Text>
              <Text style={[styles.headline, styles.headlineAccent]}>
                Password?
              </Text>
            </View>

            {/* ── Subheadline ──────────────────────────────────────────── */}
            <Text style={styles.subheadline}>
              Enter your email and we'll send a{"\n"}pin code to confirm your identity.
            </Text>

            {/* ── Form card ────────────────────────────────────────────── */}
            <View style={styles.formCard}>

              {/* Decorative top accent line */}
              <View style={styles.cardAccentBar} />

              <Text style={styles.label}>Email Address</Text>

              <Animated.View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor,
                    shadowColor: COLOR.green,
                    shadowOpacity,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 0 },
                    elevation: isFocused ? 6 : 2,
                  },
                ]}
              >
                {/* Leading icon */}
                <Text style={styles.inputIcon}>✉</Text>

                <TextInput
                  style={styles.input}
                  placeholder="username@gmail.com"
                  placeholderTextColor={COLOR.brownFade}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />

                {/* Clear button */}
                {email.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setEmail("")}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.clearIcon}>✕</Text>
                  </TouchableOpacity>
                )}
              </Animated.View>

              {/* Helper text */}
              <Text style={styles.helperText}>
                We'll never share your email with anyone.
              </Text>

              {/* ── Send OTP Button ───────────────────────────────────── */}
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
                  onPress={() => router.push("/reset-password")}
                  style={styles.buttonTouchable}
                >
                  <ImageBackground
                    source={require("../../assets/images/green-dialogue.png")}
                    style={styles.buttonBackground}
                    resizeMode="stretch"
                  >
                    <Text style={styles.buttonText}>SEND OTP</Text>
                  </ImageBackground>
                </TouchableOpacity>
              </Animated.View>

              {/* ── Back to login link ─────────────────────────────────── */}
              <TouchableOpacity
                onPress={() => router.push("/login")}
                activeOpacity={0.7}
                style={styles.loginLinkRow}
              >
                <Text style={styles.loginLinkText}>
                  Remembered it?{" "}
                  <Text style={styles.loginLinkBold}>Back to Login</Text>
                </Text>
              </TouchableOpacity>

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

  // ── Background ──────────────────────────────────────────────────────────
  bgImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  bgVignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(220,245,230,0.18)",
  },

  // ── Back button ─────────────────────────────────────────────────────────
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
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 5,
  },

  backArrow: {
    fontSize: 22,
    color: COLOR.brown,
    marginTop: -1,
  },

  // ── Scroll / inner layout ────────────────────────────────────────────────
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 40,
  },

  inner: {
    width: "100%",
    alignItems: "center",
  },

  // ── Logo ─────────────────────────────────────────────────────────────────
  logoImage: {
    width: width * 0.38,
    aspectRatio: 1,
    maxHeight: 200,
    marginTop: -20,
  },

  // ── Headline ─────────────────────────────────────────────────────────────
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
    color: "#2E9E60",
  },

  // ── Subheadline ──────────────────────────────────────────────────────────
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

  // ── Form card ────────────────────────────────────────────────────────────
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

  // ── Label ────────────────────────────────────────────────────────────────
  label: {
    fontFamily: "System",
    fontSize: 12,
    fontWeight: "600",
    color: COLOR.brownLight,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // ── Input ────────────────────────────────────────────────────────────────
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 16,
    backgroundColor: COLOR.inputBg,
    paddingHorizontal: 14,
    height: 52,
  },

  inputIcon: {
    fontSize: 16,
    color: COLOR.brownFade,
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: COLOR.brown,
    fontFamily: "System",
  },

  clearIcon: {
    fontSize: 13,
    color: COLOR.brownFade,
    paddingLeft: 6,
  },

  helperText: {
    fontFamily: "System",
    fontSize: 11,
    color: COLOR.brownFade,
    marginTop: 7,
    marginLeft: 4,
    marginBottom: 20,
  },

  // ── Button ───────────────────────────────────────────────────────────────
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

  // ── Back to login link ───────────────────────────────────────────────────
  loginLinkRow: {
    marginTop: 18,
    alignItems: "center",
  },

  loginLinkText: {
    fontFamily: "System",
    fontSize: 13,
    color: COLOR.brownLight,
  },

  loginLinkBold: {
    fontWeight: "700",
    color: "#2E9E60",
  },
});