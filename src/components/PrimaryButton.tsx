import {ActivityIndicator, Pressable, StyleSheet, Text} from 'react-native';

import {useTheme} from '../theme/ThemeProvider';
import {fonts} from '../theme/typography';

type PrimaryButtonProps = {label: string; loading?: boolean; disabled?: boolean; variant?: 'primary' | 'secondary' | 'danger'; onPress: () => void};

export function PrimaryButton({label, loading, disabled, variant = 'primary', onPress}: PrimaryButtonProps) {
  const {colors} = useTheme();
  const background = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : colors.primarySoft;
  const foreground = variant === 'primary' || variant === 'danger' ? colors.textOnPrimary : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading || disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.button, {backgroundColor: background},
        pressed ? styles.buttonPressed : null,
        loading || disabled ? styles.buttonDisabled : null,
      ]}>
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <Text style={[styles.label, {color: foreground}]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 12,
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  buttonPressed: {opacity: 0.86},
  buttonDisabled: {opacity: 0.7},
  label: {fontFamily: fonts.body, fontSize: 16, fontWeight: '800'},
});
