import { useState } from 'react';
import type { TextInputProps } from 'react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { fonts } from '../theme/typography';
import { AppIcon } from './AppIcon';

type FormFieldProps = TextInputProps & { label: string; error?: string };

export function FormField({
  label,
  error,
  secureTextEntry = false,
  onBlur,
  onFocus,
  ...inputProps
}: FormFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = Boolean(secureTextEntry);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View
        style={[
          styles.inputShell,
          {
            backgroundColor: colors.surface,
            borderColor: focused ? colors.primary : colors.border,
          },
          error ? { borderColor: colors.danger } : null,
        ]}
      >
        <TextInput
          autoCapitalize="none"
          autoCorrect={isPassword ? false : inputProps.autoCorrect}
          onBlur={event => {
            setFocused(false);
            onBlur?.(event);
          }}
          onFocus={event => {
            setFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
          secureTextEntry={isPassword && !passwordVisible}
          style={[
            styles.input,
            { color: colors.text },
            isPassword ? styles.passwordInput : null,
          ]}
          {...inputProps}
        />
        {isPassword ? (
          <Pressable
            accessibilityLabel={
              passwordVisible
                ? `Hide ${label.toLowerCase()}`
                : `Show ${label.toLowerCase()}`
            }
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setPasswordVisible(current => !current)}
            style={({ pressed }) => [
              styles.visibilityButton,
              pressed && styles.visibilityButtonPressed,
            ]}
            testID={`${inputProps.testID ?? 'password'}-visibility-toggle`}
          >
            <AppIcon
              color={focused ? colors.primary : colors.muted}
              name={passwordVisible ? 'eyeSlash' : 'eye'}
              size={18}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View accessibilityLiveRegion="polite" style={styles.errorRow}>
          <AppIcon color={colors.danger} name="error" size={12} />
          <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontFamily: fonts.body, fontSize: 14, fontWeight: '700' },
  inputShell: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 54,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  passwordInput: { paddingRight: 6 },
  visibilityButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 46,
  },
  visibilityButtonPressed: { opacity: 0.55 },
  errorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 2,
  },
  error: { flex: 1, fontFamily: fonts.body, fontSize: 12, lineHeight: 17 },
});
