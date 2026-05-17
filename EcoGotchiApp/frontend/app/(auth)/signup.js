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

export default function SignUpScreen() {
  const router = useRouter();

  const [fontsLoaded, setFontsLoaded] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [accepted, setAccepted] = useState(false);

  // Validation States
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [termsError, setTermsError] = useState("");

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

  // Validation Logic
  const handleSignUp = () => {
    let isValid = true;
    
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setTermsError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      console.log("Sign up triggered securely");
      router.push("/(tabs)"); 
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
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, emailError ? styles.inputErrorBorder : null]}
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
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.passwordContainer, passwordError ? styles.inputErrorBorder : null]}>
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
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={[styles.passwordContainer, confirmPasswordError ? styles.inputErrorBorder : null]}>
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
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#59483D"
                  />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
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
                      termsError ? styles.checkboxErrorBorder : null
                    ]}
                  >
                    {accepted && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>

                <Text style={styles.checkboxText}>I accept the </Text>

                <TouchableOpacity
                  onPress={() => router.push("/terms")}
                  activeOpacity={0.7}
                  hitSlop={{ top: 15, bottom: 15, left: 5, right: 5 }}
                >
                  <Text style={styles.checkboxLink}>policy and terms</Text>
                </TouchableOpacity>

                <Text style={styles.checkboxText}>.</Text>
              </View>
              {termsError ? <Text style={styles.errorTextTerms}>{termsError}</Text> : null}
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
    </SafeAreaView>
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
});