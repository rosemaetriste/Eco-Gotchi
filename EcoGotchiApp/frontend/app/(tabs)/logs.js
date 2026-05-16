import { StyleSheet, Text, View } from 'react-native';

export default function LogsScreen() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>Daily Logs</Text>
      <View style={styles.card}>
        <Text style={styles.entryTitle}>Today</Text>
        <Text style={styles.entryText}>Watered the garden and earned 5 petals.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.entryTitle}>Yesterday</Text>
        <Text style={styles.entryText}>Your pet discovered a mint crystal.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F8E9F3',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#944E8F',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#D9B5D9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#A85DA0',
    marginBottom: 8,
  },
  entryText: {
    fontSize: 15,
    color: '#7E617D',
    lineHeight: 22,
  },
});
