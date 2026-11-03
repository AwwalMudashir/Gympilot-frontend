import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useCallback, useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AppIcon} from '../../components/AppIcon';
import {Card} from '../../components/Card';
import {Screen} from '../../components/Screen';
import {StateView} from '../../components/StateView';
import type {MainStackParamList} from '../../navigation/types';
import {apiErrorMessage} from '../../services/http';
import {workoutApi} from '../../services/workoutApi';
import {useTheme} from '../../theme/ThemeProvider';
import {fonts} from '../../theme/typography';
import type {WorkoutDay} from '../../types/workout';

type Props = NativeStackScreenProps<MainStackParamList, 'WorkoutDetail'>;
export function WorkoutDetailScreen({route}: Props) {
  const {colors} = useTheme(); const [workout, setWorkout] = useState<WorkoutDay>(); const [loading, setLoading] = useState(true); const [error, setError] = useState<string>();
  const desiredDay = route.params?.day;
  const load = useCallback(async () => { setLoading(true); try { const plan = await workoutApi.currentPlan(); const desired = desiredDay ?? new Date().toLocaleDateString('en-US', {weekday: 'long'}).toUpperCase(); setWorkout(plan.days.find(day => day.day === desired)); } catch (caught) { setError(apiErrorMessage(caught)); } finally { setLoading(false); } }, [desiredDay]);
  useEffect(() => { load(); }, [load]);
  if (loading) return <Screen><StateView title="Loading workout" message="Getting your session ready." /></Screen>;
  if (!workout) return <Screen><StateView title="Recovery day" message={error ?? 'No training is scheduled for this day. Recovery is part of the plan.'} icon="moon" /></Screen>;
  return <Screen scroll><Text style={[styles.eyebrow, {color: colors.primary}]}>{workout.day}</Text><Text style={[styles.title, {color: colors.text}]}>{workout.title}</Text><View style={styles.meta}><Text style={[styles.metaText, {color: colors.muted}]}>{workout.exercises.length} exercises</Text><Text style={[styles.metaText, {color: colors.muted}]}>{workout.estimatedMinutes} min</Text></View>
    {workout.exercises.map((item, index) => <Card key={item.id}><View style={styles.exerciseRow}><Text style={[styles.number, {color: colors.primary}]}>{String(index + 1).padStart(2, '0')}</Text><View style={styles.flex}><Text style={[styles.name, {color: colors.text}]}>{item.exercise.name}</Text><Text style={[styles.prescription, {color: colors.primary}]}>{item.sets} sets × {item.targetRepetitions} reps</Text></View>{item.cameraSupported ? <AppIcon name="camera" color={colors.primary} /> : null}</View><Text style={[styles.instructions, {color: colors.muted}]}>{item.exercise.instructions}</Text><View style={[styles.rest, {borderTopColor: colors.border}]}><AppIcon name="clock" color={colors.muted} size={13} /><Text style={[styles.restText, {color: colors.muted}]}>{item.restSeconds}s rest between sets</Text></View></Card>)}
  </Screen>;
}
const styles = StyleSheet.create({eyebrow: {fontFamily: fonts.body, fontSize: 11, fontWeight: '900', letterSpacing: 1.5}, title: {fontFamily: fonts.display, fontSize: 42}, meta: {flexDirection: 'row', gap: 16}, metaText: {fontFamily: fonts.body, fontSize: 13, fontWeight: '700'}, exerciseRow: {alignItems: 'center', flexDirection: 'row', gap: 12}, number: {fontFamily: fonts.display, fontSize: 25}, flex: {flex: 1}, name: {fontFamily: fonts.displaySemibold, fontSize: 22}, prescription: {fontFamily: fonts.body, fontSize: 13, fontWeight: '800'}, instructions: {fontFamily: fonts.body, fontSize: 14, lineHeight: 20, marginTop: 12}, rest: {alignItems: 'center', borderTopWidth: 1, flexDirection: 'row', gap: 7, marginTop: 14, paddingTop: 12}, restText: {fontFamily: fonts.body, fontSize: 12}});
