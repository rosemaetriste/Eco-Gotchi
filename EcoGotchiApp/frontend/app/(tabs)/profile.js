import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <Text style={styles.name}>Eco Guardian</Text>
        <Text style={styles.meta}>Level 5 caretaker</Text>
        <Text style={styles.description}>You love pastel gardens and caring for your Eco-Gotchi.</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={() => router.push('/(auth)')}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FDE8F3',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#9D4B8B',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#D7B3D7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#A65FA3',
    marginBottom: 8,
  },
  meta: {
    fontSize: 16,
    color: '#84637F',
    marginBottom: 14,
  },
  description: {
    fontSize: 15,
    color: '#7D5E79',
    lineHeight: 22,
  },
  logoutButton: {
    backgroundColor: '#CF8CC5',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
