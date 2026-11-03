import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import {faBolt} from '@fortawesome/free-solid-svg-icons/faBolt';
import {faCamera} from '@fortawesome/free-solid-svg-icons/faCamera';
import {faChartLine} from '@fortawesome/free-solid-svg-icons/faChartLine';
import {faCheck} from '@fortawesome/free-solid-svg-icons/faCheck';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons/faChevronRight';
import {faClock} from '@fortawesome/free-solid-svg-icons/faClock';
import {faDumbbell} from '@fortawesome/free-solid-svg-icons/faDumbbell';
import {faHouse} from '@fortawesome/free-solid-svg-icons/faHouse';
import {faMoon} from '@fortawesome/free-solid-svg-icons/faMoon';
import {faPen} from '@fortawesome/free-solid-svg-icons/faPen';
import {faRotateRight} from '@fortawesome/free-solid-svg-icons/faRotateRight';
import {faShieldHalved} from '@fortawesome/free-solid-svg-icons/faShieldHalved';
import {faSun} from '@fortawesome/free-solid-svg-icons/faSun';
import {faTrash} from '@fortawesome/free-solid-svg-icons/faTrash';
import {faUser} from '@fortawesome/free-solid-svg-icons/faUser';
import {faWater} from '@fortawesome/free-solid-svg-icons/faWater';
import {faXmark} from '@fortawesome/free-solid-svg-icons/faXmark';
import type {IconDefinition} from '@fortawesome/fontawesome-svg-core';

const icons = {arrowLeft: faArrowLeft, bolt: faBolt, camera: faCamera, chart: faChartLine,
  check: faCheck, chevron: faChevronRight, clock: faClock, dumbbell: faDumbbell,
  home: faHouse, moon: faMoon, pen: faPen, retry: faRotateRight, shield: faShieldHalved,
  sun: faSun, trash: faTrash, user: faUser, water: faWater, close: faXmark} satisfies Record<string, IconDefinition>;

export type AppIconName = keyof typeof icons;
export function AppIcon({name, color, size = 18}: {name: AppIconName; color: string; size?: number}) {
  return <FontAwesomeIcon icon={icons[name]} color={color} size={size} />;
}
