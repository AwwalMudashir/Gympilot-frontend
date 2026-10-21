import {ActivityIndicator, Pressable, StyleSheet, Text} from 'react-native';

import {colors} from '../theme/colors';

type PrimaryButtonProps = {label: string; loading?: boolean; onPress: () => void};

export function PrimaryButton({label, loading, onPress}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        pressed ? styles.buttonPressed : null,
        loading ? styles.buttonDisabled : null,
      ]}>
      {loading ? (
        <ActivityIndicator color={colors.surface} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  buttonPressed: {backgroundColor: colors.primaryPressed},
  buttonDisabled: {opacity: 0.7},
  label: {color: colors.surface, fontSize: 16, fontWeight: '700'},
});
