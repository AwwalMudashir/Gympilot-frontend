import {useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {AppIcon} from '../../components/AppIcon';
import {Card} from '../../components/Card';
import {ChoiceChip} from '../../components/ChoiceChip';
import {FormField} from '../../components/FormField';
import {PrimaryButton} from '../../components/PrimaryButton';
import {Screen} from '../../components/Screen';
import {StateView} from '../../components/StateView';
import {apiErrorMessage} from '../../services/http';
import {profileApi} from '../../services/profileApi';
import {useAuthStore} from '../../store/authStore';
import {useTheme, type ThemePreference} from '../../theme/ThemeProvider';
import {fonts} from '../../theme/typography';
import type {DayOfWeek, ExperienceLevel, FitnessGoal, Profile, ProfilePayload} from '../../types/profile';

const goalOptions: {value: FitnessGoal; label: string}[] = [
  {value: 'GENERAL_FITNESS', label: 'General fitness'}, {value: 'MUSCLE_GAIN', label: 'Build muscle'},
  {value: 'WEIGHT_LOSS', label: 'Lose weight'}, {value: 'STRENGTH', label: 'Get stronger'},
  {value: 'CONSISTENCY', label: 'Stay consistent'}, {value: 'MAINTENANCE', label: 'Maintain fitness'},
];
const experienceOptions: ExperienceLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const dayOptions: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const equipmentOptions = ['Dumbbells', 'Resistance bands', 'Bench', 'Kettlebell'];

export function ProfileScreen() {
  const {colors, preference, setPreference} = useTheme(); const user = useAuthStore(s => s.user); const logout = useAuthStore(s => s.logout); const updatePicture = useAuthStore(s => s.updateProfilePicture);
  const [profile, setProfile] = useState<Profile>(); const [editing, setEditing] = useState(false); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState<string>();
  const [age, setAge] = useState(''); const [height, setHeight] = useState(''); const [weight, setWeight] = useState(''); const [duration, setDuration] = useState(''); const [location, setLocation] = useState('');
  const [goal, setGoal] = useState<FitnessGoal>('GENERAL_FITNESS'); const [experience, setExperience] = useState<ExperienceLevel>('BEGINNER');
  const [equipment, setEquipment] = useState<string[]>([]); const [trainingDays, setTrainingDays] = useState<DayOfWeek[]>([]);
  async function load() { setLoading(true); setError(undefined); try { const value = await profileApi.get(); setProfile(value); setAge(String(value.age)); setHeight(String(value.heightCm)); setWeight(String(value.weightKg)); setDuration(String(value.workoutDurationMinutes)); setLocation(value.preferredWorkoutLocation); setGoal(value.fitnessGoal); setExperience(value.experienceLevel); setEquipment(value.availableEquipment); setTrainingDays(value.preferredWorkoutDays); } catch (caught) { setError(apiErrorMessage(caught)); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  async function upload() { setSaving(true); try { const result = await profileApi.chooseAndUploadPicture(); if (result) { updatePicture(result.url); await load(); } } catch (caught) { setError(apiErrorMessage(caught, 'Could not upload that image.')); } finally { setSaving(false); } }
  async function removePicture() { setSaving(true); try { await profileApi.deletePicture(); updatePicture(undefined); await load(); } catch (caught) { setError(apiErrorMessage(caught)); } finally { setSaving(false); } }
  function toggle<T>(current: T[], item: T, setter: (next: T[]) => void) { setter(current.includes(item) ? current.filter(value => value !== item) : [...current, item]); }
  async function save() {
    if (!profile) return;
    const ageValue = Number(age); const heightValue = Number(height); const weightValue = Number(weight); const durationValue = Number(duration);
    if (ageValue < 13 || ageValue > 120 || heightValue < 80 || heightValue > 250
        || weightValue < 25 || weightValue > 400 || durationValue < 10 || durationValue > 300
        || !location.trim() || trainingDays.length === 0) {
      setError('Check your measurements, location, training days and session duration.');
      return;
    }
    setSaving(true); setError(undefined);
    try { const payload: ProfilePayload = {age: ageValue, heightCm: heightValue, weightKg: weightValue, workoutDurationMinutes: durationValue, preferredWorkoutLocation: location.trim(), experienceLevel: experience, fitnessGoal: goal, availableEquipment: equipment, preferredWorkoutDays: trainingDays, daysPerWeek: trainingDays.length, dailyWaterTargetMl: profile.dailyWaterTargetMl, preferredBedtime: profile.preferredBedtime, preferredWakeTime: profile.preferredWakeTime, sleepTargetMinutes: profile.sleepTargetMinutes, waistCm: profile.waistCm, chestCm: profile.chestCm, armCm: profile.armCm}; const updated = await profileApi.update(payload); setProfile(updated); setEditing(false); } catch (caught) { setError(apiErrorMessage(caught)); } finally { setSaving(false); }
  }
  if (loading) return <Screen><StateView title="Loading your profile" message="Bringing your training preferences together." /></Screen>;
  if (!profile) return <Screen><StateView title="Profile unavailable" message={error ?? 'We could not load your profile.'} actionLabel="Try again" onAction={load} icon="retry" /></Screen>;
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`;
  return <Screen scroll>
    <View style={styles.header}><View><Text style={[styles.eyebrow, {color: colors.primary}]}>YOUR ACCOUNT</Text><Text style={[styles.title, {color: colors.text}]}>Profile</Text></View><Pressable onPress={() => setEditing(value => !value)} style={[styles.edit, {backgroundColor: colors.primarySoft}]}><AppIcon name="pen" color={colors.primary} /></Pressable></View>
    <Card><View style={styles.identity}>{profile.profilePictureUrl ? <Image source={{uri: profile.profilePictureUrl}} style={styles.avatar} /> : <View style={[styles.avatar, styles.initials, {backgroundColor: colors.primarySoft}]}><Text style={[styles.initialText, {color: colors.primary}]}>{initials}</Text></View>}<View style={styles.flex}><Text style={[styles.name, {color: colors.text}]}>{profile.firstName} {profile.lastName}</Text><Text style={[styles.email, {color: colors.muted}]}>{profile.email}</Text></View></View><View style={styles.pictureActions}><View style={styles.flex}><PrimaryButton label={profile.profilePictureUrl ? 'Replace photo' : 'Add profile photo'} loading={saving} variant="secondary" onPress={upload} /></View>{profile.profilePictureUrl ? <Pressable onPress={removePicture} style={[styles.trash, {borderColor: colors.border}]}><AppIcon name="trash" color={colors.danger} /></Pressable> : null}</View></Card>
    <Text style={[styles.section, {color: colors.text}]}>Training profile</Text>
    <Card>{editing ? <><View style={styles.row}><View style={styles.flex}><FormField label="Age" keyboardType="number-pad" value={age} onChangeText={setAge} /></View><View style={styles.flex}><FormField label="Height (cm)" keyboardType="decimal-pad" value={height} onChangeText={setHeight} /></View></View><FormField label="Weight (kg)" keyboardType="decimal-pad" value={weight} onChangeText={setWeight} /><Text style={[styles.editLabel, {color: colors.text}]}>Fitness goal</Text><View style={styles.wrap}>{goalOptions.map(item => <ChoiceChip key={item.value} label={item.label} selected={goal === item.value} onPress={() => setGoal(item.value)} />)}</View><Text style={[styles.editLabel, {color: colors.text}]}>Experience</Text><View style={styles.wrap}>{experienceOptions.map(value => <ChoiceChip key={value} label={value.toLowerCase()} selected={experience === value} onPress={() => setExperience(value)} />)}</View><FormField label="Workout location" value={location} onChangeText={setLocation} /><Text style={[styles.editLabel, {color: colors.text}]}>Available equipment</Text><View style={styles.wrap}>{equipmentOptions.map(value => <ChoiceChip key={value} label={value} selected={equipment.includes(value)} onPress={() => toggle(equipment, value, setEquipment)} />)}</View><Text style={[styles.editLabel, {color: colors.text}]}>Training days</Text><View style={styles.wrap}>{dayOptions.map(value => <ChoiceChip key={value} label={value.slice(0, 3)} selected={trainingDays.includes(value)} onPress={() => toggle(trainingDays, value, setTrainingDays)} />)}</View><FormField label="Session duration (minutes)" keyboardType="number-pad" value={duration} onChangeText={setDuration} /><PrimaryButton label="Save changes" loading={saving} onPress={save} /></> : <View style={styles.metrics}><Metric label="Goal" value={profile.fitnessGoal.replaceAll('_', ' ')} /><Metric label="Experience" value={profile.experienceLevel} /><Metric label="Schedule" value={`${profile.daysPerWeek} days · ${profile.workoutDurationMinutes} min`} /><Metric label="Location" value={profile.preferredWorkoutLocation} /></View>}</Card>
    <Text style={[styles.section, {color: colors.text}]}>Appearance</Text><Card><Text style={[styles.caption, {color: colors.muted}]}>Choose how GymPilot looks on this device.</Text><View style={styles.wrap}>{(['system', 'light', 'dark'] as ThemePreference[]).map(value => <ChoiceChip key={value} label={value[0].toUpperCase() + value.slice(1)} selected={preference === value} onPress={() => setPreference(value)} />)}</View></Card>
    {error ? <Text style={{color: colors.danger}}>{error}</Text> : null}<PrimaryButton label="Sign out" variant="secondary" onPress={() => logout()} />
  </Screen>;
}

function Metric({label, value}: {label: string; value: string}) { const {colors} = useTheme(); return <View style={styles.metric}><Text style={[styles.metricLabel, {color: colors.muted}]}>{label}</Text><Text style={[styles.metricValue, {color: colors.text}]}>{value}</Text></View>; }
const styles = StyleSheet.create({header: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'}, eyebrow: {fontFamily: fonts.body, fontSize: 11, fontWeight: '900', letterSpacing: 1.5}, title: {fontFamily: fonts.display, fontSize: 42}, edit: {alignItems: 'center', borderRadius: 18, height: 46, justifyContent: 'center', width: 46}, identity: {alignItems: 'center', flexDirection: 'row', gap: 14}, avatar: {borderRadius: 28, height: 56, width: 56}, initials: {alignItems: 'center', justifyContent: 'center'}, initialText: {fontFamily: fonts.display, fontSize: 24}, flex: {flex: 1}, name: {fontFamily: fonts.displaySemibold, fontSize: 23}, email: {fontFamily: fonts.body, fontSize: 13}, pictureActions: {alignItems: 'center', flexDirection: 'row', gap: 10, marginTop: 16}, trash: {alignItems: 'center', borderRadius: 14, borderWidth: 1, height: 50, justifyContent: 'center', width: 50}, section: {fontFamily: fonts.displaySemibold, fontSize: 24, marginTop: 5}, row: {flexDirection: 'row', gap: 10}, editLabel: {fontFamily: fonts.body, fontSize: 14, fontWeight: '800', marginTop: 5}, metrics: {flexDirection: 'row', flexWrap: 'wrap', gap: 16}, metric: {width: '45%'}, metricLabel: {fontFamily: fonts.body, fontSize: 12}, metricValue: {fontFamily: fonts.body, fontSize: 14, fontWeight: '800', marginTop: 3, textTransform: 'capitalize'}, caption: {fontFamily: fonts.body, fontSize: 14, marginBottom: 12}, wrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 8}});
