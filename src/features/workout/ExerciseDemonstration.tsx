import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { Exercise } from '../../types/workout';

const squatAnimation = require('../../assets/animations/squat-demo.json');
const curlAnimation = require('../../assets/animations/curl-demo.json');

function animationFor(exercise: Pick<Exercise, 'code' | 'name'>) {
  const description = `${exercise.code} ${exercise.name}`.toUpperCase();

  if (description.includes('SQUAT')) return squatAnimation;
  if (description.includes('CURL')) return curlAnimation;
  return undefined;
}

export function hasExerciseDemonstration(
  exercise: Pick<Exercise, 'code' | 'name'>,
) {
  return Boolean(animationFor(exercise));
}

export function ExerciseDemonstration({
  exercise,
  paused = false,
}: {
  exercise: Pick<Exercise, 'code' | 'name'>;
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

  if (!source) return null;

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
  animation: { height: 220, width: 220 },
});
