import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import Constants from "expo-constants";
import { Alert } from "react-native";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function SignUpScreen() {
  const router = useRouter();

  const [fontsLoaded, setFontsLoaded] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [accepted, setAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Validation States
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [termsError, setTermsError] = useState("");
  const [nameError, setNameError] = useState("");

  const fadeIn = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const logoY = useRef(new Animated.Value(-3)).current;

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          "Tiny5-Regular": require("../../assets/fonts/Tiny5-Regular.ttf"),
        });
      } catch (e) {
        console.warn("Font loading failed", e);
      } finally {
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(logoY, {
            toValue: 3,
            duration: 2500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(logoY, {
            toValue: -3,
            duration: 2500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(blink, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.delay(500),
          Animated.timing(blink, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.delay(500),
        ]),
      ).start();
    }
  }, [fontsLoaded]);

  const getApiBaseUrl = () => {
    const extraApi =
      Constants.manifest?.extra?.API_BASE_URL ||
      Constants.expoConfig?.extra?.API_BASE_URL ||
      null;
    if (extraApi) return extraApi;

    const dbgHost = Constants.manifest?.debuggerHost;
    const hostFromDbg = dbgHost ? dbgHost.split(":")[0] : null;
    const host = hostFromDbg || "localhost";
    return `http://${host}:4000`;
  };

  // Validation + backend signup
  const handleSignUp = async () => {
    let isValid = true;

    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setTermsError("");
    setNameError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      setNameError("Name is required.");
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError("Email address is required.");
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password.");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      isValid = false;
    }

    if (!accepted) {
      setTermsError("You must accept the terms to proceed.");
      isValid = false;
    }

    if (isValid) {
      try {
        const API_BASE_URL = getApiBaseUrl();
        const resp = await fetch(`${API_BASE_URL}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password, name: name.trim() }),
        });
        const payload = await resp.json();
        if (resp.ok) {
          Alert.alert("Success", "Account created. You can now log in.");
          router.push("/login");
        } else {
          Alert.alert(
            "Signup failed",
            payload.error || "Unable to create account",
          );
        }
      } catch (err) {
        console.error("Signup error", err);
        Alert.alert("Network error", "Unable to contact server.");
      }
    }
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FBF5" />

      {/* Background Layer */}
      <View style={styles.backgroundContainer}>
        <Image
          source={require("../../assets/images/blue_bg.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </View>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.75}
        onPress={() => router.push("/(auth)")}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.inner, { opacity: fadeIn }]}>
          {/* Logo */}
          <Animated.View style={{ transform: [{ translateY: logoY }] }}>
            <Image
              source={require("../../assets/images/ecogotchi_logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Headline */}
          <Text style={styles.headline}>New Here?</Text>

          <View style={styles.subheadlineContainer}>
            <Text style={styles.subheadline}>{"> SIGN UP "}</Text>

            <Animated.Text style={[styles.subheadline, { opacity: blink }]}>
              {"_"}
            </Animated.Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={[
                  styles.input,
                  nameError ? styles.inputErrorBorder : null,
                ]}
                placeholder="Your name"
                placeholderTextColor="rgba(91, 63, 45, 0.4)"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (nameError) setNameError("");
                }}
                autoCapitalize="words"
              />
              {nameError ? (
                <Text style={styles.errorText}>{nameError}</Text>
              ) : null}
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  emailError ? styles.inputErrorBorder : null,
                ]}
                placeholder="username@gmail.com"
                placeholderTextColor="rgba(91, 63, 45, 0.4)"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View
                style={[
                  styles.passwordContainer,
                  passwordError ? styles.inputErrorBorder : null,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••••••••••"
                  placeholderTextColor="rgba(91, 63, 45, 0.4)"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError("");
                  }}
                  secureTextEntry={!showPassword}
                />

                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#59483D"
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View
                style={[
                  styles.passwordContainer,
                  confirmPasswordError ? styles.inputErrorBorder : null,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••••••••••"
                  placeholderTextColor="rgba(91, 63, 45, 0.4)"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (confirmPasswordError) setConfirmPasswordError("");
                  }}
                  secureTextEntry={!showConfirmPassword}
                />

                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={22}
                    color="#59483D"
                  />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : null}
            </View>

            {/* Terms Checkbox */}
            <View style={styles.checkboxGroup}>
              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  onPress={() => {
                    setAccepted(!accepted);
                    if (termsError) setTermsError("");
                  }}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <View
                    style={[
                      styles.checkbox,
                      accepted && styles.checkboxChecked,
                      termsError ? styles.checkboxErrorBorder : null,
                    ]}
                  >
                    {accepted && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>

                <Text style={styles.checkboxText}>I accept the </Text>

                <TouchableOpacity
                  onPress={() => setShowTermsModal(true)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 15, bottom: 15, left: 5, right: 5 }}
                >
                  <Text style={styles.checkboxLink}>policy and terms</Text>
                </TouchableOpacity>

                <Text style={styles.checkboxText}>.</Text>
              </View>
              {termsError ? (
                <Text style={styles.errorTextTerms}>{termsError}</Text>
              ) : null}
            </View>

            {/* Submit Button & Switch Link */}
            <View style={styles.buttonZone}>
              <TouchableOpacity
                style={styles.buttonWrapper}
                activeOpacity={0.8}
                onPress={handleSignUp}
              >
                <ImageBackground
                  source={require("../../assets/images/green-dialogue.png")}
                  style={styles.buttonBackground}
                  resizeMode="stretch"
                >
                  <Text style={styles.buttonText}>START SPROUTING</Text>
                </ImageBackground>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/login")}
                style={styles.loginWrapper}
              >
                <Text style={styles.loginText}>
                  Already have an account?{" "}
                  <Text style={styles.loginLink}>Login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
      <Modal
        visible={showTermsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTermsModal(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Terms and Conditions</Text>
                <TouchableOpacity
                  onPress={() => setShowTermsModal(false)}
                  style={styles.modalCloseButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalDivider} />
              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={true}
              >
                <Section
                  number="1"
                  title="Acceptance of Terms"
                  body="By accessing Ecogotchi, you agree to be bound by these Terms and Conditions. This application is a tool for environmental awareness and gamified carbon tracking."
                />
                <Section
                  number="2"
                  title="Accuracy of Calculations"
                  body="Carbon savings are calculated based on standardized emission factors for various vehicle classes (e.g., Sedans, Tricycles, Jeepneys). While we strive for precision, these figures are estimates intended for educational purposes."
                />
                <Section
                  number="3"
                  title="Location Data & Privacy"
                  body="To verify transportation modes and distance, Ecogotchi requires access to your device's location services. This data is encrypted, stored securely, and used solely for gameplay logic. We do not sell or share individual movement data with third parties."
                />
                <Section
                  number="4"
                  title="User Safety"
                  body="Users must prioritize physical safety. Do not use the application while operating a vehicle or in any situation where distraction may lead to injury. Ecogotchi is not liable for accidents occurring during use."
                />
                <Section
                  number="5"
                  title="Virtual Assets"
                  body="EcoPoints, badges, and pet growth levels are virtual assets with no real-world currency value. They are non-transferable and may be reset in the event of platform updates or account deletion."
                />
                <Section
                  number="6"
                  title="Changes to Terms"
                  body="Ecogotchi reserves the right to update these Terms at any time. Continued use of the application after changes are posted constitutes your acceptance of the revised Terms."
                />
              </ScrollView>
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.buttonWrapper}
                  activeOpacity={0.8}
                  onPress={() => {
                    setAccepted(true);
                    setTermsError("");
                    setShowTermsModal(false);
                  }}
                >
                  <ImageBackground
                    source={require("../../assets/images/green-dialogue.png")}
                    style={styles.buttonBackground}
                    resizeMode="stretch"
                  >
                    <Text style={styles.buttonText}>I ACCEPT</Text>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function Section({ number, title, body }) {
  return (
    <View style={styles.modalSection}>
      <View style={styles.sectionNumberContainer}>
        <Text style={styles.sectionNumber}>{number}</Text>
      </View>
      <View style={styles.sectionBody}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionText}>{body}</Text>
      </View>
    </View>
  );
}

const LIGHT_BLACK = "#422F21";
const LIGHT_BROWN = "#59483D";
const DARK_BLACK = "#000000";
const GREEN = "#4A7C4E";
const ERROR_RED = "#D32F2F";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F0FBF5",
  },

  backgroundContainer: {
    position: "absolute",
    bottom: 0,
    width: width,
    height: height,
    zIndex: -1,
  },

  backgroundImage: {
    width: "100%",
    height: "100%",
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
  },

  inner: {
    width: "100%",
    alignItems: "center",
    paddingTop: 1,
  },

  logoImage: {
    width: width * 0.32,
    aspectRatio: 1,
    maxHeight: 200,
    marginTop: -30,
  },

  headline: {
    fontFamily: "System",
    fontSize: 33,
    fontWeight: "800",
    color: LIGHT_BLACK,
    textAlign: "center",
    marginTop: -45,
  },

  subheadlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 20,
  },

  subheadline: {
    fontFamily: "Tiny5-Regular",
    fontSize: 23,
    color: LIGHT_BROWN,
  },

  formCard: {
    width: width * 0.75,
    alignItems: "stretch",
  },

  // Standard vertical spacing for input layout
  inputGroup: {
    marginBottom: 16,
    width: "100%",
  },

  inputLabel: {
    fontFamily: "System",
    fontSize: 13,
    fontWeight: "600",
    color: DARK_BLACK,
    marginBottom: 6,
    paddingLeft: 6,
  },

  input: {
    width: "100%",
    height: 45,
    backgroundColor: "#FFFFFF",
    borderRadius: 35,
    borderWidth: 1,
    borderColor: "#373535",
    paddingHorizontal: 20,
    fontSize: 15,
    color: DARK_BLACK,
    elevation: 2,
  },

  passwordContainer: {
    width: "100%",
    height: 45,
    backgroundColor: "#FFFFFF",
    borderRadius: 35,
    borderWidth: 1,
    borderColor: "#373535",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    elevation: 2,
  },

  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: DARK_BLACK,
    height: "100%",
  },

  inputErrorBorder: {
    borderColor: ERROR_RED,
    borderWidth: 1.5,
  },

  checkboxErrorBorder: {
    borderColor: ERROR_RED,
  },

  errorText: {
    fontFamily: "System",
    fontSize: 11,
    color: ERROR_RED,
    marginTop: 4,
    paddingLeft: 12,
  },

  errorTextTerms: {
    fontFamily: "System",
    fontSize: 11,
    color: ERROR_RED,
    marginTop: 4,
    textAlign: "center",
  },

  eyeButton: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },

  checkboxGroup: {
    marginTop: 4,
    marginBottom: 13,
    width: "100%",
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#373535",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  checkboxChecked: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },

  checkboxText: {
    fontFamily: "System",
    fontSize: 13,
    color: LIGHT_BROWN,
  },

  checkboxLink: {
    fontFamily: "System",
    fontSize: 13,
    fontWeight: "600",
    color: DARK_BLACK,
    textDecorationLine: "underline",
  },

  buttonZone: {
    width: "100%",
    alignItems: "center",
    marginTop: -8,
  },

  buttonWrapper: {
    width: "100%",
    height: 65,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    fontFamily: "Tiny5-Regular",
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    includeFontPadding: false,
    paddingTop: 6,
    paddingLeft: 10,
  },

  loginWrapper: {
    marginTop: 10,
    marginBottom: 30,
  },

  loginText: {
    fontFamily: "System",
    fontSize: 13,
    color: DARK_BLACK,
    textAlign: "center",
  },

  loginLink: {
    fontWeight: "700",
    textDecorationLine: "underline",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  backArrow: {
    fontSize: 22,
    color: LIGHT_BLACK,
    marginTop: -1,
  },

  modalSafe: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    overflow: "hidden",
    maxHeight: height * 0.85,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },

  modalTitle: {
    fontFamily: "System",
    fontSize: 18,
    fontWeight: "800",
    color: LIGHT_BLACK,
    flex: 1,
    marginRight: 10,
  },

  modalCloseButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.05)",
  },

  closeText: {
    fontSize: 22,
    color: LIGHT_BLACK,
  },

  modalDivider: {
    height: 1,
    backgroundColor: "#E2E2E2",
    marginHorizontal: 20,
  },

  modalScroll: {
    paddingHorizontal: 20,
  },

  modalScrollContent: {
    paddingVertical: 18,
  },

  modalSection: {
    flexDirection: "row",
    marginBottom: 18,
  },

  sectionNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: GREEN,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  sectionNumber: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },

  sectionBody: {
    flex: 1,
  },

  sectionTitle: {
    fontFamily: "System",
    fontSize: 14,
    fontWeight: "700",
    color: LIGHT_BLACK,
    marginBottom: 4,
  },

  sectionText: {
    fontFamily: "System",
    fontSize: 13,
    color: LIGHT_BLACK,
    lineHeight: 19,
  },

  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E2E2",
  },
});
