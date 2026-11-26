import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '../../components/AppIcon';
import { Card } from '../../components/Card';
import { ChoiceChip } from '../../components/ChoiceChip';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { StateView } from '../../components/StateView';
import { StatusNotice } from '../../components/StatusNotice';
import { coachApi } from '../../services/coachApi';
import { apiErrorMessage } from '../../services/http';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts } from '../../theme/typography';
import type {
  CoachBrief,
  CoachBriefType,
  CoachFeedback,
} from '../../types/coach';

export function CoachScreen() {
  const { colors } = useTheme();
  const [selectedType, setSelectedType] = useState<CoachBriefType>('DAILY');
  const [daily, setDaily] = useState<CoachBrief>();
  const [weekly, setWeekly] = useState<CoachBrief>();
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string>();
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    const [dailyResult, weeklyResult] = await Promise.allSettled([
      coachApi.daily(),
      coachApi.weekly(),
    ]);

    if (dailyResult.status === 'fulfilled') setDaily(dailyResult.value);
    if (weeklyResult.status === 'fulfilled') setWeekly(weeklyResult.value);
    if (
      dailyResult.status === 'rejected' &&
      weeklyResult.status === 'rejected'
    ) {
      setError(
        apiErrorMessage(
          dailyResult.reason,
          'Your coaching briefs could not be loaded.',
        ),
      );
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [load]),
  );

  async function regenerate() {
    setRegenerating(true);
    setError(undefined);
    try {
      if (selectedType === 'DAILY') {
        setDaily(await coachApi.regenerateDaily());
      } else {
        setWeekly(await coachApi.regenerateWeekly());
      }
    } catch (caught) {
      setError(
        apiErrorMessage(caught, 'The coaching brief could not be refreshed.'),
      );
    } finally {
      setRegenerating(false);
    }
  }

  async function recordFeedback(feedback: CoachFeedback) {
    if (!brief || feedbackSaving) return;

    setFeedbackSaving(true);
    setFeedbackNotice(undefined);
    try {
      const updated = await coachApi.recordFeedback(brief.id, feedback);
      if (updated.briefType === 'DAILY') setDaily(updated);
      else setWeekly(updated);
      setFeedbackNotice('Thanks. Your feedback has been saved.');
    } catch (caught) {
      setError(apiErrorMessage(caught, 'Your feedback could not be saved.'));
    } finally {
      setFeedbackSaving(false);
    }
  }

  const brief = selectedType === 'DAILY' ? daily : weekly;
  const firstLoad = loading && !daily && !weekly;

  return (
    <Screen scroll>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>AI COACH</Text>
      <Text style={[styles.title, { color: colors.text }]}>Your next move</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Conservative guidance grounded in the training and recovery facts you
        have recorded in GymBro.
      </Text>

      <View style={styles.tabs}>
        <ChoiceChip
          label="Today"
          selected={selectedType === 'DAILY'}
          onPress={() => setSelectedType('DAILY')}
        />
        <ChoiceChip
          label="Weekly review"
          selected={selectedType === 'WEEKLY'}
          onPress={() => setSelectedType('WEEKLY')}
        />
      </View>

      {error ? <StatusNotice message={error} tone="error" /> : null}

      {firstLoad ? (
        <StateView
          title="Preparing your coaching brief"
          message="Reviewing your stored workouts, recovery and wellness data."
        />
      ) : !brief ? (
        <StateView
          icon="retry"
          title="Brief unavailable"
          message="This coaching brief could not be loaded yet."
          actionLabel="Try again"
          onAction={load}
        />
      ) : (
        <>
          <Card style={{ backgroundColor: colors.primary }}>
            <View style={styles.heroHeading}>
              <View
                style={[
                  styles.heroIcon,
                  { backgroundColor: colors.textOnPrimary },
                ]}
              >
                <AppIcon name="bolt" color={colors.primary} size={20} />
              </View>
              <View style={styles.flex}>
                <Text
                  style={[styles.heroType, { color: colors.textOnPrimary }]}
                >
                  {selectedType === 'DAILY' ? 'TODAY’S BRIEF' : 'WEEKLY REVIEW'}
                </Text>
                <Text
                  style={[styles.generated, { color: colors.textOnPrimary }]}
                >
                  {generationLabel(brief)} ·{' '}
                  {formatGeneratedAt(brief.generatedAt)}
                </Text>
              </View>
            </View>
            <Text style={[styles.summary, { color: colors.textOnPrimary }]}>
              {brief.summary}
            </Text>
          </Card>

          <Card>
            <View style={styles.sectionHeading}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: colors.primarySoft },
                ]}
              >
                <AppIcon name="core" color={colors.primary} size={18} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Focus now
              </Text>
            </View>
            <Text style={[styles.focus, { color: colors.text }]}>
              {brief.focusToday}
            </Text>
          </Card>

          {brief.cautions.length ? (
            <Card>
              <View style={styles.sectionHeading}>
                <View
                  style={[
                    styles.sectionIcon,
                    { backgroundColor: `${colors.warning}18` },
                  ]}
                >
                  <AppIcon name="info" color={colors.warning} size={18} />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Keep in mind
                </Text>
              </View>
              <View style={styles.list}>
                {brief.cautions.map(caution => (
                  <ListItem
                    color={colors.warning}
                    icon="info"
                    key={caution}
                    text={caution}
                  />
                ))}
              </View>
            </Card>
          ) : null}

          <Card>
            <View style={styles.sectionHeading}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: colors.primarySoft },
                ]}
              >
                <AppIcon name="chart" color={colors.primary} size={17} />
              </View>
              <View style={styles.flex}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Why this recommendation
                </Text>
                <Text style={[styles.sectionCaption, { color: colors.muted }]}>
                  Facts read from your GymBro records
                </Text>
              </View>
            </View>
            <View style={styles.list}>
              {brief.evidence.map(item => (
                <ListItem
                  color={colors.primary}
                  icon="check"
                  key={item}
                  text={item}
                />
              ))}
            </View>
          </Card>

          {brief.missingData.length ? (
            <Card style={{ backgroundColor: colors.primarySoft }}>
              <Text style={[styles.missingTitle, { color: colors.text }]}>
                Improve your next brief
              </Text>
              <Text style={[styles.missingIntro, { color: colors.muted }]}>
                GymBro did not guess these values:
              </Text>
              <View style={styles.list}>
                {brief.missingData.map(item => (
                  <ListItem
                    color={colors.muted}
                    icon="info"
                    key={item}
                    text={item}
                  />
                ))}
              </View>
            </Card>
          ) : null}

          <StatusNotice
            message="GymBro coaching is fitness guidance, not medical diagnosis or treatment advice."
            tone="info"
          />
          <Card>
            <Text style={[styles.feedbackTitle, { color: colors.text }]}>
              Was this recommendation useful?
            </Text>
            <Text style={[styles.feedbackCaption, { color: colors.muted }]}>
              Your response is stored with this brief to improve future coach
              work.
            </Text>
            <View style={styles.feedbackChoices}>
              <ChoiceChip
                disabled={feedbackSaving}
                label="Helpful"
                selected={brief.feedback === 'HELPFUL'}
                onPress={() =>
                  recordFeedback('HELPFUL').catch(() => undefined)
                }
              />
              <ChoiceChip
                disabled={feedbackSaving}
                label="Not useful"
                selected={brief.feedback === 'NOT_USEFUL'}
                onPress={() =>
                  recordFeedback('NOT_USEFUL').catch(() => undefined)
                }
              />
            </View>
            <StatusNotice message={feedbackNotice} tone="success" />
          </Card>
          <PrimaryButton
            label={`Refresh ${
              selectedType === 'DAILY' ? 'today’s brief' : 'weekly review'
            }`}
            loading={regenerating}
            onPress={() => regenerate().catch(() => undefined)}
          />
        </>
      )}
    </Screen>
  );
}

function ListItem({
  icon,
  color,
  text,
}: {
  icon: 'check' | 'info';
  color: string;
  text: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.listItem}>
      <AppIcon name={icon} color={color} size={13} />
      <Text style={[styles.listText, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

function generationLabel(brief: CoachBrief) {
  return brief.generationSource === 'OLLAMA'
    ? 'AI-assisted'
    : 'Safety fallback';
}

function formatGeneratedAt(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  title: { fontFamily: fonts.display, fontSize: 42 },
  subtitle: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  heroHeading: { alignItems: 'center', flexDirection: 'row', gap: 11 },
  heroIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 43,
    justifyContent: 'center',
    width: 43,
  },
  flex: { flex: 1 },
  heroType: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  generated: {
    fontFamily: fonts.body,
    fontSize: 10,
    marginTop: 3,
    opacity: 0.82,
  },
  summary: {
    fontFamily: fonts.displaySemibold,
    fontSize: 24,
    lineHeight: 31,
    marginTop: 18,
  },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', gap: 11 },
  sectionIcon: {
    alignItems: 'center',
    borderRadius: 13,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  sectionTitle: { fontFamily: fonts.displaySemibold, fontSize: 22 },
  sectionCaption: { fontFamily: fonts.body, fontSize: 10, marginTop: 1 },
  focus: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    marginTop: 16,
  },
  list: { gap: 11, marginTop: 16 },
  listItem: { alignItems: 'flex-start', flexDirection: 'row', gap: 10 },
  listText: { flex: 1, fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  missingTitle: { fontFamily: fonts.displaySemibold, fontSize: 21 },
  missingIntro: { fontFamily: fonts.body, fontSize: 12, marginTop: 4 },
  feedbackTitle: { fontFamily: fonts.displaySemibold, fontSize: 21 },
  feedbackCaption: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  feedbackChoices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 16,
  },
});
