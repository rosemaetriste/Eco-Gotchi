import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

export const BACKGROUND_COLOR = "#F0FBF5";
export const DARK_BROWN = "#5B3F2D";
export const LIGHT_BROWN = "#5E4332";

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
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
    color: DARK_BROWN,
    textAlign: "center",
    marginTop: -40,
  },
  subheadlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  subheadline: {
    fontFamily: "Tiny5-Regular",
    fontSize: 22,
    color: LIGHT_BROWN,
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    zIndex: 10,
  },

  buttonWrapper: {
    width: width * 0.75,
    aspectRatio: 4,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
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
    textAlign: "center",
    paddingTop: 3,
  },
  butterflyContainer: {
    position: "absolute",
    bottom: "34%",
    left: "25%",
  },
  butterfly: {
    width: 65,
    height: 65,
  },
});
