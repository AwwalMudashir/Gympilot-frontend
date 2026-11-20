import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { Card } from '../../components/Card';
import { ChoiceChip } from '../../components/ChoiceChip';
import { FormField } from '../../components/FormField';
import { NotificationPreferencesCard } from '../../components/NotificationPreferencesCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { StateView } from '../../components/StateView';
import { DetailedWorkoutAnalytics } from '../../components/WorkoutAnalyticsView';
import { equipmentGroups } from '../../config/trainingOptions';
import { apiErrorMessage } from '../../services/http';
import { profileApi } from '../../services/profileApi';
import { workoutApi } from '../../services/workoutApi';
import { useAuthStore } from '../../store/authStore';
import { useTheme, type ThemePreference } from '../../theme/ThemeProvider';
import { fonts } from '../../theme/typography';
import type {
  DayOfWeek,
  ExperienceLevel,
  FitnessGoal,
  Profile,
  ProfilePayload,
} from '../../types/profile';
import type { WorkoutAnalytics } from '../../types/workout';

const goalOptions: { value: FitnessGoal; label: string }[] = [
  { value: 'GENERAL_FITNESS', label: 'General fitness' },
  { value: 'MUSCLE_GAIN', label: 'Build muscle' },
  { value: 'WEIGHT_LOSS', label: 'Lose weight' },
  { value: 'STRENGTH', label: 'Get stronger' },
  { value: 'CONSISTENCY', label: 'Stay consistent' },
  { value: 'MAINTENANCE', label: 'Maintain fitness' },
];
const experienceOptions: ExperienceLevel[] = [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
];
const dayOptions: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

function sameValues<T extends string>(first: T[], second: T[]) {
  return [...first].sort().join('|') === [...second].sort().join('|');
}

function planPreferencesChanged(previous: Profile, next: Profile) {
  return (
    previous.fitnessGoal !== next.fitnessGoal ||
    previous.experienceLevel !== next.experienceLevel ||
    previous.workoutDurationMinutes !== next.workoutDurationMinutes ||
    !sameValues(previous.availableEquipment, next.availableEquipment) ||
    !sameValues(previous.preferredWorkoutDays, next.preferredWorkoutDays)
  );
}

export function ProfileScreen() {
  const { colors, preference, setPreference } = useTheme();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const updatePicture = useAuthStore(s => s.updateProfilePicture);
  const [profile, setProfile] = useState<Profile>();
  const [analytics, setAnalytics] = useState<WorkoutAnalytics>();
  const [showWorkoutData, setShowWorkoutData] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [duration, setDuration] = useState('');
  const [waterTarget, setWaterTarget] = useState('2000');
  const [preferredBedtime, setPreferredBedtime] = useState('22:30');
  const [preferredWakeTime, setPreferredWakeTime] = useState('06:30');
  const [sleepTarget, setSleepTarget] = useState('480');
  const [location, setLocation] = useState('');
  const [goal, setGoal] = useState<FitnessGoal>('GENERAL_FITNESS');
  const [experience, setExperience] = useState<ExperienceLevel>('BEGINNER');
  const [equipment, setEquipment] = useState<string[]>([]);
  const [trainingDays, setTrainingDays] = useState<DayOfWeek[]>([]);
  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const [value, analyticsValue] = await Promise.all([
        profileApi.get(),
        workoutApi.analytics().catch(() => undefined),
      ]);
      setProfile(value);
      setAnalytics(analyticsValue);
      setAge(String(value.age));
      setHeight(String(value.heightCm));
      setWeight(String(value.weightKg));
      setDuration(String(value.workoutDurationMinutes));
      setWaterTarget(String(value.dailyWaterTargetMl ?? 2000));
      setPreferredBedtime(value.preferredBedtime ?? '22:30');
      setPreferredWakeTime(value.preferredWakeTime ?? '06:30');
      setSleepTarget(String(value.sleepTargetMinutes ?? 480));
      setLocation(value.preferredWorkoutLocation);
      setGoal(value.fitnessGoal);
      setExperience(value.experienceLevel);
      setEquipment(value.availableEquipment);
      setTrainingDays(value.preferredWorkoutDays);
    } catch (caught) {
      setError(apiErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );
  async function upload() {
    setSaving(true);
    try {
      const result = await profileApi.chooseAndUploadPicture();
      if (result) {
        updatePicture(result.url);
        await load();
      }
    } catch (caught) {
      setError(apiErrorMessage(caught, 'Could not upload that image.'));
    } finally {
      setSaving(false);
    }
  }
  async function removePicture() {
    setSaving(true);
    try {
      await profileApi.deletePicture();
      updatePicture(undefined);
      await load();
    } catch (caught) {
      setError(apiErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }
  function toggle<T>(current: T[], item: T, setter: (next: T[]) => void) {
    setter(
      current.includes(item)
        ? current.filter(value => value !== item)
        : [...current, item],
    );
  }

  async function regeneratePlanForProfile(targetProfile: Profile) {
    setSaving(true);
    setError(undefined);
    try {
      await workoutApi.regeneratePlan();
      Alert.alert(
        'Plan regenerated',
        `Your week now uses ${targetProfile.daysPerWeek} training days with sessions targeting a maximum of ${targetProfile.workoutDurationMinutes} minutes.`,
      );
    } catch (caught) {
      const message = apiErrorMessage(
        caught,
        'Your profile was saved, but the plan could not be regenerated.',
      );
      setError(message);
      Alert.alert('Could not regenerate plan', message);
    } finally {
      setSaving(false);
    }
  }

  function promptForPlanRegeneration(updatedProfile: Profile) {
    Alert.alert(
      'Regenerate your workout plan?',
      'Your schedule or training preferences changed. Regenerate this week so the selected days, exercises, sets and rest periods match your updated profile.',
      [
        { text: 'Keep current plan', style: 'cancel' },
        {
          text: 'Regenerate plan',
          onPress: () => regeneratePlanForProfile(updatedProfile),
        },
      ],
    );
  }

  async function save() {
    if (!profile) return;
    const ageValue = Number(age);
    const heightValue = Number(height);
    const weightValue = Number(weight);
    const durationValue = Number(duration);
    const waterTargetValue = Number(waterTarget);
    const sleepTargetValue = Number(sleepTarget);
    const validTime = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (
      ageValue < 13 ||
      ageValue > 120 ||
      heightValue < 80 ||
      heightValue > 250 ||
      weightValue < 25 ||
      weightValue > 400 ||
      durationValue < 10 ||
      durationValue > 300 ||
      waterTargetValue < 250 ||
      waterTargetValue > 10000 ||
      sleepTargetValue < 180 ||
      sleepTargetValue > 900 ||
      !validTime.test(preferredBedtime) ||
      !validTime.test(preferredWakeTime) ||
      !location.trim() ||
      trainingDays.length === 0
    ) {
      setError(
        'Check your measurements, schedule, recovery targets and 24-hour sleep times.',
      );
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      const payload: ProfilePayload = {
        age: ageValue,
        heightCm: heightValue,
        weightKg: weightValue,
        workoutDurationMinutes: durationValue,
        preferredWorkoutLocation: location.trim(),
        experienceLevel: experience,
        fitnessGoal: goal,
        availableEquipment: equipment,
        preferredWorkoutDays: trainingDays,
        daysPerWeek: trainingDays.length,
        dailyWaterTargetMl: waterTargetValue,
        preferredBedtime,
        preferredWakeTime,
        sleepTargetMinutes: sleepTargetValue,
        waistCm: profile.waistCm,
        chestCm: profile.chestCm,
        armCm: profile.armCm,
      };
      const previousProfile = profile;
      const updated = await profileApi.update(payload);
      setProfile(updated);
      setEditing(false);
      if (planPreferencesChanged(previousProfile, updated)) {
        promptForPlanRegeneration(updated);
      }
    } catch (caught) {
      setError(apiErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <Screen>
        <StateView
          title="Loading your profile"
          message="Bringing your training preferences together."
        />
      </Screen>
    );
  if (!profile)
    return (
      <Screen>
        <StateView
          title="Profile unavailable"
          message={error ?? 'We could not load your profile.'}
          actionLabel="Try again"
          onAction={load}
          icon="retry"
        />
      </Screen>
    );
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`;
  return (
    <Screen scroll>
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            YOUR ACCOUNT
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        </View>
        <Pressable
          onPress={() => setEditing(value => !value)}
          style={[styles.edit, { backgroundColor: colors.primarySoft }]}
        >
          <AppIcon name="pen" color={colors.primary} />
        </Pressable>
      </View>
      <Card>
        <View style={styles.identity}>
          {profile.profilePictureUrl ? (
            <Image
              source={{ uri: profile.profilePictureUrl }}
              style={styles.avatar}
            />
          ) : (
            <View
              style={[
                styles.avatar,
                styles.initials,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <Text style={[styles.initialText, { color: colors.primary }]}>
                {initials}
              </Text>
            </View>
          )}
          <View style={styles.flex}>
            <Text style={[styles.name, { color: colors.text }]}>
              {profile.firstName} {profile.lastName}
            </Text>
            <Text style={[styles.email, { color: colors.muted }]}>
              {profile.email}
            </Text>
          </View>
        </View>
        <View style={styles.pictureActions}>
          <View style={styles.flex}>
            <PrimaryButton
              label={
                profile.profilePictureUrl
                  ? 'Replace photo'
                  : 'Add profile photo'
              }
              loading={saving}
              variant="secondary"
              onPress={upload}
            />
          </View>
          {profile.profilePictureUrl ? (
            <Pressable
              onPress={removePicture}
              style={[styles.trash, { borderColor: colors.border }]}
            >
              <AppIcon name="trash" color={colors.danger} />
            </Pressable>
          ) : null}
        </View>
      </Card>
      <Text style={[styles.section, { color: colors.text }]}>
        Training profile
      </Text>
      <Card>
        {editing ? (
          <View style={styles.editForm}>
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
            <Text style={[styles.editLabel, { color: colors.text }]}>
              Fitness goal
            </Text>
            <View style={styles.wrap}>
              {goalOptions.map(item => (
                <ChoiceChip
                  key={item.value}
                  label={item.label}
                  selected={goal === item.value}
                  onPress={() => setGoal(item.value)}
                />
              ))}
            </View>
            <Text style={[styles.editLabel, { color: colors.text }]}>
              Experience
            </Text>
            <View style={styles.wrap}>
              {experienceOptions.map(value => (
                <ChoiceChip
                  key={value}
                  label={value.toLowerCase()}
                  selected={experience === value}
                  onPress={() => setExperience(value)}
                />
              ))}
            </View>
            <FormField
              label="Workout location"
              value={location}
              onChangeText={setLocation}
            />
            <Text style={[styles.editLabel, { color: colors.text }]}>
              Available equipment
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
                  {group.options.map(value => (
                    <ChoiceChip
                      key={value}
                      label={value}
                      selected={equipment.includes(value)}
                      onPress={() => toggle(equipment, value, setEquipment)}
                    />
                  ))}
                </View>
              </View>
            ))}
            <Text style={[styles.editLabel, { color: colors.text }]}>
              Training days
            </Text>
            <View style={styles.wrap}>
              {dayOptions.map(value => (
                <ChoiceChip
                  key={value}
                  label={value.slice(0, 3)}
                  selected={trainingDays.includes(value)}
                  onPress={() => toggle(trainingDays, value, setTrainingDays)}
                />
              ))}
            </View>
            <FormField
              label="Session duration (minutes)"
              keyboardType="number-pad"
              value={duration}
              onChangeText={setDuration}
            />
            <Text style={[styles.editLabel, { color: colors.text }]}>
              Recovery targets
            </Text>
            <Text style={[styles.recoveryHint, { color: colors.muted }]}>
              These settings drive your hydration progress and sleep check-ins.
            </Text>
            <FormField
              label="Daily water target (ml)"
              keyboardType="number-pad"
              value={waterTarget}
              onChangeText={setWaterTarget}
            />
            <View style={styles.row}>
              <View style={styles.flex}>
                <FormField
                  label="Bedtime (24h)"
                  placeholder="22:30"
                  value={preferredBedtime}
                  onChangeText={setPreferredBedtime}
                />
              </View>
              <View style={styles.flex}>
                <FormField
                  label="Wake time (24h)"
                  placeholder="06:30"
                  value={preferredWakeTime}
                  onChangeText={setPreferredWakeTime}
                />
              </View>
            </View>
            <FormField
              label="Sleep target (minutes)"
              keyboardType="number-pad"
              value={sleepTarget}
              onChangeText={setSleepTarget}
            />
            <PrimaryButton
              label="Save changes"
              loading={saving}
              onPress={save}
            />
          </View>
        ) : (
          <View style={styles.metrics}>
            <Metric
              label="Goal"
              value={profile.fitnessGoal.replaceAll('_', ' ')}
            />
            <Metric label="Experience" value={profile.experienceLevel} />
            <Metric
              label="Schedule"
              value={`${profile.daysPerWeek} days · ${profile.workoutDurationMinutes} min`}
            />
            <Metric label="Location" value={profile.preferredWorkoutLocation} />
            <Metric
              label="Water target"
              value={`${profile.dailyWaterTargetMl ?? 2000} ml`}
            />
            <Metric
              label="Sleep target"
              value={`${Math.round(
                (profile.sleepTargetMinutes ?? 480) / 60,
              )} hours`}
            />
          </View>
        )}
      </Card>
      <NotificationPreferencesCard />
      <View style={styles.sectionHeader}>
        <Text style={[styles.section, { color: colors.text }]}>
          Workout data
        </Text>
        {analytics ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowWorkoutData(value => !value)}
            style={[styles.dataToggle, { backgroundColor: colors.primarySoft }]}
          >
            <AppIcon name="chart" color={colors.primary} size={14} />
            <Text style={[styles.dataToggleText, { color: colors.primary }]}>
              {showWorkoutData ? 'Hide details' : 'View details'}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <Card>
        {analytics ? (
          showWorkoutData ? (
            <DetailedWorkoutAnalytics analytics={analytics} />
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowWorkoutData(true)}
              style={styles.dataPreview}
            >
              <View
                style={[
                  styles.dataIcon,
                  { backgroundColor: colors.primarySoft },
                ]}
              >
                <AppIcon name="fire" color={colors.primary} size={19} />
              </View>
              <View style={styles.flex}>
                <Text style={[styles.dataValue, { color: colors.text }]}>
                  {Math.round(analytics.weekCalories)} kcal this week
                </Text>
                <Text style={[styles.dataCaption, { color: colors.muted }]}>
                  {analytics.completedWorkouts} workouts {'\u00B7'}{' '}
                  {analytics.completedExercises} completed exercises
                </Text>
              </View>
              <AppIcon name="chevron" color={colors.muted} size={13} />
            </Pressable>
          )
        ) : (
          <Text style={[styles.caption, { color: colors.muted }]}>
            Workout analytics will appear after your first completed exercise.
          </Text>
        )}
      </Card>
      <Text style={[styles.section, { color: colors.text }]}>Appearance</Text>
      <Card>
        <Text style={[styles.caption, { color: colors.muted }]}>
          Choose how GymBro looks on this device.
        </Text>
        <View style={styles.wrap}>
          {(['system', 'light', 'dark'] as ThemePreference[]).map(value => (
            <ChoiceChip
              key={value}
              label={value[0].toUpperCase() + value.slice(1)}
              selected={preference === value}
              onPress={() => setPreference(value)}
            />
          ))}
        </View>
      </Card>
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      <PrimaryButton
        label="Sign out"
        variant="secondary"
        onPress={() => logout()}
      />
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  title: { fontFamily: fonts.display, fontSize: 42 },
  edit: {
    alignItems: 'center',
    borderRadius: 18,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  identity: { alignItems: 'center', flexDirection: 'row', gap: 14 },
  avatar: { borderRadius: 28, height: 56, width: 56 },
  initials: { alignItems: 'center', justifyContent: 'center' },
  initialText: { fontFamily: fonts.display, fontSize: 24 },
  flex: { flex: 1 },
  name: { fontFamily: fonts.displaySemibold, fontSize: 23 },
  email: { fontFamily: fonts.body, fontSize: 13 },
  pictureActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  trash: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  section: { fontFamily: fonts.displaySemibold, fontSize: 24, marginTop: 5 },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  dataToggle: {
    alignItems: 'center',
    borderRadius: 99,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  dataToggleText: { fontFamily: fonts.body, fontSize: 11, fontWeight: '900' },
  dataPreview: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  dataIcon: {
    alignItems: 'center',
    borderRadius: 15,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  dataValue: { fontFamily: fonts.displaySemibold, fontSize: 20 },
  dataCaption: { fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  editForm: { gap: 22, paddingVertical: 4 },
  row: { flexDirection: 'row', gap: 12 },
  editLabel: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: -12,
  },
  equipmentGroup: { gap: 9, marginTop: 2 },
  equipmentGroupLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  recoveryHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: -10,
  },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  metric: { width: '45%' },
  metricLabel: { fontFamily: fonts.body, fontSize: 12 },
  metricValue: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 3,
    textTransform: 'capitalize',
  },
  caption: { fontFamily: fonts.body, fontSize: 14, marginBottom: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
