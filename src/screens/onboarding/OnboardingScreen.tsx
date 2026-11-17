import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChoiceChip } from '../../components/ChoiceChip';
import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { equipmentGroups } from '../../config/trainingOptions';
import { apiErrorMessage } from '../../services/http';
import { profileApi } from '../../services/profileApi';
import { workoutApi } from '../../services/workoutApi';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts } from '../../theme/typography';
import type {
  DayOfWeek,
  ExperienceLevel,
  FitnessGoal,
  ProfilePayload,
} from '../../types/profile';

const goals: { value: FitnessGoal; label: string }[] = [
  { value: 'GENERAL_FITNESS', label: 'General fitness' },
  { value: 'MUSCLE_GAIN', label: 'Build muscle' },
  { value: 'WEIGHT_LOSS', label: 'Lose weight' },
  { value: 'STRENGTH', label: 'Get stronger' },
  { value: 'CONSISTENCY', label: 'Stay consistent' },
  { value: 'MAINTENANCE', label: 'Maintain fitness' },
];
const levels: ExperienceLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const days: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];
export function OnboardingScreen() {
  const { colors } = useTheme();
  const complete = useAuthStore(state => state.completeOnboarding);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [age, setAge] = useState('25');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('75');
  const [level, setLevel] = useState<ExperienceLevel>('BEGINNER');
  const [goal, setGoal] = useState<FitnessGoal>('GENERAL_FITNESS');
  const [location, setLocation] = useState('Home');
  const [equipment, setEquipment] = useState<string[]>([]);
  const [trainingDays, setTrainingDays] = useState<DayOfWeek[]>([
    'MONDAY',
    'WEDNESDAY',
    'FRIDAY',
  ]);
  const [duration, setDuration] = useState('45');
  const [water, setWater] = useState('2500');
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const titles = [
    'Your starting point',
    'Your training goal',
    'Build your week',
    'Recovery basics',
  ];
  const payload = useMemo<ProfilePayload>(
    () => ({
      age: Number(age),
      heightCm: Number(height),
      weightKg: Number(weight),
      experienceLevel: level,
      fitnessGoal: goal,
      preferredWorkoutLocation: location.trim(),
      availableEquipment: equipment,
      preferredWorkoutDays: trainingDays,
      daysPerWeek: trainingDays.length,
      workoutDurationMinutes: Number(duration),
      dailyWaterTargetMl: Number(water),
      preferredBedtime: bedtime,
      preferredWakeTime: wakeTime,
      sleepTargetMinutes: 480,
    }),
    [
      age,
      bedtime,
      duration,
      equipment,
      goal,
      height,
      level,
      location,
      trainingDays,
      wakeTime,
      water,
      weight,
    ],
  );

  function toggle<T>(current: T[], item: T, setter: (next: T[]) => void) {
    setter(
      current.includes(item)
        ? current.filter(value => value !== item)
        : [...current, item],
    );
  }
  function next() {
    setError(undefined);
    const ageValue = Number(age);
    const heightValue = Number(height);
    const weightValue = Number(weight);
    if (
      step === 0 &&
      (!Number.isFinite(ageValue) ||
        ageValue < 13 ||
        ageValue > 120 ||
        !Number.isFinite(heightValue) ||
        heightValue < 80 ||
        heightValue > 250 ||
        !Number.isFinite(weightValue) ||
        weightValue < 25 ||
        weightValue > 400)
    ) {
      return setError('Use age 13–120, height 80–250 cm and weight 25–400 kg.');
    }
    if (step === 1 && (!location.trim() || location.trim().length > 80))
      return setError('Enter a workout location of 80 characters or fewer.');
    const durationValue = Number(duration);
    if (
      step === 2 &&
      (trainingDays.length === 0 ||
        !Number.isFinite(durationValue) ||
        durationValue < 10 ||
        durationValue > 300)
    ) {
      return setError(
        'Choose at least one training day and a duration between 10 and 300 minutes.',
      );
    }
    setStep(value => Math.min(3, value + 1));
  }
  async function submit() {
    const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    const waterValue = Number(water);
    if (
      !Number.isFinite(waterValue) ||
      waterValue < 250 ||
      waterValue > 10000
    ) {
      setError('Set a daily water target between 250 and 10,000 ml.');
      return;
    }
    if (!timePattern.test(bedtime) || !timePattern.test(wakeTime)) {
      setError('Enter bedtime and wake time in 24-hour HH:mm format.');
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await profileApi.create(payload);
      try {
        await workoutApi.generatePlan();
      } catch {
        /* Dashboard provides retry. */
      }
      complete();
    } catch (caught) {
      setError(
        apiErrorMessage(caught, 'We could not save your fitness profile.'),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.topRow}>
        <Text style={[styles.step, { color: colors.primary }]}>
          STEP {step + 1} OF 4
        </Text>
        <Text style={[styles.percent, { color: colors.muted }]}>
          {(step + 1) * 25}%
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progress,
            { backgroundColor: colors.primary, width: `${(step + 1) * 25}%` },
          ]}
        />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{titles[step]}</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        A few focused details help GymBro build a plan that fits real life.
      </Text>
      {step === 0 ? (
        <>
          <View style={styles.row}>
            <View style={styles.flex}>
              <FormField
                label="Age"
                keyboardType="number-pad"
                value={age}
                onChangeText={setAge}
              />
            </View>
            <View style={styles.flex}>
              <FormField
                label="Height (cm)"
                keyboardType="decimal-pad"
                value={height}
                onChangeText={setHeight}
              />
            </View>
          </View>
          <FormField
            label="Weight (kg)"
            keyboardType="decimal-pad"
            value={weight}
            onChangeText={setWeight}
          />
          <Text style={[styles.label, { color: colors.text }]}>Experience</Text>
          <View style={styles.wrap}>
            {levels.map(value => (
              <ChoiceChip
                key={value}
                label={value.toLowerCase()}
                selected={level === value}
                onPress={() => setLevel(value)}
              />
            ))}
          </View>
        </>
      ) : null}
      {step === 1 ? (
        <>
          <Text style={[styles.label, { color: colors.text }]}>
            Primary goal
          </Text>
          <View style={styles.wrap}>
            {goals.map(item => (
              <ChoiceChip
                key={item.value}
                label={item.label}
                selected={goal === item.value}
                onPress={() => setGoal(item.value)}
              />
            ))}
          </View>
          <FormField
            label="Preferred workout location"
            value={location}
            onChangeText={setLocation}
          />
          <Text style={[styles.label, { color: colors.text }]}>
            Available equipment
          </Text>
          <Text style={[styles.hint, { color: colors.muted }]}>
            Select everything you can regularly use. Bodyweight movements remain
            available with every plan.
          </Text>
          <View style={styles.wrap}>
            <ChoiceChip
              label="Bodyweight only"
              selected={equipment.length === 0}
              onPress={() => setEquipment([])}
            />
          </View>
          {equipmentGroups.map(group => (
            <View key={group.label} style={styles.equipmentGroup}>
              <Text
                style={[styles.equipmentGroupLabel, { color: colors.muted }]}
              >
                {group.label}
              </Text>
              <View style={styles.wrap}>
                {group.options.map(item => (
                  <ChoiceChip
                    key={item}
                    label={item}
                    selected={equipment.includes(item)}
                    onPress={() => toggle(equipment, item, setEquipment)}
                  />
                ))}
              </View>
            </View>
          ))}
        </>
      ) : null}
      {step === 2 ? (
        <>
          <Text style={[styles.label, { color: colors.text }]}>
            Training days
          </Text>
          <View style={styles.wrap}>
            {days.map(day => (
              <ChoiceChip
                key={day}
                label={day.slice(0, 3)}
                selected={trainingDays.includes(day)}
                onPress={() => toggle(trainingDays, day, setTrainingDays)}
              />
            ))}
          </View>
          <FormField
            label="Preferred workout duration (minutes)"
            keyboardType="number-pad"
            value={duration}
            onChangeText={setDuration}
          />
          <Text
            style={[
              styles.summary,
              { backgroundColor: colors.primarySoft, color: colors.primary },
            ]}
          >
            {trainingDays.length} sessions per week · {duration || 0} minutes
            each
          </Text>
        </>
      ) : null}
      {step === 3 ? (
        <>
          <FormField
            label="Daily water target (ml)"
            keyboardType="number-pad"
            value={water}
            onChangeText={setWater}
          />
          <View style={styles.row}>
            <View style={styles.flex}>
              <FormField
                label="Bedtime (HH:mm)"
                value={bedtime}
                onChangeText={setBedtime}
              />
            </View>
            <View style={styles.flex}>
              <FormField
                label="Wake time"
                value={wakeTime}
                onChangeText={setWakeTime}
              />
            </View>
          </View>
          <Text
            style={[
              styles.summary,
              { backgroundColor: colors.primarySoft, color: colors.primary },
            ]}
          >
            Your first weekly plan will be created immediately after this step.
          </Text>
        </>
      ) : null}
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      <View style={styles.actions}>
        {step > 0 ? (
          <Pressable
            onPress={() => setStep(value => value - 1)}
            style={styles.back}
          >
            <Text style={[styles.backText, { color: colors.muted }]}>Back</Text>
          </Pressable>
        ) : null}
        <View style={styles.flex}>
          <PrimaryButton
            label={step === 3 ? 'Create my plan' : 'Continue'}
            loading={saving}
            onPress={step === 3 ? submit : next}
          />
        </View>
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  step: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  percent: { fontFamily: fonts.body, fontSize: 12 },
  track: { borderRadius: 99, height: 5, overflow: 'hidden' },
  progress: { borderRadius: 99, height: 5 },
  title: { fontFamily: fonts.display, fontSize: 42, marginTop: 8 },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 6,
  },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  label: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6,
  },
  hint: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  equipmentGroup: { gap: 7, marginTop: 3 },
  equipmentGroupLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  summary: {
    borderRadius: 16,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    padding: 14,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  back: { paddingHorizontal: 12, paddingVertical: 16 },
  backText: { fontFamily: fonts.body, fontWeight: '800' },
});
