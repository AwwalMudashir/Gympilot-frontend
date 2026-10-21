import type {TextInputProps} from 'react-native';
import {StyleSheet, Text, TextInput, View} from 'react-native';

import {colors} from '../theme/colors';

type FormFieldProps = TextInputProps & {label: string; error?: string};

export function FormField({label, error, ...inputProps}: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize="none"
        placeholderTextColor={colors.muted}
        style={[styles.input, error ? styles.inputError : null]}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {gap: 6},
  label: {color: colors.text, fontSize: 14, fontWeight: '600'},
  input: {
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputError: {borderColor: colors.danger},
  error: {color: colors.danger, fontSize: 12},
});
