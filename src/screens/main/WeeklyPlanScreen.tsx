import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '../../components/AppIcon';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { StateView } from '../../components/StateView';
import { StatusNotice } from '../../components/StatusNotice';
import type { MainStackParamList } from '../../navigation/types';
import { apiErrorMessage } from '../../services/http';
import { workoutApi } from '../../services/workoutApi';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts } from '../../theme/typography';
import type { WorkoutPlan } from '../../types/workout';

export function WeeklyPlanScreen() {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [plan, setPlan] = useState<WorkoutPlan>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setPlan(await workoutApi.currentPlan());
    } catch (caught) {
      setError(apiErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  async function generate() {
    setLoading(true);
    setError(undefined);
    try {
      setPlan(await workoutApi.generatePlan());
    } catch (caught) {
      setError(apiErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  async function regenerate() {
    setLoading(true);
    setError(undefined);
    try {
      setPlan(await workoutApi.regeneratePlan());
    } catch (caught) {
      setError(apiErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  function confirmRegenerate() {
    Alert.alert(
      'Regenerate this week?',
      'Your current plan will be archived and replaced with a new plan.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Regenerate', style: 'destructive', onPress: regenerate },
      ],
    );
  }

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [load]),
  );

  return (
    <Screen scroll>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>THIS WEEK</Text>
      <Text style={[styles.title, { color: colors.text }]}>
        Your training plan
      </Text>
      {plan && error ? <StatusNotice message={error} tone="error" /> : null}
      {loading ? (
        <StateView
          title="Building your week"
          message="Balancing your goal, schedule and available equipment."
        />
      ) : !plan ? (
        <StateView
          title="Your plan is ready to be built"
          message={
            error ?? 'Generate a personalised week from your fitness profile.'
          }
          actionLabel="Generate my plan"
          onAction={generate}
        />
      ) : (
        <>
          <Card style={{ backgroundColor: colors.primary }}>
            <Text style={[styles.planLabel, { color: colors.textOnPrimary }]}>
              ACTIVE PROGRAM
            </Text>
            <Text style={[styles.planHero, { color: colors.textOnPrimary }]}>
              {plan.workoutDays} training days
            </Text>
            <Text style={[styles.planText, { color: colors.textOnPrimary }]}>
              {plan.explanation}
            </Text>
            <View style={styles.stats}>
              <Text style={[styles.stat, { color: colors.textOnPrimary }]}>
                {plan.totalExercises} movements
              </Text>
              <Text style={[styles.stat, { color: colors.textOnPrimary }]}>
                Week of {plan.weekStartDate}
              </Text>
            </View>
          </Card>
          <View style={styles.days}>
            {plan.days.map(day => (
              <Pressable
                key={day.day}
                onPress={() =>
                  navigation.navigate('WorkoutDetail', { day: day.day })
                }
              >
                <Card>
                  <View style={styles.dayRow}>
                    <View
                      style={[
                        styles.dayBadge,
                        { backgroundColor: colors.primarySoft },
                      ]}
                    >
                      <Text
                        style={[styles.dayShort, { color: colors.primary }]}
                      >
                        {day.day.slice(0, 3)}
                      </Text>
                    </View>
                    <View style={styles.flex}>
                      <Text style={[styles.dayTitle, { color: colors.text }]}>
                        {day.title}
                      </Text>
                      <Text style={[styles.dayMeta, { color: colors.muted }]}>
                        {day.exercises.length} exercises ·{' '}
                        {day.estimatedMinutes} min
                      </Text>
                    </View>
                    <AppIcon name="chevron" color={colors.muted} />
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
          <PrimaryButton
            label="Regenerate plan"
            variant="secondary"
            onPress={confirmRegenerate}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  title: { fontFamily: fonts.display, fontSize: 42 },
  planLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    opacity: 0.8,
  },
  planHero: { fontFamily: fonts.display, fontSize: 34, marginTop: 5 },
  planText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  stats: { flexDirection: 'row', gap: 18, marginTop: 14 },
  stat: { fontFamily: fonts.body, fontSize: 12, fontWeight: '800' },
  days: { gap: 10 },
  dayRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  dayBadge: {
    alignItems: 'center',
    borderRadius: 16,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  dayShort: { fontFamily: fonts.display, fontSize: 18 },
  flex: { flex: 1 },
  dayTitle: { fontFamily: fonts.displaySemibold, fontSize: 21 },
  dayMeta: { fontFamily: fonts.body, fontSize: 12 },
});
