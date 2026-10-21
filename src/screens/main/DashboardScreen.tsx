import {StyleSheet, Text, View} from 'react-native';

import {Screen} from '../../components/Screen';
import {colors} from '../../theme/colors';

export function DashboardScreen() {
  return (
    <Screen>
      <Text style={styles.eyebrow}>TODAY</Text>
      <Text style={styles.title}>Your daily brief</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Foundation ready</Text>
        <Text style={styles.body}>
          Connect the workout-plan endpoint in Sprint 2. Camera tracking belongs to the dedicated vision flow in Sprint 3.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {color: colors.primary, fontSize: 13, fontWeight: '800'},
  title: {color: colors.text, fontSize: 30, fontWeight: '800'},
  card: {backgroundColor: colors.surface, borderRadius: 18, padding: 20},
  cardTitle: {color: colors.text, fontSize: 18, fontWeight: '700'},
  body: {color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8},
});
