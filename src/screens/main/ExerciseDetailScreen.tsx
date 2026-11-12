import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '../../components/AppIcon';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { exerciseCategoryLabels } from '../../config/exerciseCategories';
import { exerciseIcon } from '../../config/exercisePresentation';
import {
  ExerciseDemonstration,
  hasExerciseDemonstration,
} from '../../features/workout/ExerciseDemonstration';
import type { MainStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts } from '../../theme/typography';

type Props = NativeStackScreenProps<MainStackParamList, 'ExerciseDetail'>;

export function ExerciseDetailScreen({ route }: Props) {
  const { colors } = useTheme();
  const { exercise } = route.params;
  const categories = exerciseCategoryLabels(exercise);
  const hasAnimation = hasExerciseDemonstration(exercise);

  return (
    <Screen scroll>
      <View style={styles.heading}>
        <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
          <AppIcon
            name={exerciseIcon(exercise)}
            color={colors.primary}
            size={28}
          />
        </View>

        <View style={styles.flex}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            MOVEMENT GUIDE
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {exercise.name}
          </Text>
        </View>
      </View>

      <View style={styles.tags}>
        {[exercise.muscleGroup, exercise.equipment, ...categories]
          .filter((value, index, values) => values.indexOf(value) === index)
          .slice(0, 4)
          .map(value => (
            <View
              key={value}
              style={[
                styles.tag,
                {
                  backgroundColor: colors.primarySoft,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.tagText, { color: colors.primary }]}>
                {value}
              </Text>
            </View>
          ))}
      </View>

      {hasAnimation ? (
        <ExerciseDemonstration exercise={exercise} />
      ) : (
        <View
          style={[
            styles.fallbackPreview,
            {
              backgroundColor: colors.primarySoft,
              borderColor: colors.border,
            },
          ]}
        >
          <AppIcon
            name={exerciseIcon(exercise)}
            color={colors.primary}
            size={64}
          />
          <Text style={[styles.previewTitle, { color: colors.text }]}>
            Illustrated movement guide
          </Text>
          <Text style={[styles.previewText, { color: colors.muted }]}>
            Follow the controlled movement cues below. A dedicated animated
            demonstration is being prepared for this exercise.
          </Text>
        </View>
      )}

      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          How to perform it
        </Text>
        <Text style={[styles.instructions, { color: colors.muted }]}>
          {exercise.instructions}
        </Text>
      </Card>

      <View
        style={[
          styles.notice,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <AppIcon name="info" color={colors.primary} />
        <Text style={[styles.noticeText, { color: colors.muted }]}>
          This page is an illustration only. It does not start, record or
          complete a workout.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  icon: {
    alignItems: 'center',
    borderRadius: 20,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  flex: { flex: 1 },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 39,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 99,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tagText: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '800',
  },
  fallbackPreview: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    minHeight: 230,
    justifyContent: 'center',
    padding: 28,
  },
  previewTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 23,
    marginTop: 18,
  },
  previewText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 25,
  },
  instructions: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
  },
  notice: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 15,
  },
  noticeText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
});
