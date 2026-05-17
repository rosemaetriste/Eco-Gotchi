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
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validation States
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const router = useRouter();

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
  const handleLogin = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

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

    if (isValid) {
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
          source={require("../../assets/images/login_bg.png")}
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

      <View style={styles.container}>
        <Animated.View style={[styles.inner, { opacity: fadeIn }]}>
          {/* Logo */}
          <Animated.View style={{ transform: [{ translateY: logoY }] }}>
            <Image
              source={require("../../assets/images/ecogotchi_logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Welcome Back + LOGIN headline */}
          <Text style={styles.headline}>Welcome Back!</Text>

          <View style={styles.subheadlineContainer}>
            <Text style={styles.subheadline}>{"> LOGIN "}</Text>

            <Animated.Text style={[styles.subheadline, { opacity: blink }]}>
              {"_"}
            </Animated.Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Email Container */}
            <View>
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
                <Text style={styles.errorTextAbsolute}>{emailError}</Text>
              ) : null}
            </View>

            {/* Password Container */}
            <View>
              <Text style={[styles.inputLabel, { marginTop: 24 }]}>
                Password
              </Text>
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
                <Text style={styles.errorTextAbsolutePassword}>
                  {passwordError}
                </Text>
              ) : null}
            </View>

            {/* VISIT YOUR PET Button */}
            <TouchableOpacity
              style={styles.buttonWrapper}
              activeOpacity={0.8}
              onPress={handleLogin}
            >
              <ImageBackground
                source={require("../../assets/images/green-dialogue.png")}
                style={styles.buttonBackground}
                resizeMode="contain"
              >
                <Text style={styles.buttonText}>VISIT YOUR PET</Text>
              </ImageBackground>
            </TouchableOpacity>

            {/* Forget Password */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/forgot-password")}
            >
              <Text style={styles.forgotText}>
                Forget Password?{" "}
                <Text style={styles.forgotLink}>Click Here</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const LIGHT_BLACK = "#422F21";
const LIGHT_BROWN = "#59483D";
const DARK_BLACK = "#000000";
const ERROR_RED = "#D32F2F";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F0FBF5",
  },

  container: {
    flex: 1,
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

  inner: {
    flex: 1,
    alignItems: "center",
    paddingTop: 1,
  },

  logoImage: {
    width: width * 0.35,
    aspectRatio: 1,
    maxHeight: 225,
    marginTop: -30,
  },

  headline: {
    fontFamily: "System",
    fontSize: 33,
    fontWeight: "800",
    color: LIGHT_BLACK,
    textAlign: "center",
    marginTop: -40,
  },

  subheadlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 15,
  },

  subheadline: {
    fontFamily: "Tiny5-Regular",
    fontSize: 23,
    color: LIGHT_BROWN,
  },

  formCard: {
    width: width * 0.8,
    alignItems: "stretch",
  },

  inputLabel: {
    fontFamily: "System",
    fontSize: 16,
    fontWeight: "500",
    color: DARK_BLACK,
    marginBottom: 6,
    paddingLeft: 6,
  },

  input: {
    width: "100%",
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 35,
    borderWidth: 1,
    borderColor: "#373535",
    paddingHorizontal: 20,
    fontFamily: "System",
    fontSize: 15,
    color: DARK_BLACK,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  passwordContainer: {
    width: "100%",
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 35,
    borderWidth: 1,
    borderColor: "#373535",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
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

  errorTextAbsolute: {
    position: "absolute",
    bottom: -18,
    left: 12,
    fontFamily: "System",
    fontSize: 11,
    color: ERROR_RED,
  },

  errorTextAbsolutePassword: {
    position: "absolute",
    bottom: -18,
    left: 12,
    fontFamily: "System",
    fontSize: 11,
    color: ERROR_RED,
  },

  eyeButton: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },

  buttonWrapper: {
    width: "85%",
    height: 65,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    alignSelf: "center",
  },

  buttonBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    fontFamily: "Tiny5-Regular",
    fontSize: 17,
    color: "#FFFFFF",
    textAlign: "center",
    paddingTop: 2,
    paddingLeft: 2,
  },

  forgotText: {
    fontFamily: "System",
    fontSize: 13,
    color: DARK_BLACK,
    textAlign: "center",
    marginTop: 5,
  },

  forgotLink: {
    fontFamily: "System",
    fontSize: 13,
    fontWeight: "600",
    color: DARK_BLACK,
    textDecorationLine: "underline",
  },
});
