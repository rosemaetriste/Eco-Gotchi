import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";
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
  errorFade: "rgba(192,57,43,0.12)",
};

export default function EnterNewPasswordScreen() {
  const router = useRouter();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Animated values
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(24)).current;
  const logoY = useRef(new Animated.Value(-4)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const glowNew = useRef(new Animated.Value(0)).current;
  const glowConfirm = useRef(new Animated.Value(0)).current;

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

  // ── Focus glow ──────────────────────────────────────────────────────────────
  const animateGlow = (anim, focused) =>
    Animated.timing(anim, {
      toValue: focused ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();

  const handleFocus = (field) => {
    setFocusedField(field);
    animateGlow(field === "new" ? glowNew : glowConfirm, true);
  };

  const handleBlur = (field) => {
    setFocusedField(null);
    animateGlow(field === "new" ? glowNew : glowConfirm, false);
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

  // ── Derived state ───────────────────────────────────────────────────────────
  const passwordValid = newPassword.length >= 6;
  const passwordsMatch =
    newPassword === confirmPassword && confirmPassword.length > 0;

  const showNewError = newPassword.length > 0 && !passwordValid;
  const showMatchError = confirmPassword.length > 0 && !passwordsMatch;

  if (!fontsLoaded) return null;

  // Interpolations helper
  const makeInputStyle = (glow, hasError) => ({
    borderColor: glow.interpolate({
      inputRange: [0, 1],
      outputRange: [
        hasError ? COLOR.error : "rgba(200,210,200,0.6)",
        hasError ? COLOR.error : COLOR.green,
      ],
    }),
    shadowColor: hasError ? COLOR.error : COLOR.green,
    shadowOpacity: glow.interpolate({
      inputRange: [0, 1],
      outputRange: [hasError ? 0.12 : 0, 0.22],
    }),
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  });

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
              <Text style={styles.headline}>New</Text>
              <Text style={[styles.headline, styles.headlineAccent]}>
                Password
              </Text>
            </View>

            {/* ── Subheadline ────────────────────────────────────────────── */}
            <Text style={styles.subheadline}>
              Must be different from your{"\n"}previously used passwords.
            </Text>

            {/* ── Form card ──────────────────────────────────────────────── */}
            <View style={styles.formCard}>
              <View style={styles.cardAccentBar} />

              {/* New Password */}
              <Text style={styles.label}>New Password</Text>

              <Animated.View
                style={[
                  styles.inputWrapper,
                  makeInputStyle(glowNew, showNewError),
                  { elevation: focusedField === "new" ? 6 : 2 },
                ]}
              >
                <Text style={styles.inputIcon}>🔒</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor={COLOR.brownFade}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNew}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => handleFocus("new")}
                  onBlur={() => handleBlur("new")}
                />

                <TouchableOpacity
                  onPress={() => setShowNew((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showNew ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={COLOR.brownLight}
                  />
                </TouchableOpacity>
              </Animated.View>

              {/* Strength hint */}
              <Text
                style={[styles.helperText, showNewError && styles.helperError]}
              >
                {showNewError
                  ? "⚠ Must be at least 6 characters"
                  : newPassword.length >= 6
                    ? "✓ Looks good!"
                    : "At least 6 characters required"}
              </Text>

              {/* Confirm Password */}
              <Text style={[styles.label, { marginTop: 10 }]}>
                Confirm Password
              </Text>

              <Animated.View
                style={[
                  styles.inputWrapper,
                  makeInputStyle(glowConfirm, showMatchError),
                  { elevation: focusedField === "confirm" ? 6 : 2 },
                ]}
              >
                <Text style={styles.inputIcon}>🔑</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor={COLOR.brownFade}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => handleFocus("confirm")}
                  onBlur={() => handleBlur("confirm")}
                />

                <TouchableOpacity
                  onPress={() => setShowConfirm((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showConfirm ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={COLOR.brownLight}
                  />
                </TouchableOpacity>
              </Animated.View>

              <Text
                style={[
                  styles.helperText,
                  showMatchError && styles.helperError,
                ]}
              >
                {showMatchError
                  ? "⚠ Passwords do not match"
                  : passwordsMatch
                    ? "✓ Passwords match!"
                    : "Both passwords must match"}
              </Text>

              {/* Reset button */}
              <Animated.View
                style={[
                  styles.buttonOuter,
                  { transform: [{ scale: buttonScale }], marginTop: 10 },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.92}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={() => router.push("/(tabs)/reset-password")}
                  style={styles.buttonTouchable}
                >
                  <ImageBackground
                    source={require("../../assets/images/green-dialogue.png")}
                    style={styles.buttonBackground}
                    resizeMode="stretch"
                  >
                    <Text style={styles.buttonText}>RESET PASSWORD</Text>
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
    marginTop: -30,
  },

  headlineBlock: {
    alignItems: "center",
    marginTop: -40,
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
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

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
    fontSize: 15,
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: COLOR.brown,
    fontFamily: "System",
  },

  helperText: {
    fontFamily: "System",
    fontSize: 11,
    color: COLOR.brownFade,
    marginTop: 6,
    marginLeft: 4,
    marginBottom: 4,
  },

  helperError: {
    color: COLOR.error,
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