import { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { StatusNotice } from '../../components/StatusNotice';
import type { AuthStackParamList } from '../../navigation/types';
import { authApi } from '../../services/authApi';
import { apiErrorMessage } from '../../services/http';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts } from '../../theme/typography';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>;

export function VerifyEmailScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const {
    email,
    token: linkedToken,
    developmentVerificationToken,
  } = route.params;
  const [token, setToken] = useState(
    developmentVerificationToken ?? linkedToken ?? '',
  );
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{
    message: string;
    tone: 'error' | 'success';
  }>();
  const [tokenError, setTokenError] = useState<string>();
  useEffect(() => {
    function acceptVerificationLink(url: string | null | undefined) {
      if (!url?.includes('/verify-email')) return;
      const match = url.match(/[?&]token=([^&]+)/);
      if (match?.[1]) setToken(decodeURIComponent(match[1]));
    }
    Linking.getInitialURL()
      .then(acceptVerificationLink)
      .catch(() => undefined);
    const subscription = Linking.addEventListener('url', event =>
      acceptVerificationLink(event.url),
    );
    return () => subscription.remove();
  }, []);
  async function verify() {
    if (!token.trim()) {
      setTokenError('Enter the verification token from your email.');
      return;
    }
    setLoading(true);
    setNotice(undefined);
    try {
      await authApi.verifyEmail(token.trim());
      navigation.replace('Login');
    } catch (caught) {
      setNotice({
        message: apiErrorMessage(caught, 'We could not verify this token.'),
        tone: 'error',
      });
    } finally {
      setLoading(false);
    }
  }
  async function resend() {
    if (!email) return;
    setLoading(true);
    setNotice(undefined);
    try {
      const result = await authApi.resendVerification(email);
      if (result.developmentToken) setToken(result.developmentToken);
      setNotice({
        message: 'A fresh verification email has been sent.',
        tone: 'success',
      });
    } catch (caught) {
      setNotice({ message: apiErrorMessage(caught), tone: 'error' });
    } finally {
      setLoading(false);
    }
  }
  return (
    <Screen>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>
        ONE LAST STEP
      </Text>
      <Text style={[styles.title, { color: colors.text }]}>
        Verify your email
      </Text>
      <Text style={[styles.body, { color: colors.muted }]}>
        {email
          ? `We sent a verification link to ${email}. Verify it before signing in.`
          : 'Verify your email before signing in.'}{' '}
        You can also paste the token below.
      </Text>
      <FormField
        error={tokenError}
        label="Verification token"
        placeholder="Paste your verification token"
        testID="verification-token"
        value={token}
        onChangeText={value => {
          setToken(value);
          setTokenError(undefined);
        }}
      />
      <StatusNotice message={notice?.message} tone={notice?.tone} />
      <PrimaryButton label="Verify email" loading={loading} onPress={verify} />
      <PrimaryButton
        disabled={!email}
        label="Resend token"
        variant="secondary"
        loading={loading}
        onPress={resend}
      />
      <PrimaryButton
        label="Back to sign in"
        variant="secondary"
        onPress={() => navigation.replace('Login')}
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginTop: 44,
  },
  title: { fontFamily: fonts.display, fontSize: 44 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
});
