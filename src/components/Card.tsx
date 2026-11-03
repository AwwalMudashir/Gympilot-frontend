import type {PropsWithChildren} from 'react';
import {StyleSheet, View, type ViewStyle} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';

export function Card({children, style}: PropsWithChildren<{style?: ViewStyle}>) {
  const {colors} = useTheme();
  return <View style={[styles.card, {backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow}, style]}>{children}</View>;
}
const styles = StyleSheet.create({card: {borderRadius: 22, borderWidth: 1, padding: 18, shadowOpacity: 0.07, shadowRadius: 18, shadowOffset: {width: 0, height: 8}, elevation: 2}});
