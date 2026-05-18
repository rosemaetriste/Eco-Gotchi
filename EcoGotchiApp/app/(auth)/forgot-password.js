import { useRouter } from "expo-router";
import { useState } from "react";
import "react-native-gesture-handler";
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  StyleSheet,
} from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSendOTP = async () => {
    console.log("BUTTON PRESSED");

    try {
      const response = await fetch(
        "https://defacing-astrology-wannabe.ngrok-free.dev/api/send-otp",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        },
      );

      console.log("STATUS:", response.status);

      const data = await response.json();

      console.log("SERVER:", data);

      Alert.alert("Success", data.message);
    } catch (err) {
      console.log("FETCH ERROR:", err);

      Alert.alert("Error", JSON.stringify(err));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>AAAAAAAAA TEST</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleSendOTP}>
        <Text style={styles.buttonText}>SEND OTP</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
