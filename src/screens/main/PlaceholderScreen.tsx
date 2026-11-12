import { StyleSheet, Text } from 'react-native';

import { Screen } from '../../components/Screen';
import { colors } from '../../theme/colors';

export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <Screen>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>
        This shell is ready for its scheduled sprint.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  body: { color: colors.muted, fontSize: 16 },
});
