import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { fonts } from '../theme/typography';
import type { WorkoutAnalytics } from '../types/workout';
import { AppIcon } from './AppIcon';
import { Card } from './Card';

function calorieLabel(value: number) {
  return Math.round(Number(value) || 0).toLocaleString();
}

function dayLabel(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'narrow',
  });
}

export function WeeklyCalorieBars({
  analytics,
  compact = false,
}: {
  analytics: WorkoutAnalytics;
  compact?: boolean;
}) {
  const { colors } = useTheme();
  const maximum = Math.max(
    1,
    ...analytics.dailyBreakdown.map(day => Number(day.caloriesBurned) || 0),
  );

  return (
    <View style={[styles.chart, compact && styles.compactChart]}>
      {analytics.dailyBreakdown.map(day => {
        const calories = Number(day.caloriesBurned) || 0;
        const height =
          calories === 0 ? 4 : Math.max(9, (calories / maximum) * 64);

        return (
          <View key={day.date} style={styles.barColumn}>
            {!compact ? (
              <Text style={[styles.barValue, { color: colors.muted }]}>
                {Math.round(calories)}
              </Text>
            ) : null}
            <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.bar,
                  {
                    backgroundColor: colors.primary,
                    height,
                  },
                ]}
              />
            </View>
            <Text style={[styles.day, { color: colors.muted }]}>
              {dayLabel(day.date)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function DashboardCalorieCard({
  analytics,
}: {
  analytics: WorkoutAnalytics;
}) {
  const { colors } = useTheme();

  return (
    <Card style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <View style={styles.summaryTitleRow}>
          <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
            <AppIcon name="fire" color={colors.primary} size={17} />
          </View>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>
              ACTIVE ENERGY
            </Text>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              {calorieLabel(analytics.todayCalories)} kcal today
            </Text>
          </View>
        </View>

        <View style={styles.weekTotal}>
          <Text style={[styles.weekValue, { color: colors.text }]}>
            {calorieLabel(analytics.weekCalories)}
          </Text>
          <Text style={[styles.weekLabel, { color: colors.muted }]}>
            KCAL / WEEK
          </Text>
        </View>
      </View>

      <WeeklyCalorieBars analytics={analytics} compact />
      <Text style={[styles.estimateNote, { color: colors.muted }]}>
        Estimates use your weight, completed sets and exercise intensity.
      </Text>
    </Card>
  );
}

export function DetailedWorkoutAnalytics({
  analytics,
}: {
  analytics: WorkoutAnalytics;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.details}>
      <View style={styles.statRow}>
        <View style={[styles.stat, { backgroundColor: colors.primarySoft }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {calorieLabel(analytics.weekCalories)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>
            kcal burned
          </Text>
        </View>
        <View style={[styles.stat, { backgroundColor: colors.primarySoft }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {analytics.completedWorkouts}
          </Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>
            workouts
          </Text>
        </View>
        <View style={[styles.stat, { backgroundColor: colors.primarySoft }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {analytics.completedExercises}
          </Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>
            exercises
          </Text>
        </View>
      </View>

      <Text style={[styles.detailTitle, { color: colors.text }]}>
        Daily activity
      </Text>
      <WeeklyCalorieBars analytics={analytics} />

      <Text style={[styles.detailTitle, { color: colors.text }]}>
        Exercise breakdown
      </Text>
      {analytics.exerciseBreakdown.length === 0 ? (
        <Text style={[styles.empty, { color: colors.muted }]}>
          Complete an exercise to start your weekly breakdown.
        </Text>
      ) : (
        analytics.exerciseBreakdown.map(exercise => (
          <View
            key={exercise.exerciseId}
            style={[styles.exerciseRow, { borderBottomColor: colors.border }]}
          >
            <View style={styles.exerciseNameWrap}>
              <Text style={[styles.exerciseName, { color: colors.text }]}>
                {exercise.exerciseName}
              </Text>
              <Text style={[styles.exerciseSets, { color: colors.muted }]}>
                {exercise.completedSets} completed sets
              </Text>
            </View>
            <Text style={[styles.exerciseCalories, { color: colors.primary }]}>
              {calorieLabel(exercise.caloriesBurned)} kcal
            </Text>
          </View>
        ))
      )}

      <Text style={[styles.estimateNote, { color: colors.muted }]}>
        Calorie values are fitness estimates, not medical measurements.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: { overflow: 'hidden' },
  summaryHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  icon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  summaryTitle: { fontFamily: fonts.displaySemibold, fontSize: 21 },
  weekTotal: { alignItems: 'flex-end' },
  weekValue: { fontFamily: fonts.display, fontSize: 24 },
  weekLabel: {
    fontFamily: fonts.body,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 7,
    height: 100,
    justifyContent: 'space-between',
    marginTop: 15,
  },
  compactChart: { height: 76, marginTop: 12 },
  barColumn: { alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  barTrack: {
    borderRadius: 8,
    height: 66,
    justifyContent: 'flex-end',
    maxWidth: 24,
    overflow: 'hidden',
    width: '70%',
  },
  bar: { borderRadius: 8, minHeight: 4, width: '100%' },
  barValue: { fontFamily: fonts.body, fontSize: 8, marginBottom: 3 },
  day: { fontFamily: fonts.body, fontSize: 9, fontWeight: '800', marginTop: 5 },
  estimateNote: {
    fontFamily: fonts.body,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 11,
  },
  details: { gap: 16 },
  statRow: { flexDirection: 'row', gap: 8 },
  stat: { borderRadius: 15, flex: 1, minHeight: 78, padding: 11 },
  statValue: { fontFamily: fonts.display, fontSize: 24 },
  statLabel: { fontFamily: fonts.body, fontSize: 10, marginTop: 2 },
  detailTitle: { fontFamily: fonts.displaySemibold, fontSize: 20 },
  exerciseRow: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  exerciseNameWrap: { flex: 1, paddingRight: 10 },
  exerciseName: { fontFamily: fonts.body, fontSize: 13, fontWeight: '800' },
  exerciseSets: { fontFamily: fonts.body, fontSize: 10, marginTop: 2 },
  exerciseCalories: { fontFamily: fonts.displaySemibold, fontSize: 16 },
  empty: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
});
