import {StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';
import {fonts} from '../theme/typography';
import {AppIcon, type AppIconName} from './AppIcon';
import {PrimaryButton} from './PrimaryButton';

export function StateView({title, message, icon = 'dumbbell', actionLabel, onAction}: {title: string; message: string; icon?: AppIconName; actionLabel?: string; onAction?: () => void}) {
  const {colors} = useTheme();
  return <View style={styles.wrap}>
    <View style={[styles.icon, {backgroundColor: colors.primarySoft}]}><AppIcon name={icon} color={colors.primary} size={24} /></View>
    <Text style={[styles.title, {color: colors.text}]}>{title}</Text>
    <Text style={[styles.message, {color: colors.muted}]}>{message}</Text>
    {actionLabel && onAction ? <PrimaryButton label={actionLabel} onPress={onAction} /> : null}
  </View>;
}
const styles = StyleSheet.create({wrap: {alignItems: 'center', gap: 10, justifyContent: 'center', padding: 28}, icon: {alignItems: 'center', borderRadius: 22, height: 52, justifyContent: 'center', width: 52}, title: {fontFamily: fonts.display, fontSize: 25}, message: {fontFamily: fonts.body, fontSize: 15, lineHeight: 22, textAlign: 'center'}});
