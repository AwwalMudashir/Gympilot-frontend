import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { Exercise } from '../../types/workout';
import { stickFigureAnimationFor } from './stickFigureAnimations';

const squatAnimation = require('../../assets/animations/squat-demo.json');
const curlAnimation = require('../../assets/animations/curl-demo.json');

type DemonstrationExercise = Pick<
  Exercise,
  'code' | 'equipment' | 'muscleGroup' | 'name'
>;

function animationFor(exercise: DemonstrationExercise) {
  const code = exercise.code.toUpperCase();

  if (code === 'BODYWEIGHT_SQUAT') return squatAnimation;
  if (code === 'BICEP_CURL') return curlAnimation;
  return stickFigureAnimationFor(exercise.code);
}

export function hasExerciseDemonstration(exercise: DemonstrationExercise) {
  return Boolean(exercise.code && exercise.name);
}

export function ExerciseDemonstration({
  exercise,
  paused = false,
}: {
  exercise: DemonstrationExercise;
  paused?: boolean;
}) {
  const { colors } = useTheme();
  const animationRef = useRef<LottieView>(null);
  const source = animationFor(exercise);

  useEffect(() => {
    if (paused) {
      animationRef.current?.pause();
    } else {
      animationRef.current?.play();
    }
  }, [paused, source]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.primarySoft,
          borderColor: colors.border,
        },
      ]}
    >
      <LottieView
        ref={animationRef}
        autoPlay={!paused}
        loop
        resizeMode="contain"
        source={source}
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    height: 230,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  animation: { height: 224, width: 224 },
});
