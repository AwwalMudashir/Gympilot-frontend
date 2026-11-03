import type {TextInputProps} from 'react-native';
import {StyleSheet, Text, TextInput, View} from 'react-native';

import {useTheme} from '../theme/ThemeProvider';
import {fonts} from '../theme/typography';

type FormFieldProps = TextInputProps & {label: string; error?: string};

export function FormField({label, error, ...inputProps}: FormFieldProps) {
  const {colors} = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.label, {color: colors.text}]}>{label}</Text>
      <TextInput
        autoCapitalize="none"
        placeholderTextColor={colors.muted}
        selectionColor={colors.primary}
        style={[styles.input, {backgroundColor: colors.surface, borderColor: colors.border, color: colors.text}, error ? {borderColor: colors.danger} : null]}
        {...inputProps}
      />
      {error ? <Text style={[styles.error, {color: colors.danger}]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {gap: 6},
  label: {fontFamily: fonts.body, fontSize: 14, fontWeight: '700'},
  input: {
    borderRadius: 12,
    borderWidth: 1,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputError: {},
  error: {fontFamily: fonts.body, fontSize: 12},
});
