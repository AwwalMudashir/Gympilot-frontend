import { usePreventRemove } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Camera,
  CommonResolutions,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from 'react-native-vision-camera';

import { AppIcon } from '../../components/AppIcon';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { StatusNotice } from '../../components/StatusNotice';
import {
  speakCoachCue,
  stopCoachVoice,
} from '../../features/workout/voiceCoach';
import type { MainStackParamList } from '../../navigation/types';
import { apiErrorMessage } from '../../services/http';
import { visionApi, visionErrorMessage } from '../../services/visionApi';
import { useVisionWorkoutStore } from '../../store/visionWorkoutStore';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts } from '../../theme/typography';
import type { VisionFrameResult, VisionSummary } from '../../types/vision';

type Props = NativeStackScreenProps<MainStackParamList, 'WorkoutCamera'>;
type CameraState = 'READY' | 'RUNNING' | 'PAUSED' | 'SAVING' | 'COMPLETE';

const FRAME_INTERVAL_MS = 1000;

const PHASE_LABELS = {
  STANDING: 'Standing',
  DESCENDING: 'Descending',
  BOTTOM: 'Bottom',
  ASCENDING: 'Ascending',
  EXTENDED: 'Extended',
  CURLING: 'Curling',
  CONTRACTED: 'Contracted',
  LOWERING: 'Lowering',
} as const;

function formFlagLabel(flag: string) {
  if (flag === 'INSUFFICIENT_DEPTH') return 'Try a little more depth';
  if (flag === 'EXCESSIVE_FORWARD_LEAN') return 'Keep your chest lifted';
  if (flag === 'INCOMPLETE_RANGE') return 'Complete the full curl';
  if (flag === 'ELBOW_DRIFT') return 'Keep your elbow by your side';
  return flag.replaceAll('_', ' ').toLowerCase();
}

export function WorkoutCameraScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const device = useCameraDevice('back');
  const permission = useCameraPermission();
  const photoOutput = usePhotoOutput({
    targetResolution: CommonResolutions.VGA_4_3,
    containerFormat: 'jpeg',
    quality: 0.72,
    qualityPrioritization: 'speed',
  });
  const publishResult = useVisionWorkoutStore(state => state.publish);

  const [cameraState, setCameraState] = useState<CameraState>('READY');
  const [analysisSessionId, setAnalysisSessionId] = useState<string>();
  const [latestFrame, setLatestFrame] = useState<VisionFrameResult>();
  const [pendingSummary, setPendingSummary] = useState<VisionSummary>();
  const [savedSummary, setSavedSummary] = useState<VisionSummary>();
  const [error, setError] = useState<string>();
  const captureInFlight = useRef(false);
  const analysisSessionRef = useRef<string | undefined>(undefined);
  const analysisFinishedRef = useRef(false);
  const lastSpokenRep = useRef(0);
  const spokenFlags = useRef(new Set<string>());
  const lastSpokenGuidance = useRef<string | undefined>(undefined);
  const calibrationSpoken = useRef(false);

  const {
    workoutSessionId,
    exerciseId,
    exerciseCode,
    exerciseName,
    targetRepetitions,
    setNumber,
    resultKey,
  } = route.params;

  useEffect(() => {
    analysisSessionRef.current = analysisSessionId;
  }, [analysisSessionId]);

  useEffect(
    () => () => {
      stopCoachVoice().catch(() => undefined);
      const sessionId = analysisSessionRef.current;
      if (sessionId && !analysisFinishedRef.current) {
        visionApi.cancelSession(exerciseCode, sessionId).catch(() => undefined);
      }
    },
    [exerciseCode],
  );

  const analyseNextFrame = useCallback(async () => {
    if (!analysisSessionId || captureInFlight.current) return;
    captureInFlight.current = true;

    try {
      const photo = await photoOutput.capturePhotoToFile(
        { flashMode: 'off', enableShutterSound: false },
        {},
      );
      const result = await visionApi.analyseFrame(
        exerciseCode,
        analysisSessionId,
        photo.filePath,
      );
      setLatestFrame(result);
      setError(undefined);

      const calibrated = result.calibrated ?? result.pose_detected;
      if (result.pose_detected && calibrated) {
        lastSpokenGuidance.current = undefined;
      }

      if (result.repetitions >= targetRepetitions) {
        setCameraState('PAUSED');
      }

      if (!result.pose_detected || !calibrated) {
        if (lastSpokenGuidance.current !== result.feedback) {
          lastSpokenGuidance.current = result.feedback;
          speakCoachCue(result.feedback).catch(() => undefined);
        }
      } else if (!calibrationSpoken.current) {
        calibrationSpoken.current = true;
        lastSpokenGuidance.current = undefined;
        speakCoachCue('Position locked. Begin when you are ready.').catch(
          () => undefined,
        );
      } else if (result.repetitions > lastSpokenRep.current) {
        lastSpokenRep.current = result.repetitions;
        speakCoachCue(String(result.repetitions)).catch(() => undefined);
      } else {
        const newFlag = result.form_flags.find(
          flag => !spokenFlags.current.has(flag),
        );
        if (newFlag) {
          spokenFlags.current.add(newFlag);
          speakCoachCue(result.feedback).catch(() => undefined);
        }
      }
    } catch (caught) {
      setError(visionErrorMessage(caught));
      setCameraState('PAUSED');
    } finally {
      captureInFlight.current = false;
    }
  }, [analysisSessionId, exerciseCode, photoOutput, targetRepetitions]);

  useEffect(() => {
    if (cameraState !== 'RUNNING' || !analysisSessionId) return;

    analyseNextFrame().catch(() => undefined);
    const interval = setInterval(
      () => analyseNextFrame().catch(() => undefined),
      FRAME_INTERVAL_MS,
    );
    return () => clearInterval(interval);
  }, [analyseNextFrame, analysisSessionId, cameraState]);

  const hasUncommittedResult = Boolean(analysisSessionId || pendingSummary);
  usePreventRemove(
    hasUncommittedResult && cameraState !== 'COMPLETE',
    event => {
      Alert.alert(
        'Leave camera coaching?',
        'This camera set will end. Your earlier workout progress remains saved, but this unfinished set will not count.',
        [
          { text: 'Stay here', style: 'cancel' },
          {
            text: 'End camera set',
            style: 'destructive',
            onPress: async () => {
              analysisFinishedRef.current = true;
              if (analysisSessionId) {
                await visionApi
                  .cancelSession(exerciseCode, analysisSessionId)
                  .catch(() => undefined);
              }
              setAnalysisSessionId(undefined);
              setPendingSummary(undefined);
              navigation.dispatch(event.data.action);
            },
          },
        ],
      );
    },
  );

  async function startTracking() {
    setError(undefined);

    try {
      const session = await visionApi.startSession(
        exerciseCode,
        targetRepetitions,
      );
      analysisFinishedRef.current = false;
      lastSpokenRep.current = 0;
      spokenFlags.current.clear();
      lastSpokenGuidance.current = undefined;
      calibrationSpoken.current = false;
      setAnalysisSessionId(session.session_id);
      setLatestFrame({
        session_id: session.session_id,
        pose_detected: false,
        repetitions: 0,
        target_repetitions: targetRepetitions,
        phase: session.phase,
        calibrated: session.calibrated ?? false,
        form_flags: [],
        feedback:
          exerciseCode === 'BICEP_CURL'
            ? 'Keep one full arm and the same-side hip visible.'
            : 'Step back until your shoulders, hips, knees and ankles are visible.',
      });
      setCameraState('RUNNING');
      speakCoachCue(
        `Camera coaching started. Complete ${targetRepetitions} controlled ${
          exerciseCode === 'BICEP_CURL' ? 'curls' : 'squats'
        }.`,
      ).catch(() => undefined);
    } catch (caught) {
      setError(visionErrorMessage(caught));
    }
  }

  async function finishAndSave() {
    const repetitions = latestFrame?.repetitions ?? 0;
    if (!pendingSummary && repetitions < targetRepetitions) {
      Alert.alert(
        'Set still in progress',
        `Complete ${targetRepetitions - repetitions} more ${
          targetRepetitions - repetitions === 1 ? 'rep' : 'reps'
        } before finishing this set.`,
      );
      return;
    }

    setCameraState('SAVING');
    setError(undefined);

    let summary = pendingSummary;
    if (!summary) {
      if (!analysisSessionId) {
        setCameraState('PAUSED');
        setError(
          'The vision session is no longer active. Start the set again.',
        );
        return;
      }

      try {
        summary = await visionApi.finishSession(
          exerciseCode,
          analysisSessionId,
        );
        analysisFinishedRef.current = true;
        setAnalysisSessionId(undefined);
        setPendingSummary(summary);
      } catch (caught) {
        setError(visionErrorMessage(caught));
        setCameraState('PAUSED');
        return;
      }
    }

    if (!summary.completed) {
      setCameraState('PAUSED');
      return;
    }

    try {
      await visionApi.saveWorkoutResult({
        workoutSessionId,
        exerciseId,
        completedSets: setNumber,
        completedRepetitions: summary.repetitions,
        averageTempoSeconds: summary.average_tempo_seconds,
        formFlags: summary.form_flags,
        score: summary.score,
      });

      publishResult({
        resultKey,
        repetitions: summary.repetitions,
        score: summary.score,
        formFlags: summary.form_flags,
      });
      setSavedSummary(summary);
      setPendingSummary(undefined);
      setCameraState('COMPLETE');
      speakCoachCue(
        `Set complete. ${summary.repetitions} repetitions recorded.`,
      ).catch(() => undefined);
    } catch (caught) {
      setError(apiErrorMessage(caught, 'The summary could not be saved.'));
      setCameraState('PAUSED');
    }
  }

  if (!permission.hasPermission) {
    return (
      <Screen>
        <View style={styles.permissionContent}>
          <View
            style={[
              styles.permissionIcon,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <AppIcon name="camera" color={colors.primary} size={42} />
          </View>
          <Text style={[styles.permissionTitle, { color: colors.text }]}>
            Camera access
          </Text>
          <Text style={[styles.centerText, { color: colors.muted }]}>
            GymBro needs the camera only while you perform a vision-supported
            set. Frames are analysed and discarded; raw images are not stored.
          </Text>
          <PrimaryButton
            label={
              permission.canRequestPermission ? 'Allow camera' : 'Open settings'
            }
            onPress={() => {
              if (permission.canRequestPermission) {
                permission.requestPermission().catch(() => undefined);
              } else {
                Linking.openSettings().catch(() => undefined);
              }
            }}
          />
        </View>
      </Screen>
    );
  }

  if (!device) {
    return (
      <Screen>
        <View style={styles.permissionContent}>
          <Text style={[styles.permissionTitle, { color: colors.text }]}>
            No rear camera found
          </Text>
          <Text style={[styles.centerText, { color: colors.muted }]}>
            Connect or enable a camera, then try again.
          </Text>
        </View>
      </Screen>
    );
  }

  const repetitions =
    savedSummary?.repetitions ?? latestFrame?.repetitions ?? 0;
  const phase = latestFrame?.phase ?? 'STANDING';
  const calibrated =
    latestFrame?.calibrated ?? latestFrame?.pose_detected ?? false;
  const formFlags = savedSummary?.form_flags ?? latestFrame?.form_flags ?? [];

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Back to workout"
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={[styles.roundButton, { backgroundColor: colors.surface }]}
        >
          <AppIcon name="arrowLeft" color={colors.text} size={17} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            VISION COACH
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {exerciseName}
          </Text>
        </View>
        <View
          style={[styles.setBadge, { backgroundColor: colors.primarySoft }]}
        >
          <Text style={[styles.setBadgeText, { color: colors.primary }]}>
            SET {setNumber}
          </Text>
        </View>
      </View>

      <View style={styles.cameraFrame}>
        {cameraState !== 'COMPLETE' ? (
          <Camera
            device={device}
            isActive={cameraState === 'RUNNING' || cameraState === 'PAUSED'}
            outputs={[photoOutput]}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={styles.completePanel}>
            <AppIcon name="circleCheck" color={colors.accent} size={72} />
            <Text style={styles.completeTitle}>Set captured</Text>
            <Text style={styles.completeScore}>
              {savedSummary?.score.toFixed(0)}%
            </Text>
            <Text style={styles.completeCaption}>FORM SCORE</Text>
          </View>
        )}

        {cameraState !== 'COMPLETE' ? (
          <>
            <View
              style={[
                styles.positionGuide,
                exerciseCode === 'BICEP_CURL' ? styles.curlPositionGuide : null,
              ]}
            />
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>
                {cameraState === 'RUNNING'
                  ? calibrated
                    ? 'LIVE'
                    : 'ALIGN'
                  : 'READY'}
              </Text>
            </View>
            <View style={styles.repOverlay}>
              <Text style={styles.repNumber}>{repetitions}</Text>
              <Text style={styles.repTarget}>OF {targetRepetitions} REPS</Text>
            </View>
          </>
        ) : null}
      </View>

      <View style={styles.metricsRow}>
        <View style={[styles.metric, { backgroundColor: colors.surface }]}>
          <Text style={[styles.metricLabel, { color: colors.muted }]}>
            PHASE
          </Text>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {PHASE_LABELS[phase]}
          </Text>
        </View>
        <View style={[styles.metric, { backgroundColor: colors.surface }]}>
          <Text style={[styles.metricLabel, { color: colors.muted }]}>
            {exerciseCode === 'BICEP_CURL' ? 'ELBOW ANGLE' : 'KNEE ANGLE'}
          </Text>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {(exerciseCode === 'BICEP_CURL'
              ? latestFrame?.elbow_angle
              : latestFrame?.knee_angle) != null
              ? `${(exerciseCode === 'BICEP_CURL'
                  ? latestFrame?.elbow_angle
                  : latestFrame?.knee_angle
                )?.toFixed(0)}°`
              : '—'}
          </Text>
        </View>
        <View style={[styles.metric, { backgroundColor: colors.surface }]}>
          <Text style={[styles.metricLabel, { color: colors.muted }]}>
            TEMPO
          </Text>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            {savedSummary?.average_tempo_seconds
              ? `${savedSummary.average_tempo_seconds.toFixed(1)}s`
              : 'Live'}
          </Text>
        </View>
      </View>

      <View style={[styles.feedback, { backgroundColor: colors.primarySoft }]}>
        <AppIcon name="info" color={colors.primary} size={18} />
        <Text style={[styles.feedbackText, { color: colors.text }]}>
          {latestFrame?.feedback ??
            (exerciseCode === 'BICEP_CURL'
              ? 'Place your working arm inside the guide, then start.'
              : 'Place your full body inside the guide, then start.')}
        </Text>
      </View>

      {formFlags.length ? (
        <View style={styles.flags}>
          {formFlags.map(flag => (
            <View
              key={flag}
              style={[styles.flag, { borderColor: colors.warning }]}
            >
              <Text style={[styles.flagText, { color: colors.warning }]}>
                {formFlagLabel(flag)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <StatusNotice message={error} tone="error" />

      {cameraState === 'READY' ? (
        <PrimaryButton label="Start camera coaching" onPress={startTracking} />
      ) : null}
      {cameraState === 'RUNNING' || cameraState === 'PAUSED' ? (
        <View style={styles.actions}>
          <PrimaryButton
            label={cameraState === 'PAUSED' ? 'Resume' : 'Pause'}
            variant="secondary"
            onPress={() =>
              setCameraState(value =>
                value === 'RUNNING' ? 'PAUSED' : 'RUNNING',
              )
            }
          />
          <PrimaryButton label="Finish set" onPress={finishAndSave} />
        </View>
      ) : null}
      {cameraState === 'SAVING' ? (
        <PrimaryButton
          label="Saving result"
          loading
          onPress={() => undefined}
        />
      ) : null}
      {cameraState === 'COMPLETE' ? (
        <PrimaryButton
          label="Continue workout"
          onPress={() => navigation.goBack()}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  headerCopy: { flex: 1 },
  roundButton: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  title: { fontFamily: fonts.displaySemibold, fontSize: 24 },
  setBadge: { borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  setBadgeText: { fontFamily: fonts.body, fontSize: 11, fontWeight: '900' },
  cameraFrame: {
    backgroundColor: '#050706',
    borderRadius: 24,
    flex: 1,
    minHeight: 360,
    overflow: 'hidden',
  },
  positionGuide: {
    borderColor: 'rgba(255,255,255,0.65)',
    borderRadius: 90,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    bottom: 28,
    left: '25%',
    position: 'absolute',
    right: '25%',
    top: 38,
  },
  curlPositionGuide: {
    borderRadius: 70,
    bottom: 70,
    left: '17%',
    right: '17%',
    top: 70,
  },
  liveBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(7,12,9,0.72)',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 7,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    position: 'absolute',
    top: 14,
  },
  liveDot: { backgroundColor: '#62C78C', borderRadius: 5, height: 9, width: 9 },
  liveText: {
    color: '#FFFFFF',
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  repOverlay: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(7,12,9,0.72)',
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 8,
    position: 'absolute',
    right: 14,
    top: 14,
  },
  repNumber: {
    color: '#FFFFFF',
    fontFamily: fonts.display,
    fontSize: 38,
    lineHeight: 39,
  },
  repTarget: {
    color: '#D7E6DC',
    fontFamily: fonts.body,
    fontSize: 9,
    fontWeight: '900',
  },
  metricsRow: { flexDirection: 'row', gap: 8 },
  metric: {
    borderRadius: 14,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  metricLabel: {
    fontFamily: fonts.body,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  metricValue: {
    fontFamily: fonts.displaySemibold,
    fontSize: 15,
    marginTop: 3,
  },
  feedback: {
    alignItems: 'center',
    borderRadius: 15,
    flexDirection: 'row',
    gap: 10,
    padding: 13,
  },
  feedbackText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  flags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  flag: {
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  flagText: { fontFamily: fonts.body, fontSize: 11, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 10 },
  permissionContent: { flex: 1, gap: 18, justifyContent: 'center' },
  permissionIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 42,
    height: 84,
    justifyContent: 'center',
    width: 84,
  },
  permissionTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 30,
    textAlign: 'center',
  },
  centerText: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
  completePanel: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  completeTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.displaySemibold,
    fontSize: 27,
    marginTop: 14,
  },
  completeScore: {
    color: '#C9F26B',
    fontFamily: fonts.display,
    fontSize: 55,
    marginTop: 12,
  },
  completeCaption: {
    color: '#CBD6CE',
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
});
