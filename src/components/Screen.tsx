import type {PropsWithChildren} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useTheme} from '../theme/ThemeProvider';

type ScreenProps = PropsWithChildren<{scroll?: boolean}>;

export function Screen({children, scroll = false}: ScreenProps) {
  const {colors} = useTheme();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, {backgroundColor: colors.background}]}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {children}
        </ScrollView>
      ) : (
        <View style={styles.content}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1},
  content: {flex: 1, gap: 16, padding: 24},
  scrollContent: {flexGrow: 1, gap: 16, padding: 24},
});
