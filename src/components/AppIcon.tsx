import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import { faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons/faArrowsLeftRight';
import { faArrowsUpDown } from '@fortawesome/free-solid-svg-icons/faArrowsUpDown';
import { faBolt } from '@fortawesome/free-solid-svg-icons/faBolt';
import { faBullseye } from '@fortawesome/free-solid-svg-icons/faBullseye';
import { faCamera } from '@fortawesome/free-solid-svg-icons/faCamera';
import { faChartLine } from '@fortawesome/free-solid-svg-icons/faChartLine';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons/faCircleCheck';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons/faCircleExclamation';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons/faCircleInfo';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faClock } from '@fortawesome/free-solid-svg-icons/faClock';
import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons/faClockRotateLeft';
import { faDumbbell } from '@fortawesome/free-solid-svg-icons/faDumbbell';
import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash';
import { faHouse } from '@fortawesome/free-solid-svg-icons/faHouse';
import { faHandFist } from '@fortawesome/free-solid-svg-icons/faHandFist';
import { faMoon } from '@fortawesome/free-solid-svg-icons/faMoon';
import { faPause } from '@fortawesome/free-solid-svg-icons/faPause';
import { faPen } from '@fortawesome/free-solid-svg-icons/faPen';
import { faPersonArrowUpFromLine } from '@fortawesome/free-solid-svg-icons/faPersonArrowUpFromLine';
import { faPersonRunning } from '@fortawesome/free-solid-svg-icons/faPersonRunning';
import { faPersonWalking } from '@fortawesome/free-solid-svg-icons/faPersonWalking';
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons/faRotateRight';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons/faShieldHalved';
import { faSun } from '@fortawesome/free-solid-svg-icons/faSun';
import { faStairs } from '@fortawesome/free-solid-svg-icons/faStairs';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser';
import { faVolumeHigh } from '@fortawesome/free-solid-svg-icons/faVolumeHigh';
import { faVolumeXmark } from '@fortawesome/free-solid-svg-icons/faVolumeXmark';
import { faWater } from '@fortawesome/free-solid-svg-icons/faWater';
import { faWeightHanging } from '@fortawesome/free-solid-svg-icons/faWeightHanging';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const icons = {
  arrowLeft: faArrowLeft,
  bolt: faBolt,
  camera: faCamera,
  chart: faChartLine,
  check: faCheck,
  circleCheck: faCircleCheck,
  error: faCircleExclamation,
  info: faCircleInfo,
  chevron: faChevronRight,
  clock: faClock,
  history: faClockRotateLeft,
  dumbbell: faDumbbell,
  cardio: faPersonRunning,
  core: faBullseye,
  lowerBody: faPersonWalking,
  pull: faArrowsLeftRight,
  push: faHandFist,
  squat: faPersonArrowUpFromLine,
  step: faStairs,
  verticalMove: faArrowsUpDown,
  weight: faWeightHanging,
  eye: faEye,
  eyeSlash: faEyeSlash,
  home: faHouse,
  moon: faMoon,
  pause: faPause,
  pen: faPen,
  play: faPlay,
  retry: faRotateRight,
  shield: faShieldHalved,
  sun: faSun,
  trash: faTrash,
  user: faUser,
  volume: faVolumeHigh,
  volumeOff: faVolumeXmark,
  water: faWater,
  close: faXmark,
} satisfies Record<string, IconDefinition>;

export type AppIconName = keyof typeof icons;
export function AppIcon({
  name,
  color,
  size = 18,
}: {
  name: AppIconName;
  color: string;
  size?: number;
}) {
  return <FontAwesomeIcon icon={icons[name]} color={color} size={size} />;
}
