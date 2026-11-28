import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { fonts } from '../theme/typography';

type PrimaryButtonProps = {
  label: string;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  onPress: () => void;
};

export function PrimaryButton({
  label,
  loading,
  loadingLabel,
  disabled,
  variant = 'primary',
  onPress,
}: PrimaryButtonProps) {
  const { colors } = useTheme();
  const background =
    variant === 'primary'
      ? colors.primary
      : variant === 'danger'
      ? colors.danger
      : colors.primarySoft;
  const foreground =
    variant === 'primary' || variant === 'danger'
      ? colors.textOnPrimary
      : colors.primary;
  const pressedBackground =
    variant === 'primary'
      ? colors.primaryPressed
      : variant === 'secondary'
      ? colors.surfaceRaised
      : colors.danger;
  const elevated = variant !== 'secondary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading || disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? pressedBackground : background,
          borderColor:
            variant === 'secondary' ? `${colors.primary}45` : background,
          shadowColor: colors.shadow,
        },
        elevated ? styles.elevated : null,
        pressed ? styles.buttonPressed : null,
        loading || disabled ? styles.buttonDisabled : null,
      ]}
    >
      {loading ? (
        <>
          <ActivityIndicator color={foreground} size="small" />
          {loadingLabel ? (
            <Text style={[styles.label, { color: foreground }]}>
              {loadingLabel}
            </Text>
          ) : null}
        </>
      ) : (
        <Text style={[styles.label, { color: foreground }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  elevated: {
    elevation: 3,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
  },
  buttonPressed: { transform: [{ scale: 0.985 }] },
  buttonDisabled: { elevation: 0, opacity: 0.58, shadowOpacity: 0 },
  label: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.15,
  },
});
