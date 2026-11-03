import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useState} from 'react';
import {StyleSheet, Text} from 'react-native';
import {FormField} from '../../components/FormField';
import {PrimaryButton} from '../../components/PrimaryButton';
import {Screen} from '../../components/Screen';
import type {AuthStackParamList} from '../../navigation/types';
import {authApi} from '../../services/authApi';
import {apiErrorMessage} from '../../services/http';
import {useTheme} from '../../theme/ThemeProvider';
import {fonts} from '../../theme/typography';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;
export function ForgotPasswordScreen({navigation}: Props) {
  const {colors} = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  async function submit() {
    setLoading(true); setError(undefined);
    try {
      const result = await authApi.forgotPassword(email.trim());
      navigation.navigate('ResetPassword', result.developmentToken ? {token: result.developmentToken} : undefined);
    } catch (caught) { setError(apiErrorMessage(caught)); } finally { setLoading(false); }
  }
  return <Screen>
    <Text style={[styles.eyebrow, {color: colors.primary}]}>ACCOUNT RECOVERY</Text>
    <Text style={[styles.title, {color: colors.text}]}>Reset your password</Text>
    <Text style={[styles.body, {color: colors.muted}]}>Enter your email and we’ll send a secure reset token if the account exists.</Text>
    <FormField label="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
    {error ? <Text style={{color: colors.danger}}>{error}</Text> : null}
    <PrimaryButton label="Send reset instructions" loading={loading} onPress={submit} />
  </Screen>;
}
const styles = StyleSheet.create({eyebrow: {fontFamily: fonts.body, fontSize: 12, fontWeight: '900', letterSpacing: 1.6, marginTop: 40}, title: {fontFamily: fonts.display, fontSize: 40}, body: {fontFamily: fonts.body, fontSize: 16, lineHeight: 23}});
