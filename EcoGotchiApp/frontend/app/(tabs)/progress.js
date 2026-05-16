import { StyleSheet, Text, View } from 'react-native';

export default function ProgressScreen() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>Progress</Text>
      <View style={styles.card}>
        <Text style={styles.statLabel}>Bloom Level</Text>
        <Text style={styles.statValue}>78%</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.statLabel}>Happiness</Text>
        <Text style={styles.statValue}>95%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F7E7F3',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#A04F8A',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#D5AFD5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  statLabel: {
    fontSize: 16,
    color: '#8A617E',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#A0599F',
  },
});
