import {zodResolver} from '@hookform/resolvers/zod';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Controller, useForm} from 'react-hook-form';
import {Pressable, StyleSheet, Text} from 'react-native';
import {z} from 'zod';

import {FormField} from '../../components/FormField';
import {PrimaryButton} from '../../components/PrimaryButton';
import {Screen} from '../../components/Screen';
import type {AuthStackParamList} from '../../navigation/types';
import {useAuthStore} from '../../store/authStore';
import {colors} from '../../theme/colors';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Use at least 8 characters'),
});
type RegisterValues = z.infer<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({navigation}: Props) {
  const register = useAuthStore(state => state.register);
  const {control, handleSubmit, setError, formState} = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: {name: '', email: '', password: ''},
  });

  const submit = handleSubmit(async values => {
    try {
      await register(values.name.trim(), values.email.trim(), values.password);
    } catch {
      setError('root', {message: 'Unable to create the account. Is the API running?'});
    }
  });

  return (
    <Screen scroll>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Your profile will shape your first workout plan.</Text>
      {(['name', 'email', 'password'] as const).map(name => (
        <Controller
          control={control}
          key={name}
          name={name}
          render={({field, fieldState}) => (
            <FormField
              error={fieldState.error?.message}
              keyboardType={name === 'email' ? 'email-address' : 'default'}
              label={name === 'name' ? 'Name' : name === 'email' ? 'Email' : 'Password'}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              secureTextEntry={name === 'password'}
              value={field.value}
            />
          )}
        />
      ))}
      {formState.errors.root ? (
        <Text style={styles.error}>{formState.errors.root.message}</Text>
      ) : null}
      <PrimaryButton label="Create account" loading={formState.isSubmitting} onPress={submit} />
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Already registered? Sign in</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {color: colors.text, fontSize: 32, fontWeight: '800', marginTop: 36},
  subtitle: {color: colors.muted, fontSize: 16, marginBottom: 8},
  error: {color: colors.danger},
  link: {color: colors.primary, fontWeight: '700', textAlign: 'center'},
});
