import * as Font from "expo-font";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function TermsScreen() {
  const router = useRouter();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const fadeIn = useRef(new Animated.Value(0)).current;

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
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FBF5" />

      {/* Background */}
      <View style={styles.backgroundContainer}>
        <Image
          source={require("../../assets/images/blue_bg.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </View>

      <Animated.View style={[styles.overlay, { opacity: fadeIn }]}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Terms and Conditions</Text>
            <TouchableOpacity
              onPress={() => router.push("/signup")}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.headerDivider} />

          {/* Scrollable content */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
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

          {/* Footer — green-dialogue ImageBackground button */}
          <View style={styles.footer}>
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
                <Text style={styles.buttonText}>I ACCEPT</Text>
              </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/")}
              style={styles.notNowWrapper}
            >
              <Text style={styles.notNowText}>Not right now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

function Section({ number, title, body }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {number}. {title}
      </Text>
      <Text style={styles.sectionBody}>{body}</Text>
    </View>
  );
}

const DARK_BLACK = "#1A1A1A";

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
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  card: {
    width: "100%",
    height: height * 0.75,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    flexDirection: "column",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  cardTitle: {
    fontFamily: "System",
    fontSize: 20,
    fontWeight: "800",
    color: DARK_BLACK,
  },
  closeButton: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 16,
    color: "#888",
  },
  headerDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.07)",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontFamily: "System",
    fontSize: 13,
    fontWeight: "700",
    color: DARK_BLACK,
    marginBottom: 5,
  },
  sectionBody: {
    fontFamily: "System",
    fontSize: 13,
    color: "#444",
    lineHeight: 20,
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.07)",
  },

  // green-dialogue button — sized to show the image properly without clipping content
  buttonWrapper: {
    width: "75%",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 19,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 1,
    paddingLeft: 8,
    paddingTop: 2,
  },
  notNowWrapper: {
    marginTop: -8,
  },
  notNowText: {
    fontFamily: "System",
    fontSize: 13,
    color: DARK_BLACK,
    textDecorationLine: "underline",
  },
});
