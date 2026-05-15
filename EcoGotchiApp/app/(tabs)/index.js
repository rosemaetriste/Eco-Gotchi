import * as Font from "expo-font";
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
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./styles.js";

const { width, height } = Dimensions.get("window");

export default function EcoGotchiHomeScreen() {
  const router = useRouter();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // fonts
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

  // animations
  const butterflyX = useRef(new Animated.Value(0)).current;
  const butterflyY = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const logoY = useRef(new Animated.Value(-3)).current;

  useEffect(() => {
    if (fontsLoaded) {
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      // butterfly movement
      Animated.loop(
        Animated.sequence([
          Animated.timing(butterflyX, {
            toValue: 18,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(butterflyY, {
            toValue: -12,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(butterflyX, {
            toValue: -8,
            duration: 1100,
            useNativeDriver: true,
          }),
          Animated.timing(butterflyY, {
            toValue: 6,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(butterflyX, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(butterflyY, {
            toValue: 0,
            duration: 800,
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
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FBF5" />

      {/* background */}
      <View style={styles.backgroundContainer}>
        <Image
          source={require("../../assets/images/bg_flower.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.container}>
        <Animated.View style={[styles.inner, { opacity: fadeIn }]}>
          {/* logo */}
          <Animated.View style={{ transform: [{ translateY: logoY }] }}>
            <Image
              source={require("../../assets/images/ecogotchi_logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* headline */}
          <Text style={styles.headline}>Hey there!</Text>
          <View style={styles.subheadlineContainer}>
            <Text style={styles.subheadline}>{"> READY TO BLOOM?"}</Text>
            <Animated.Text style={[styles.subheadline, { opacity: blink }]}>
              {"_"}
            </Animated.Text>
          </View>

          {/* buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.buttonWrapper}
              activeOpacity={0.8}
              onPress={() => router.push("/signup")}
            >
              <ImageBackground
                source={require("../../assets/images/green-dialogue.png")}
                style={styles.buttonBackground}
                resizeMode="contain"
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: "#FFFFFF", paddingLeft: 9 },
                  ]}
                >
                  START SPROUTING
                </Text>
              </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonWrapper}
              activeOpacity={0.8}
              onPress={() => router.push("/login")}
            >
              <ImageBackground
                source={require("../../assets/images/white-dialogue-bg.png")}
                style={styles.buttonBackground}
                resizeMode="contain"
              >
                <Text style={[styles.buttonText, { color: "#5B3F2D" }]}>
                  VISIT PET
                </Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>

          {/* butterfly */}
          <View style={styles.butterflyContainer}>
            <Animated.View
              style={{
                transform: [
                  { translateX: butterflyX },
                  { translateY: butterflyY },
                ],
              }}
            >
              <Image
                source={require("../../assets/images/butterfly.png")}
                style={styles.butterfly}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
