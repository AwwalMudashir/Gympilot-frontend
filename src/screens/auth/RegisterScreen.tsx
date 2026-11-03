import {zodResolver} from '@hookform/resolvers/zod';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Controller, useForm} from 'react-hook-form';
import {Pressable, StyleSheet, Text} from 'react-native';
import {z} from 'zod';
import {AuthScreen} from '../../components/AuthScreen';
import {FormField} from '../../components/FormField';
import {PrimaryButton} from '../../components/PrimaryButton';
import type {AuthStackParamList} from '../../navigation/types';
import {apiErrorMessage} from '../../services/http';
import {useAuthStore} from '../../store/authStore';
import {useTheme} from '../../theme/ThemeProvider';
import {fonts} from '../../theme/typography';

const schema = z.object({
  firstName: z.string().trim().min(2, 'Enter your first name'), lastName: z.string().trim().min(2, 'Enter your last name'), email: z.email('Enter a valid email address'),
  password: z.string().min(12, 'Use at least 12 characters').regex(/[a-z]/, 'Include a lowercase letter').regex(/[A-Z]/, 'Include an uppercase letter').regex(/\d/, 'Include a number').regex(/[^A-Za-z0-9]/, 'Include a special character'),
  confirmPassword: z.string(),
}).refine(values => values.password === values.confirmPassword, {path: ['confirmPassword'], message: 'Passwords must match'});
type Values = z.infer<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({navigation}: Props) {
  const {colors} = useTheme(); const register = useAuthStore(state => state.register);
  const {control, handleSubmit, setError, formState} = useForm<Values>({resolver: zodResolver(schema), defaultValues: {firstName: '', lastName: '', email: '', password: '', confirmPassword: ''}});
  const submit = handleSubmit(async values => { try { await register({...values, firstName: values.firstName.trim(), lastName: values.lastName.trim(), email: values.email.trim()}); } catch (caught) { setError('root', {message: apiErrorMessage(caught, 'Unable to create the account.')}); } });
  const labels: Record<keyof Values, string> = {firstName: 'First name', lastName: 'Last name', email: 'Email', password: 'Password', confirmPassword: 'Confirm password'};
  const placeholders: Record<keyof Values, string> = {firstName: 'Enter your first name', lastName: 'Enter your last name', email: 'Enter your email', password: 'Create a strong password', confirmPassword: 'Re-enter your password'};
  return <AuthScreen compact eyebrow="START YOUR PROGRAM" title="Create your account" subtitle="A secure account keeps your plan and progress connected.">
    {(Object.keys(labels) as (keyof Values)[]).map(name => <Controller control={control} key={name} name={name} render={({field, fieldState}) => <FormField error={fieldState.error?.message} keyboardType={name === 'email' ? 'email-address' : 'default'} label={labels[name]} placeholder={placeholders[name]} onBlur={field.onBlur} onChangeText={field.onChange} secureTextEntry={name === 'password' || name === 'confirmPassword'} testID={`register-${name}`} value={field.value} />} />)}
    {formState.errors.root ? <Text style={[styles.error, {color: colors.danger}]}>{formState.errors.root.message}</Text> : null}
    <PrimaryButton label="Create account" loading={formState.isSubmitting} onPress={submit} />
    <Pressable onPress={() => navigation.goBack()}><Text style={[styles.link, {color: colors.primary}]}>Already registered? Sign in</Text></Pressable>
  </AuthScreen>;
}
const styles = StyleSheet.create({error: {fontFamily: fonts.body}, link: {fontFamily: fonts.body, fontWeight: '700', textAlign: 'center', paddingVertical: 3}});
