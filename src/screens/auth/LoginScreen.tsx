import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text } from 'react-native';
import { z } from 'zod';
import { AuthScreen } from '../../components/AuthScreen';
import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { StatusNotice } from '../../components/StatusNotice';
import type { AuthStackParamList } from '../../navigation/types';
import { apiErrorCode, apiErrorMessage } from '../../services/http';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts } from '../../theme/typography';

const schema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});
type LoginValues = z.infer<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const login = useAuthStore(state => state.login);
  const { control, handleSubmit, setError, clearErrors, formState } =
    useForm<LoginValues>({
      resolver: zodResolver(schema),
      defaultValues: { email: '', password: '' },
    });
  const submit = handleSubmit(async values => {
    try {
      await login(values.email.trim(), values.password);
    } catch (caught) {
      if (apiErrorCode(caught) === 'EMAIL_NOT_VERIFIED') {
        navigation.navigate('VerifyEmail', { email: values.email.trim() });
        return;
      }
      setError('root', {
        message: apiErrorMessage(
          caught,
          'Unable to sign in. Check your details and try again.',
        ),
      });
    }
  });
  return (
    <AuthScreen
      softOverlay
      eyebrow="GYMBRO VISION"
      title="Welcome back"
      subtitle="Your next strong session starts here."
    >
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <FormField
            error={fieldState.error?.message}
            keyboardType="email-address"
            label="Email"
            placeholder="Enter your email"
            onBlur={field.onBlur}
            onChangeText={value => {
              field.onChange(value);
              clearErrors('root');
            }}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <FormField
            error={fieldState.error?.message}
            label="Password"
            placeholder="Enter your password"
            onBlur={field.onBlur}
            onChangeText={value => {
              field.onChange(value);
              clearErrors('root');
            }}
            secureTextEntry
            value={field.value}
          />
        )}
      />
      <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={[styles.forgot, { color: colors.primary }]}>
          Forgot password?
        </Text>
      </Pressable>
      <StatusNotice message={formState.errors.root?.message} tone="error" />
      <PrimaryButton
        label="Sign in"
        loading={formState.isSubmitting}
        onPress={submit}
      />
      <Pressable onPress={() => navigation.navigate('Register')}>
        <Text style={[styles.link, { color: colors.primary }]}>
          New to GymBro? Create an account
        </Text>
      </Pressable>
    </AuthScreen>
  );
}
const styles = StyleSheet.create({
  forgot: { fontFamily: fonts.body, fontWeight: '700', textAlign: 'right' },
  link: {
    fontFamily: fonts.body,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 3,
  },
});
