import { StyleSheet, Text, View } from 'react-native';

export default function PetScreen() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>Eco-Gotchi Pet</Text>
      <View style={styles.card}>
        <Text style={styles.petName}>Luna</Text>
        <Text style={styles.petMeta}>Mood: Blooming</Text>
        <Text style={styles.petMeta}>Energy: 85%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FFF3FA',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#9F4F8F',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#D6B5D6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
  },
  petName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#A85DB0',
    marginBottom: 10,
  },
  petMeta: {
    fontSize: 16,
    color: '#7F5F7B',
    marginBottom: 6,
  },
});
