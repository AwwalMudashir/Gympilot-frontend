import {useState} from 'react';
import {StyleSheet, Text} from 'react-native';

import {FormField} from '../../components/FormField';
import {PrimaryButton} from '../../components/PrimaryButton';
import {Screen} from '../../components/Screen';
import {apiClient} from '../../services/http';
import {useAuthStore} from '../../store/authStore';
import {colors} from '../../theme/colors';

export function OnboardingScreen() {
  const completeOnboarding = useAuthStore(state => state.completeOnboarding);
  const [goal, setGoal] = useState('GENERAL_FITNESS');
  const [daysPerWeek, setDaysPerWeek] = useState('3');
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    setError(undefined);
    try {
      await apiClient.put('/profile', {goal, daysPerWeek: Number(daysPerWeek)});
      completeOnboarding();
    } catch {
      setError('Could not save the profile. Confirm the Spring Boot API is running.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Build your starting plan</Text>
      <Text style={styles.subtitle}>
        This starter form proves the onboarding flow. Add the remaining profile fields with the backend story.
      </Text>
      <FormField label="Primary goal" onChangeText={setGoal} value={goal} />
      <FormField
        keyboardType="number-pad"
        label="Training days per week"
        onChangeText={setDaysPerWeek}
        value={daysPerWeek}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton label="Save profile" loading={saving} onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {color: colors.text, fontSize: 30, fontWeight: '800', marginTop: 36},
  subtitle: {color: colors.muted, fontSize: 16, lineHeight: 23, marginBottom: 8},
  error: {color: colors.danger},
});
