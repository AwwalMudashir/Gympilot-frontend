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

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;
export function ResetPasswordScreen({route, navigation}: Props) {
  const {colors} = useTheme();
  const [token, setToken] = useState(route.params?.token ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>();
  async function submit() {
    if (!token.trim()) return setMessage('Enter the reset token from your email.');
    if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password)
        || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return setMessage('Use 12+ characters with uppercase, lowercase, a number and a symbol.');
    }
    if (password !== confirm) return setMessage('Password confirmation does not match.');
    setLoading(true); setMessage(undefined);
    try { await authApi.resetPassword(token.trim(), password, confirm); setMessage('Password updated. You can now sign in.'); setTimeout(() => navigation.navigate('Login'), 800); }
    catch (caught) { setMessage(apiErrorMessage(caught)); } finally { setLoading(false); }
  }
  return <Screen scroll>
    <Text style={[styles.title, {color: colors.text}]}>Choose a new password</Text>
    <Text style={[styles.body, {color: colors.muted}]}>Use 12+ characters with uppercase, lowercase, a number and a symbol.</Text>
    <FormField label="Reset token" value={token} onChangeText={setToken} autoCapitalize="none" />
    <FormField label="New password" value={password} onChangeText={setPassword} secureTextEntry />
    <FormField label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry />
    {message ? <Text style={{color: colors.primary}}>{message}</Text> : null}
    <PrimaryButton label="Update password" loading={loading} onPress={submit} />
  </Screen>;
}
const styles = StyleSheet.create({title: {fontFamily: fonts.display, fontSize: 40, marginTop: 36}, body: {fontFamily: fonts.body, fontSize: 16, lineHeight: 23}});
