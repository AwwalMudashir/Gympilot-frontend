import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../../components/AppIcon';
import { Card } from '../../components/Card';
import { CoachDashboardCard } from '../../components/CoachDashboardCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { StateView } from '../../components/StateView';
import { StatusNotice } from '../../components/StatusNotice';
import { DashboardCalorieCard } from '../../components/WorkoutAnalyticsView';
import type { MainStackParamList } from '../../navigation/types';
import { coachApi } from '../../services/coachApi';
import { apiErrorCode, apiErrorMessage } from '../../services/http';
import { profileApi } from '../../services/profileApi';
import { workoutApi } from '../../services/workoutApi';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts } from '../../theme/typography';
import type { Profile } from '../../types/profile';
import type { CoachBrief } from '../../types/coach';
import type {
  TodayWorkout,
  WorkoutAnalytics,
  WorkoutDay,
  WorkoutPlan,
} from '../../types/workout';

export function DashboardScreen() {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const user = useAuthStore(s => s.user);
  const [today, setToday] = useState<TodayWorkout>();
  const [plan, setPlan] = useState<WorkoutPlan>();
  const [profile, setProfile] = useState<Profile>();
  const [analytics, setAnalytics] = useState<WorkoutAnalytics>();
  const [coachBrief, setCoachBrief] = useState<CoachBrief>();
  const [planState, setPlanState] = useState<'unknown' | 'missing' | 'ready'>(
    'unknown',
  );
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    const [profileResult, planResult] = await Promise.allSettled([
      profileApi.get(),
      workoutApi.ensureCurrentPlan(),
    ]);

    const syncErrors: string[] = [];

    if (profileResult.status === 'fulfilled') {
      setProfile(profileResult.value);
    } else {
      syncErrors.push(apiErrorMessage(profileResult.reason));
    }

    if (planResult.status === 'fulfilled') {
      setPlan(planResult.value);
      setPlanState('ready');
    } else if (apiErrorCode(planResult.reason) === 'RESOURCE_NOT_FOUND') {
      setPlan(undefined);
      setPlanState('missing');
      syncErrors.push(
        apiErrorMessage(
          planResult.reason,
          'Your weekly workout plan could not be prepared.',
        ),
      );
    } else {
      syncErrors.push(
        apiErrorMessage(
          planResult.reason,
          'Your saved workout plan could not be synced.',
        ),
      );
    }

    if (planResult.status === 'fulfilled') {
      try {
        setToday(await workoutApi.today());
      } catch (caught) {
        syncErrors.push(
          apiErrorMessage(caught, "Today's workout could not be refreshed."),
        );
      }
    } else {
      setToday(undefined);
    }

    setError(syncErrors[0]);
    setLoading(false);

    // These cards are secondary. Load them after the dashboard becomes usable
    // so a slow analytics or coach query cannot block the plan and profile.
    Promise.allSettled([workoutApi.analytics(), coachApi.daily()])
      .then(([analyticsResult, coachResult]) => {
        if (analyticsResult.status === 'fulfilled') {
          setAnalytics(analyticsResult.value);
        }

        if (coachResult.status === 'fulfilled') {
          setCoachBrief(coachResult.value);
        }
      })
      .catch(() => undefined);
  }, []);

  async function generate() {
    if (generating) return;

    setGenerating(true);
    setError(undefined);

    try {
      const generatedPlan = await workoutApi.generatePlan();
      setPlan(generatedPlan);
      setPlanState('ready');

      const todayResult = await workoutApi.today();
      setToday(todayResult);

      workoutApi
        .analytics()
        .then(setAnalytics)
        .catch(() => undefined);
    } catch (caught) {
      setError(apiErrorMessage(caught));
    } finally {
      setGenerating(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );
  const greeting =
    new Date().getHours() < 12
      ? 'Good morning'
      : new Date().getHours() < 18
      ? 'Good afternoon'
      : 'Good evening';

  const firstLoad = loading && !profile && planState === 'unknown';

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.muted }]}>
            {greeting},
          </Text>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.firstName}
          </Text>
        </View>
        {user?.profilePictureUrl ? (
          <Image
            source={{ uri: user.profilePictureUrl }}
            style={styles.avatar}
          />
        ) : (
          <View
            style={[styles.avatar, { backgroundColor: colors.primarySoft }]}
          >
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </Text>
          </View>
        )}
      </View>
      {firstLoad ? (
        <StateView
          title="Preparing your day"
          message="Syncing your plan and training profile."
        />
      ) : !profile ? (
        <StateView
          title="Dashboard unavailable"
          message={error ?? 'Your training profile could not be loaded.'}
          icon="retry"
          actionLabel="Try again"
          onAction={load}
        />
      ) : (
        <>
          {error ? <StatusNotice message={error} tone="error" /> : null}

          <Text style={[styles.section, { color: colors.text }]}>
            Today’s focus
          </Text>
          {planState === 'missing' ? (
            <Card>
              <StateView
                title="Your weekly plan needs attention"
                message={
                  error ??
                  'GymBro normally prepares your weekly plan automatically. Try again to recover it.'
                }
                actionLabel="Try again"
                actionLoading={generating}
                onAction={generate}
              />
            </Card>
          ) : !plan ? (
            <Card>
              <StateView
                title="Your saved plan could not be synced"
                message="Your plan has not been removed. Check the connection and try loading it again."
                icon="retry"
                actionLabel="Try again"
                onAction={load}
              />
            </Card>
          ) : !today ? (
            <Card>
              <StateView
                title="Today’s schedule is unavailable"
                message="Your weekly plan is still saved. Refresh to load today’s session."
                icon="retry"
                actionLabel="Refresh schedule"
                onAction={load}
              />
            </Card>
          ) : today.restDay ? (
            <Card style={{ backgroundColor: colors.primarySoft }}>
              <View style={styles.heroTop}>
                <View
                  style={[styles.heroIcon, { backgroundColor: colors.surface }]}
                >
                  <AppIcon name="moon" color={colors.primary} size={23} />
                </View>
                <Text style={[styles.heroTag, { color: colors.primary }]}>
                  RECOVERY DAY
                </Text>
              </View>
              <Text style={[styles.heroTitle, { color: colors.text }]}>
                Reset. Refuel. Come back stronger.
              </Text>
              <Text style={[styles.heroBody, { color: colors.muted }]}>
                Light movement and quality sleep will support your next session.
              </Text>
            </Card>
          ) : (
            <Pressable
              onPress={() =>
                navigation.navigate('WorkoutDetail', {
                  day: today?.workout?.day,
                })
              }
            >
              <Card style={{ backgroundColor: colors.primary }}>
                <View style={styles.heroTop}>
                  <View
                    style={[
                      styles.heroIcon,
                      { backgroundColor: colors.textOnPrimary },
                    ]}
                  >
                    <AppIcon name="bolt" color={colors.primary} size={21} />
                  </View>
                  <Text
                    style={[styles.heroTag, { color: colors.textOnPrimary }]}
                  >
                    READY WHEN YOU ARE
                  </Text>
                </View>
                <Text
                  style={[styles.heroTitle, { color: colors.textOnPrimary }]}
                >
                  {today?.workout?.title}
                </Text>
                <Text
                  style={[styles.heroBody, { color: colors.textOnPrimary }]}
                >
                  {today?.workout?.exercises.length} exercises · about{' '}
                  {today?.workout?.estimatedMinutes} minutes · ~
                  {Math.round(today?.workout?.estimatedCalories ?? 0)} kcal
                </Text>
                <View style={styles.heroAction}>
                  <Text style={[styles.start, { color: colors.textOnPrimary }]}>
                    View workout
                  </Text>
                  <AppIcon name="chevron" color={colors.textOnPrimary} />
                </View>
              </Card>
            </Pressable>
          )}
          {plan ? (
            <TomorrowPreview
              plan={plan}
              onOpenWorkout={day =>
                navigation.navigate('WorkoutDetail', { day: day.day })
              }
            />
          ) : null}
          <Text style={[styles.section, { color: colors.text }]}>
            Your coach
          </Text>
          <CoachDashboardCard
            brief={coachBrief}
            onPress={() => navigation.navigate('Coach')}
          />
          {analytics ? (
            <>
              <Text style={[styles.section, { color: colors.text }]}>
                Your activity
              </Text>
              <DashboardCalorieCard analytics={analytics} />
            </>
          ) : null}
          <Text style={[styles.section, { color: colors.text }]}>
            At a glance
          </Text>
          <View style={styles.grid}>
            <Metric
              icon="dumbbell"
              label="Training goal"
              value={formatGoal(profile.fitnessGoal)}
            />
            <Metric
              icon="dumbbell"
              label="Weekly schedule"
              value={`${profile.daysPerWeek} days`}
            />
            <Metric
              icon="clock"
              label="Session"
              value={profile ? `${profile.workoutDurationMinutes} min` : '—'}
            />
            <Metric
              icon="water"
              label="Water goal"
              value={
                profile?.dailyWaterTargetMl
                  ? `${(profile.dailyWaterTargetMl / 1000).toFixed(1)} L`
                  : '—'
              }
            />
            <Metric
              icon="moon"
              label="Sleep goal"
              value={
                profile?.sleepTargetMinutes
                  ? `${profile.sleepTargetMinutes / 60} hrs`
                  : '—'
              }
            />
          </View>
          {plan ? (
            <Card>
              <View style={styles.weekRow}>
                <View>
                  <Text style={[styles.weekLabel, { color: colors.muted }]}>
                    WEEKLY PROGRAM
                  </Text>
                  <Text style={[styles.weekTitle, { color: colors.text }]}>
                    {plan.totalExercises} planned movements
                  </Text>
                </View>
                <View
                  style={[
                    styles.weekCount,
                    { backgroundColor: colors.primarySoft },
                  ]}
                >
                  <Text
                    style={[styles.weekCountText, { color: colors.primary }]}
                  >
                    {plan.workoutDays}
                  </Text>
                </View>
              </View>
              <Text style={[styles.explanation, { color: colors.muted }]}>
                {plan.explanation}
              </Text>
            </Card>
          ) : null}
          <PrimaryButton
            label="Refresh dashboard"
            loading={loading}
            variant="secondary"
            onPress={load}
          />
        </>
      )}
    </Screen>
  );
}

function TomorrowPreview({
  plan,
  onOpenWorkout,
}: {
  plan: WorkoutPlan;
  onOpenWorkout: (day: WorkoutDay) => void;
}) {
  const { colors } = useTheme();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayName = tomorrow
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toUpperCase();
  const dateLabel = tomorrow
    .toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    .toUpperCase();
  const workout = plan.days.find(day => day.day === dayName);

  const content = (
    <Card
      style={{ ...styles.tomorrowCard, backgroundColor: colors.surfaceRaised }}
    >
      <View style={styles.tomorrowContent}>
        <View style={styles.tomorrowTop}>
          <View style={styles.tomorrowHeading}>
            <View
              style={[
                styles.tomorrowIcon,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <AppIcon
                name={workout ? 'dumbbell' : 'moon'}
                color={colors.primary}
                size={18}
              />
            </View>
            <View>
              <Text style={[styles.tomorrowEyebrow, { color: colors.primary }]}>
                TOMORROW · {dateLabel}
              </Text>
              <Text style={[styles.tomorrowDay, { color: colors.muted }]}>
                {dayName}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.tomorrowBadge,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <Text style={[styles.tomorrowBadgeText, { color: colors.primary }]}>
              {workout ? 'TRAIN' : 'RECOVER'}
            </Text>
          </View>
        </View>
        <Text style={[styles.tomorrowTitle, { color: colors.text }]}>
          {workout?.title ?? 'Rest & recovery'}
        </Text>
        {workout ? (
          <>
            <View style={styles.tomorrowStats}>
              <View style={styles.tomorrowStat}>
                <AppIcon name="dumbbell" color={colors.muted} size={13} />
                <Text style={[styles.tomorrowMeta, { color: colors.muted }]}>
                  {workout.exercises.length} exercises
                </Text>
              </View>
              <View style={styles.tomorrowStat}>
                <AppIcon name="clock" color={colors.muted} size={13} />
                <Text style={[styles.tomorrowMeta, { color: colors.muted }]}>
                  {workout.estimatedMinutes} min
                </Text>
              </View>
              <View style={styles.tomorrowStat}>
                <AppIcon name="fire" color={colors.primary} size={13} />
                <Text style={[styles.tomorrowMeta, { color: colors.primary }]}>
                  ~{Math.round(workout.estimatedCalories)} kcal
                </Text>
              </View>
            </View>
            <View style={styles.tomorrowAction}>
              <Text
                style={[styles.tomorrowActionText, { color: colors.primary }]}
              >
                Preview session
              </Text>
              <AppIcon name="chevron" color={colors.primary} size={13} />
            </View>
          </>
        ) : (
          <Text style={[styles.tomorrowRecovery, { color: colors.muted }]}>
            No workout scheduled. Prioritise mobility, hydration and quality
            sleep.
          </Text>
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.tomorrowSection}>
      <Text style={[styles.section, { color: colors.text }]}>Up next</Text>
      {workout ? (
        <Pressable onPress={() => onOpenWorkout(workout)}>{content}</Pressable>
      ) : (
        content
      )}
    </View>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: 'dumbbell' | 'clock' | 'water' | 'moon';
  label: string;
  value: string;
}) {
  const { colors } = useTheme();
  return (
    <Card style={styles.metric}>
      <View
        style={[styles.metricIcon, { backgroundColor: colors.primarySoft }]}
      >
        <AppIcon name={icon} color={colors.primary} size={17} />
      </View>
      <Text
        style={[
          styles.metricValue,
          value.length > 12 ? styles.metricValueCompact : undefined,
          { color: colors.text },
        ]}
      >
        {value}
      </Text>
      <Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text>
    </Card>
  );
}

function formatGoal(goal: Profile['fitnessGoal']) {
  return goal
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  greeting: { fontFamily: fonts.body, fontSize: 14 },
  name: { fontFamily: fonts.display, fontSize: 38 },
  avatar: {
    alignItems: 'center',
    borderRadius: 21,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  avatarText: { fontFamily: fonts.display, fontSize: 20 },
  section: { fontFamily: fonts.displaySemibold, fontSize: 25, marginTop: 4 },
  heroTop: { alignItems: 'center', flexDirection: 'row', gap: 9 },
  heroIcon: {
    alignItems: 'center',
    borderRadius: 15,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  heroTag: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 34,
    marginTop: 18,
  },
  heroBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
    opacity: 0.86,
  },
  heroAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  start: { fontFamily: fonts.body, fontSize: 14, fontWeight: '900' },
  tomorrowSection: { gap: 14 },
  tomorrowCard: { overflow: 'hidden', padding: 0 },
  tomorrowContent: { padding: 20 },
  tomorrowTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tomorrowHeading: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  tomorrowIcon: {
    alignItems: 'center',
    borderRadius: 13,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  tomorrowEyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  tomorrowDay: {
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  tomorrowBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tomorrowBadgeText: {
    fontFamily: fonts.body,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.9,
  },
  tomorrowTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 25,
    lineHeight: 29,
    marginTop: 16,
  },
  tomorrowStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 9,
  },
  tomorrowStat: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  tomorrowMeta: { fontFamily: fonts.body, fontSize: 12 },
  tomorrowAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 16,
  },
  tomorrowActionText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '900',
  },
  tomorrowRecovery: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: { minHeight: 132, width: '48%' },
  metricIcon: {
    alignItems: 'center',
    borderRadius: 13,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  metricValue: { fontFamily: fonts.display, fontSize: 27, marginTop: 12 },
  metricValueCompact: { fontSize: 21, lineHeight: 24 },
  metricLabel: { fontFamily: fonts.body, fontSize: 12 },
  weekRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  weekTitle: { fontFamily: fonts.displaySemibold, fontSize: 21, marginTop: 3 },
  weekCount: {
    alignItems: 'center',
    borderRadius: 18,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  weekCountText: { fontFamily: fonts.display, fontSize: 24 },
  explanation: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
});
