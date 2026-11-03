import {useState} from 'react';
import {StyleSheet, Text} from 'react-native';
import {FormField} from '../../components/FormField';
import {PrimaryButton} from '../../components/PrimaryButton';
import {Screen} from '../../components/Screen';
import {authApi} from '../../services/authApi';
import {apiErrorMessage} from '../../services/http';
import {useAuthStore} from '../../store/authStore';
import {useTheme} from '../../theme/ThemeProvider';
import {fonts} from '../../theme/typography';

export function VerifyEmailScreen() {
  const {colors} = useTheme();
  const user = useAuthStore(state => state.user);
  const initial = useAuthStore(state => state.verificationToken);
  const mark = useAuthStore(state => state.markEmailVerified);
  const logout = useAuthStore(state => state.logout);
  const [token, setToken] = useState(initial ?? '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>();
  async function verify() { setLoading(true); try { await authApi.verifyEmail(token.trim()); mark(); } catch (caught) { setMessage(apiErrorMessage(caught)); } finally { setLoading(false); } }
  async function resend() { setLoading(true); try { const result = await authApi.resendVerification(user!.email); if (result.developmentToken) setToken(result.developmentToken); setMessage('A fresh verification token has been sent.'); } catch (caught) { setMessage(apiErrorMessage(caught)); } finally { setLoading(false); } }
  return <Screen>
    <Text style={[styles.eyebrow, {color: colors.primary}]}>ONE LAST STEP</Text>
    <Text style={[styles.title, {color: colors.text}]}>Verify your email</Text>
    <Text style={[styles.body, {color: colors.muted}]}>We sent a verification link to {user?.email}. You can also paste the token below.</Text>
    <FormField label="Verification token" testID="verification-token" value={token} onChangeText={setToken} />
    {message ? <Text style={{color: colors.muted}}>{message}</Text> : null}
    <PrimaryButton label="Verify email" loading={loading} onPress={verify} />
    <PrimaryButton label="Resend token" variant="secondary" loading={loading} onPress={resend} />
    <PrimaryButton label="Use another account" variant="secondary" onPress={() => logout()} />
  </Screen>;
}
const styles = StyleSheet.create({eyebrow: {fontFamily: fonts.body, fontSize: 12, fontWeight: '900', letterSpacing: 1.6, marginTop: 44}, title: {fontFamily: fonts.display, fontSize: 44}, body: {fontFamily: fonts.body, fontSize: 16, lineHeight: 23}});
