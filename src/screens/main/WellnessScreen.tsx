import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '../../components/AppIcon';
import { Card } from '../../components/Card';
import { ChoiceChip } from '../../components/ChoiceChip';
import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { StateView } from '../../components/StateView';
import { StatusNotice } from '../../components/StatusNotice';
import { apiErrorMessage } from '../../services/http';
import { wellnessApi } from '../../services/wellnessApi';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts } from '../../theme/typography';
import type {
  DailyHydration,
  DailyNutrition,
  SleepQuality,
  WellnessProgress,
} from '../../types/wellness';

const sleepQualities: Array<{ value: SleepQuality; label: string }> = [
  { value: 'POOR', label: 'Poor' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'GOOD', label: 'Good' },
  { value: 'VERY_GOOD', label: 'Very good' },
  { value: 'EXCELLENT', label: 'Excellent' },
];

function sleepWindow(bedtime: string, wakeTime: string) {
  const pattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
  const bedMatch = bedtime.match(pattern);
  const wakeMatch = wakeTime.match(pattern);
  if (!bedMatch || !wakeMatch) return undefined;

  const now = new Date();
  const wake = new Date(now);
  wake.setHours(Number(wakeMatch[1]), Number(wakeMatch[2]), 0, 0);
  if (wake.getTime() > now.getTime() + 5 * 60 * 1000) {
    wake.setDate(wake.getDate() - 1);
  }

  const slept = new Date(wake);
  slept.setHours(Number(bedMatch[1]), Number(bedMatch[2]), 0, 0);
  const bedMinutes = Number(bedMatch[1]) * 60 + Number(bedMatch[2]);
  const wakeMinutes = Number(wakeMatch[1]) * 60 + Number(wakeMatch[2]);
  if (bedMinutes >= wakeMinutes) slept.setDate(slept.getDate() - 1);

  return { sleptAt: slept.toISOString(), wokeAt: wake.toISOString() };
}

export function WellnessScreen() {
  const { colors } = useTheme();
  const [hydration, setHydration] = useState<DailyHydration>();
  const [nutrition, setNutrition] = useState<DailyNutrition>();
  const [progress, setProgress] = useState<WellnessProgress>();
  const [loading, setLoading] = useState(true);
  const [waterLoading, setWaterLoading] = useState<number>();
  const [sleepLoading, setSleepLoading] = useState(false);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [notice, setNotice] = useState<{
    tone: 'error' | 'success';
    message: string;
  }>();

  const [bedtime, setBedtime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>('GOOD');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [sleepNotes, setSleepNotes] = useState('');

  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbohydrates, setCarbohydrates] = useState('');
  const [fat, setFat] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [hydrationValue, nutritionValue, progressValue] = await Promise.all(
        [
          wellnessApi.dailyHydration(),
          wellnessApi.dailyNutrition(),
          wellnessApi.progress(7),
        ],
      );
      setHydration(hydrationValue);
      setNutrition(nutritionValue);
      setProgress(progressValue);
    } catch (caught) {
      setNotice({ tone: 'error', message: apiErrorMessage(caught) });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [load]),
  );

  async function addWater(amountMl: number) {
    setWaterLoading(amountMl);
    setNotice(undefined);
    try {
      await wellnessApi.addWater(amountMl);
      await load();
      setNotice({ tone: 'success', message: `${amountMl} ml of water added.` });
    } catch (caught) {
      setNotice({ tone: 'error', message: apiErrorMessage(caught) });
    } finally {
      setWaterLoading(undefined);
    }
  }

  async function saveSleep() {
    const window = sleepWindow(bedtime, wakeTime);
    if (!window) {
      setNotice({
        tone: 'error',
        message: 'Enter sleep and wake times in 24-hour HH:MM format.',
      });
      return;
    }

    setSleepLoading(true);
    setNotice(undefined);
    try {
      await wellnessApi.addSleep({
        ...window,
        quality: sleepQuality,
        energyLevel,
        notes: sleepNotes.trim() || undefined,
      });
      await load();
      setNotice({ tone: 'success', message: 'Morning sleep check-in saved.' });
      setSleepNotes('');
    } catch (caught) {
      setNotice({ tone: 'error', message: apiErrorMessage(caught) });
    } finally {
      setSleepLoading(false);
    }
  }

  async function saveMeal() {
    const values = [calories, protein, carbohydrates, fat].map(Number);
    if (
      !mealName.trim() ||
      values.some(value => !Number.isFinite(value) || value < 0)
    ) {
      setNotice({
        tone: 'error',
        message: 'Enter a meal name and valid non-negative nutrition values.',
      });
      return;
    }

    setNutritionLoading(true);
    setNotice(undefined);
    try {
      await wellnessApi.addNutrition({
        mealName: mealName.trim(),
        calories: values[0],
        proteinGrams: values[1],
        carbohydrateGrams: values[2],
        fatGrams: values[3],
      });
      await load();
      setMealName('');
      setCalories('');
      setProtein('');
      setCarbohydrates('');
      setFat('');
      setNotice({ tone: 'success', message: 'Nutrition entry saved.' });
    } catch (caught) {
      setNotice({ tone: 'error', message: apiErrorMessage(caught) });
    } finally {
      setNutritionLoading(false);
    }
  }

  if (loading && !hydration && !nutrition) {
    return (
      <Screen>
        <StateView
          title="Loading wellness"
          message="Preparing today's recovery and nutrition data."
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>RECOVERY</Text>
      <Text style={[styles.title, { color: colors.text }]}>Daily wellness</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Small, honest check-ins help GymBro understand your training readiness.
      </Text>

      <StatusNotice message={notice?.message} tone={notice?.tone} />

      <View style={styles.summaryRow}>
        <SummaryMetric
          icon="moon"
          label="7-day sleep"
          value={
            progress?.averageSleepMinutes
              ? `${Math.floor(progress.averageSleepMinutes / 60)}h ${
                  progress.averageSleepMinutes % 60
                }m`
              : 'No data'
          }
        />
        <SummaryMetric
          icon="water"
          label="Water today"
          value={`${hydration?.totalMl ?? 0} ml`}
        />
        <SummaryMetric
          icon="fire"
          label="Food today"
          value={`${nutrition?.calories ?? 0} kcal`}
        />
      </View>

      <Card>
        <SectionHeading
          icon="water"
          title="Hydration"
          caption={`${hydration?.totalMl ?? 0} of ${
            hydration?.targetMl ?? 2000
          } ml`}
        />
        <View
          style={[styles.progressTrack, { backgroundColor: colors.border }]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${hydration?.progressPercent ?? 0}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.helper, { color: colors.muted }]}>Quick add</Text>
        <View style={styles.quickRow}>
          {[250, 500, 750].map(amount => (
            <Pressable
              disabled={waterLoading !== undefined}
              key={amount}
              onPress={() => addWater(amount).catch(() => undefined)}
              style={[
                styles.quickButton,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <Text style={[styles.quickValue, { color: colors.primary }]}>
                {waterLoading === amount ? 'Adding…' : `+${amount} ml`}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <SectionHeading
          icon="moon"
          title="Morning sleep check-in"
          caption="Record last night's sleep and today's energy"
        />
        <View style={styles.formGap}>
          <View style={styles.fieldRow}>
            <View style={styles.flex}>
              <FormField
                label="Sleep time"
                placeholder="22:30"
                value={bedtime}
                onChangeText={setBedtime}
              />
            </View>
            <View style={styles.flex}>
              <FormField
                label="Wake time"
                placeholder="06:30"
                value={wakeTime}
                onChangeText={setWakeTime}
              />
            </View>
          </View>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            Sleep quality
          </Text>
          <View style={styles.chips}>
            {sleepQualities.map(option => (
              <ChoiceChip
                key={option.value}
                label={option.label}
                selected={sleepQuality === option.value}
                onPress={() => setSleepQuality(option.value)}
              />
            ))}
          </View>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            Morning energy
          </Text>
          <View style={styles.chips}>
            {[1, 2, 3, 4, 5].map(value => (
              <ChoiceChip
                key={value}
                label={String(value)}
                selected={energyLevel === value}
                onPress={() => setEnergyLevel(value)}
              />
            ))}
          </View>
          <FormField
            label="Notes (optional)"
            placeholder="How do you feel this morning?"
            value={sleepNotes}
            onChangeText={setSleepNotes}
          />
          <PrimaryButton
            label="Save sleep check-in"
            loading={sleepLoading}
            onPress={() => saveSleep().catch(() => undefined)}
          />
        </View>
      </Card>

      <Card>
        <SectionHeading
          icon="fire"
          title="Nutrition"
          caption={`${nutrition?.entries.length ?? 0} meals logged today`}
        />
        <View style={styles.macroRow}>
          <Macro label="Protein" value={nutrition?.proteinGrams ?? 0} />
          <Macro label="Carbs" value={nutrition?.carbohydrateGrams ?? 0} />
          <Macro label="Fat" value={nutrition?.fatGrams ?? 0} />
        </View>
        <View style={styles.formGap}>
          <FormField
            label="Meal name"
            placeholder="e.g. Chicken and rice"
            value={mealName}
            onChangeText={setMealName}
          />
          <FormField
            keyboardType="number-pad"
            label="Calories"
            placeholder="e.g. 550"
            value={calories}
            onChangeText={setCalories}
          />
          <View style={styles.fieldRow}>
            <View style={styles.flex}>
              <FormField
                keyboardType="decimal-pad"
                label="Protein (g)"
                placeholder="0"
                value={protein}
                onChangeText={setProtein}
              />
            </View>
            <View style={styles.flex}>
              <FormField
                keyboardType="decimal-pad"
                label="Carbs (g)"
                placeholder="0"
                value={carbohydrates}
                onChangeText={setCarbohydrates}
              />
            </View>
            <View style={styles.flex}>
              <FormField
                keyboardType="decimal-pad"
                label="Fat (g)"
                placeholder="0"
                value={fat}
                onChangeText={setFat}
              />
            </View>
          </View>
          <PrimaryButton
            label="Add meal"
            loading={nutritionLoading}
            onPress={() => saveMeal().catch(() => undefined)}
          />
        </View>
      </Card>
    </Screen>
  );
}

function SummaryMetric({
  icon,
  label,
  value,
}: {
  icon: 'moon' | 'water' | 'fire';
  label: string;
  value: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.summaryMetric, { backgroundColor: colors.surface }]}>
      <AppIcon color={colors.primary} name={icon} size={17} />
      <Text style={[styles.summaryValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: colors.muted }]}>
        {label}
      </Text>
    </View>
  );
}

function SectionHeading({
  icon,
  title,
  caption,
}: {
  icon: 'moon' | 'water' | 'fire';
  title: string;
  caption: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeading}>
      <View
        style={[styles.sectionIcon, { backgroundColor: colors.primarySoft }]}
      >
        <AppIcon color={colors.primary} name={icon} />
      </View>
      <View style={styles.flex}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.sectionCaption, { color: colors.muted }]}>
          {caption}
        </Text>
      </View>
    </View>
  );
}

function Macro({ label, value }: { label: string; value: number }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.macro, { backgroundColor: colors.primarySoft }]}>
      <Text style={[styles.macroValue, { color: colors.primary }]}>
        {Math.round(value)}g
      </Text>
      <Text style={[styles.macroLabel, { color: colors.muted }]}>{label}</Text>
    </View>
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
  subtitle: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryMetric: {
    borderRadius: 16,
    flex: 1,
    gap: 5,
    minWidth: 0,
    padding: 12,
  },
  summaryValue: { fontFamily: fonts.displaySemibold, fontSize: 15 },
  summaryLabel: { fontFamily: fonts.body, fontSize: 9, fontWeight: '700' },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', gap: 11 },
  sectionIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 43,
    justifyContent: 'center',
    width: 43,
  },
  sectionTitle: { fontFamily: fonts.displaySemibold, fontSize: 23 },
  sectionCaption: { fontFamily: fonts.body, fontSize: 11, lineHeight: 16 },
  progressTrack: {
    borderRadius: 999,
    height: 10,
    marginTop: 17,
    overflow: 'hidden',
  },
  progressFill: { borderRadius: 999, height: '100%' },
  helper: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 15,
  },
  quickRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  quickButton: {
    alignItems: 'center',
    borderRadius: 13,
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  quickValue: { fontFamily: fonts.body, fontSize: 12, fontWeight: '900' },
  formGap: { gap: 15, marginTop: 18 },
  fieldRow: { flexDirection: 'row', gap: 9 },
  flex: { flex: 1, minWidth: 0 },
  fieldLabel: { fontFamily: fonts.body, fontSize: 14, fontWeight: '800' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  macroRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  macro: { alignItems: 'center', borderRadius: 13, flex: 1, padding: 10 },
  macroValue: { fontFamily: fonts.displaySemibold, fontSize: 18 },
  macroLabel: { fontFamily: fonts.body, fontSize: 10, fontWeight: '700' },
});
