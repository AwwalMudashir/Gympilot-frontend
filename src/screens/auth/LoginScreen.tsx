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
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Use at least 8 characters'),
});
type LoginValues = z.infer<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({navigation}: Props) {
  const login = useAuthStore(state => state.login);
  const {control, handleSubmit, setError, formState} = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: {email: '', password: ''},
  });

  const submit = handleSubmit(async values => {
    try {
      await login(values.email.trim(), values.password);
    } catch {
      setError('root', {message: 'Unable to sign in. Check the API and credentials.'});
    }
  });

  return (
    <Screen>
      <Text style={styles.eyebrow}>GYMPILOT VISION</Text>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to continue your training plan.</Text>
      <Controller
        control={control}
        name="email"
        render={({field, fieldState}) => (
          <FormField
            error={fieldState.error?.message}
            keyboardType="email-address"
            label="Email"
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({field, fieldState}) => (
          <FormField
            error={fieldState.error?.message}
            label="Password"
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            secureTextEntry
            value={field.value}
          />
        )}
      />
      {formState.errors.root ? (
        <Text style={styles.error}>{formState.errors.root.message}</Text>
      ) : null}
      <PrimaryButton label="Sign in" loading={formState.isSubmitting} onPress={submit} />
      <Pressable onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>New to GymPilot? Create an account</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {color: colors.primary, fontSize: 13, fontWeight: '800', marginTop: 48},
  title: {color: colors.text, fontSize: 34, fontWeight: '800', marginTop: 12},
  subtitle: {color: colors.muted, fontSize: 16, marginBottom: 12},
  error: {color: colors.danger},
  link: {color: colors.primary, fontWeight: '700', textAlign: 'center'},
});
