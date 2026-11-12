import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { StatusNotice } from '../../components/StatusNotice';
import type { AuthStackParamList } from '../../navigation/types';
import { authApi } from '../../services/authApi';
import { apiErrorMessage } from '../../services/http';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts } from '../../theme/typography';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;
export function ResetPasswordScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const [token, setToken] = useState(route.params?.token ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{
    message: string;
    tone: 'error' | 'success';
  }>();
  const [errors, setErrors] = useState<{
    token?: string;
    password?: string;
    confirm?: string;
  }>({});
  async function submit() {
    const nextErrors: typeof errors = {};
    if (!token.trim())
      nextErrors.token = 'Enter the reset token from your email.';
    if (
      password.length < 8 ||
      password.length > 40 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      nextErrors.password =
        'Use 8–40 characters with uppercase, lowercase, a number and a symbol.';
    }
    if (!confirm) nextErrors.confirm = 'Confirm your new password.';
    else if (password !== confirm)
      nextErrors.confirm = 'Passwords do not match.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setNotice(undefined);
      return;
    }
    setLoading(true);
    setNotice(undefined);
    try {
      await authApi.resetPassword(token.trim(), password, confirm);
      setNotice({
        message: 'Password updated. You can now sign in.',
        tone: 'success',
      });
      setTimeout(() => navigation.navigate('Login'), 900);
    } catch (caught) {
      setNotice({
        message: apiErrorMessage(
          caught,
          'We could not update your password. Please try again.',
        ),
        tone: 'error',
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <Screen scroll>
      <Text style={[styles.title, { color: colors.text }]}>
        Choose a new password
      </Text>
      <Text style={[styles.body, { color: colors.muted }]}>
        Use 8–40 characters with uppercase, lowercase, a number and a symbol.
      </Text>
      <FormField
        error={errors.token}
        label="Reset token"
        placeholder="Enter the token from your email"
        value={token}
        onChangeText={value => {
          setToken(value);
          setErrors(current => ({ ...current, token: undefined }));
        }}
        autoCapitalize="none"
      />
      <FormField
        error={errors.password}
        label="New password"
        placeholder="Create a strong password"
        value={password}
        onChangeText={value => {
          setPassword(value);
          setErrors(current => ({ ...current, password: undefined }));
        }}
        secureTextEntry
      />
      <FormField
        error={errors.confirm}
        label="Confirm password"
        placeholder="Re-enter your new password"
        value={confirm}
        onChangeText={value => {
          setConfirm(value);
          setErrors(current => ({ ...current, confirm: undefined }));
        }}
        secureTextEntry
      />
      <StatusNotice message={notice?.message} tone={notice?.tone} />
      <PrimaryButton
        label="Update password"
        loading={loading}
        onPress={submit}
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  title: { fontFamily: fonts.display, fontSize: 40, marginTop: 36 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
});
