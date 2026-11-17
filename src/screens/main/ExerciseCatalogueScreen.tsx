import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '../../components/AppIcon';
import { Card } from '../../components/Card';
import { ChoiceChip } from '../../components/ChoiceChip';
import { Screen } from '../../components/Screen';
import { StateView } from '../../components/StateView';
import {
  exerciseFilterOptions,
  matchesExerciseFilter,
  type ExerciseFilter,
} from '../../config/exerciseCategories';
import { exerciseIcon } from '../../config/exercisePresentation';
import type { MainStackParamList } from '../../navigation/types';
import { apiErrorMessage } from '../../services/http';
import { workoutApi } from '../../services/workoutApi';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts } from '../../theme/typography';
import type { Exercise } from '../../types/workout';

export function ExerciseCatalogueScreen() {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [items, setItems] = useState<Exercise[]>([]);
  const [filter, setFilter] = useState<ExerciseFilter>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  async function load() {
    setLoading(true);
    setError(undefined);

    try {
      setItems(await workoutApi.exercises());
    } catch (caught) {
      setError(apiErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredItems = useMemo(
    () => items.filter(item => matchesExerciseFilter(item, filter)),
    [filter, items],
  );

  return (
    <Screen scroll>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>
        MOVE LIBRARY
      </Text>
      <Text style={[styles.title, { color: colors.text }]}>Exercises</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Explore movements by training goal, body area or vision support.
      </Text>

      <View style={styles.filters}>
        {exerciseFilterOptions.map(option => (
          <ChoiceChip
            key={option.value}
            label={option.label}
            selected={filter === option.value}
            onPress={() => setFilter(option.value)}
          />
        ))}
      </View>

      {loading ? (
        <StateView
          title="Loading exercises"
          message="Preparing the movement library."
        />
      ) : error ? (
        <StateView
          title="Catalogue unavailable"
          message={error}
          icon="retry"
          actionLabel="Try again"
          onAction={load}
        />
      ) : (
        <View style={styles.list}>
          {filteredItems.length === 0 ? (
            <StateView
              title="No matching exercises"
              message="Choose another category to explore the movement library."
            />
          ) : (
            filteredItems.map(item => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() =>
                  navigation.navigate('ExerciseDetail', { exercise: item })
                }
              >
                <Card>
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.icon,
                        { backgroundColor: colors.primarySoft },
                      ]}
                    >
                      <AppIcon
                        name={exerciseIcon(item)}
                        color={colors.primary}
                      />
                    </View>

                    <View style={styles.flex}>
                      <Text style={[styles.name, { color: colors.text }]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.meta, { color: colors.muted }]}>
                        {item.muscleGroup} · {item.equipment}
                      </Text>
                    </View>

                    {item.cameraSupported ? (
                      <View
                        style={[
                          styles.camera,
                          { backgroundColor: colors.primarySoft },
                        ]}
                      >
                        <AppIcon
                          name="camera"
                          color={colors.primary}
                          size={13}
                        />
                        <Text
                          style={[styles.cameraText, { color: colors.primary }]}
                        >
                          VISION
                        </Text>
                      </View>
                    ) : (
                      <AppIcon name="chevron" color={colors.muted} />
                    )}
                  </View>

                  <Text
                    numberOfLines={2}
                    style={[styles.instructions, { color: colors.muted }]}
                  >
                    {item.instructions}
                  </Text>
                  <View style={styles.calories}>
                    <AppIcon name="fire" color={colors.primary} size={12} />
                    <Text
                      style={[styles.calorieText, { color: colors.primary }]}
                    >
                      ~{Math.round(item.estimatedCaloriesPer10Minutes)} kcal per
                      10 active minutes
                    </Text>
                  </View>
                </Card>
              </Pressable>
            ))
          )}
        </View>
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
  subtitle: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  list: { gap: 12 },
  cardHeader: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  icon: {
    alignItems: 'center',
    borderRadius: 16,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  flex: { flex: 1 },
  name: { fontFamily: fonts.displaySemibold, fontSize: 21 },
  meta: { fontFamily: fonts.body, fontSize: 12 },
  camera: {
    alignItems: 'center',
    borderRadius: 99,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  cameraText: { fontFamily: fonts.body, fontSize: 9, fontWeight: '900' },
  instructions: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  calories: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  calorieText: { fontFamily: fonts.body, fontSize: 11, fontWeight: '800' },
});
