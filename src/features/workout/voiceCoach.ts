import Speech from '@mhpdev/react-native-speech';

let configured = false;
let requestGeneration = 0;

export function configureVoiceCoach() {
  if (configured) return;

  Speech.configure({
    language: 'en-GB',
    volume: 1,
    pitch: 1,
    rate: 0.88,
    ducking: true,
    silentMode: 'ignore',
  });
  configured = true;
}

export async function speakCoachCue(text: string) {
  configureVoiceCoach();
  const generation = ++requestGeneration;

  try {
    await Speech.stop();
    if (generation !== requestGeneration) return true;
    await Speech.speak(text);
    return true;
  } catch {
    return false;
  }
}

export async function stopCoachVoice() {
  requestGeneration += 1;

  try {
    await Speech.stop();
  } catch {
    // A missing device voice must never interrupt the workout itself.
  }
}
