import { useCallback, useEffect, useRef, useState } from 'react';
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
  } = route.params ?? {};
  const [token, setToken] = useState(
    developmentVerificationToken ?? linkedToken ?? '',
  );
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [notice, setNotice] = useState<{
    message: string;
    tone: 'error' | 'success';
  }>();
  const [tokenError, setTokenError] = useState<string>();
  const consumedLinkedToken = useRef<string | undefined>(undefined);

  const verifyToken = useCallback(
    async (candidate: string, showMissingTokenError = true) => {
      const cleanToken = candidate.trim();

      if (!cleanToken) {
        if (showMissingTokenError) {
          setTokenError('Enter the verification token from your email.');
        }
        return;
      }

      setVerifyLoading(true);
      setTokenError(undefined);
      setNotice(undefined);

      try {
        await authApi.verifyEmail(cleanToken);
        navigation.replace('Login');
      } catch (caught) {
        setNotice({
          message: apiErrorMessage(caught, 'We could not verify this token.'),
          tone: 'error',
        });
      } finally {
        setVerifyLoading(false);
      }
    },
    [navigation],
  );

  useEffect(() => {
    function acceptVerificationLink(url: string | null | undefined) {
      if (!url?.includes('/verify-email')) return;

      const match = url.match(/[?&]token=([^&]+)/);
      if (!match?.[1]) return;

      let decodedToken: string;

      try {
        decodedToken = decodeURIComponent(match[1]);
      } catch {
        setNotice({
          message: 'This verification link is malformed. Request a new email.',
          tone: 'error',
        });
        return;
      }

      setToken(decodedToken);

      if (consumedLinkedToken.current === decodedToken) return;

      consumedLinkedToken.current = decodedToken;
      verifyToken(decodedToken, false).catch(() => undefined);
    }

    if (linkedToken) {
      acceptVerificationLink(
        `gymbro://auth/verify-email?token=${encodeURIComponent(linkedToken)}`,
      );
    }

    Linking.getInitialURL()
      .then(acceptVerificationLink)
      .catch(() => undefined);

    const subscription = Linking.addEventListener('url', event =>
      acceptVerificationLink(event.url),
    );

    return () => subscription.remove();
  }, [linkedToken, verifyToken]);

  async function resend() {
    if (!email) return;

    setResendLoading(true);
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
      setResendLoading(false);
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
      <PrimaryButton
        disabled={resendLoading}
        label="Verify email"
        loading={verifyLoading}
        onPress={() => {
          verifyToken(token).catch(() => undefined);
        }}
      />
      <PrimaryButton
        disabled={!email || verifyLoading}
        label="Resend token"
        variant="secondary"
        loading={resendLoading}
        onPress={() => {
          resend().catch(() => undefined);
        }}
      />
      <PrimaryButton
        disabled={verifyLoading || resendLoading}
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
