import {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AppIcon} from '../../components/AppIcon';
import {Card} from '../../components/Card';
import {Screen} from '../../components/Screen';
import {StateView} from '../../components/StateView';
import {apiErrorMessage} from '../../services/http';
import {workoutApi} from '../../services/workoutApi';
import {useTheme} from '../../theme/ThemeProvider';
import {fonts} from '../../theme/typography';
import type {Exercise} from '../../types/workout';

export function ExerciseCatalogueScreen() {
  const {colors} = useTheme(); const [items, setItems] = useState<Exercise[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string>();
  async function load() { setLoading(true); setError(undefined); try { setItems(await workoutApi.exercises()); } catch (caught) { setError(apiErrorMessage(caught)); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  return <Screen scroll><Text style={[styles.eyebrow, {color: colors.primary}]}>MOVE LIBRARY</Text><Text style={[styles.title, {color: colors.text}]}>Exercises</Text><Text style={[styles.subtitle, {color: colors.muted}]}>A focused catalogue of movements selected for your first training plans.</Text>
    {loading ? <StateView title="Loading exercises" message="Preparing the movement library." /> : error ? <StateView title="Catalogue unavailable" message={error} icon="retry" actionLabel="Try again" onAction={load} /> : <View style={styles.list}>{items.map(item => <Card key={item.id}><View style={styles.cardHeader}><View style={[styles.icon, {backgroundColor: colors.primarySoft}]}><AppIcon name="dumbbell" color={colors.primary} /></View><View style={styles.flex}><Text style={[styles.name, {color: colors.text}]}>{item.name}</Text><Text style={[styles.meta, {color: colors.muted}]}>{item.muscleGroup} · {item.equipment}</Text></View>{item.cameraSupported ? <View style={[styles.camera, {backgroundColor: colors.primarySoft}]}><AppIcon name="camera" color={colors.primary} size={13} /><Text style={[styles.cameraText, {color: colors.primary}]}>VISION</Text></View> : null}</View><Text style={[styles.instructions, {color: colors.muted}]}>{item.instructions}</Text></Card>)}</View>}
  </Screen>;
}
const styles = StyleSheet.create({eyebrow: {fontFamily: fonts.body, fontSize: 11, fontWeight: '900', letterSpacing: 1.5}, title: {fontFamily: fonts.display, fontSize: 42}, subtitle: {fontFamily: fonts.body, fontSize: 15, lineHeight: 22}, list: {gap: 12}, cardHeader: {alignItems: 'center', flexDirection: 'row', gap: 12}, icon: {alignItems: 'center', borderRadius: 16, height: 42, justifyContent: 'center', width: 42}, flex: {flex: 1}, name: {fontFamily: fonts.displaySemibold, fontSize: 21}, meta: {fontFamily: fonts.body, fontSize: 12}, camera: {alignItems: 'center', borderRadius: 99, flexDirection: 'row', gap: 5, paddingHorizontal: 9, paddingVertical: 6}, cameraText: {fontFamily: fonts.body, fontSize: 9, fontWeight: '900'}, instructions: {fontFamily: fonts.body, fontSize: 14, lineHeight: 20, marginTop: 12}});
