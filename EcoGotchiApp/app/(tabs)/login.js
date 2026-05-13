import * as Font from "expo-font";
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
            {/* Email */}
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="username@gmail.com"
              placeholderTextColor="rgba(91, 63, 45, 0.4)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password */}
            <Text style={[styles.inputLabel, { marginTop: 24 }]}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••••••••••"
              placeholderTextColor="rgba(91, 63, 45, 0.4)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* VISIT YOUR PET Button */}
            <TouchableOpacity style={styles.buttonWrapper} activeOpacity={0.8}>
              <ImageBackground
                source={require("../../assets/images/green-dialogue.png")}
                style={styles.buttonBackground}
                resizeMode="contain"
              >
                <Text style={styles.buttonText}>VISIT YOUR PET</Text>
              </ImageBackground>
            </TouchableOpacity>

            {/* Forget Password */}
            <TouchableOpacity activeOpacity={0.7}>
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
  inner: {
    flex: 1,
    alignItems: "center",
    paddingTop: 1,
  },
  logoImage: {
    width: width * 0.35,
    aspectRatio: 1,
    maxHeight: 230,
    marginTop: -40,
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

  // Form card — transparent, just holds the inputs
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
    // subtle shadow for the pill look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1,
  },

  // Button
  buttonWrapper: {
    width: "85%",
    height: width * 0.55,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -70,
    alignSelf: "center",
    zIndex: 0,
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
    paddingTop: 30,
  },

  // Forgot password
  forgotText: {
    fontFamily: "System",
    fontSize: 13,
    color: DARK_BLACK,
    textAlign: "center",
    marginTop: -60,
  },
  forgotLink: {
    fontFamily: "System",
    fontSize: 13,
    fontWeight: "600",
    color: DARK_BLACK,
    textDecorationLine: "underline",
  },
});
