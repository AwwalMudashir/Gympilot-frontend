type Point = readonly [number, number];

type Pose = {
  head: Point;
  torso: readonly Point[];
  leftArm: readonly Point[];
  rightArm: readonly Point[];
  leftLeg: readonly Point[];
  rightLeg: readonly Point[];
};

type EquipmentLine = {
  name: string;
  start: readonly Point[];
  end: readonly Point[];
  width?: number;
};

type Motion = {
  name: string;
  start: Pose;
  end: Pose;
  equipment?: EquipmentLine[];
};

const PRIMARY = [0.247, 0.639, 0.424, 1];
const INK = [0.071, 0.094, 0.078, 1];
const FLOOR = [0.866, 0.898, 0.875, 1];
const EASE_IN = { x: 0.67, y: 1 };
const EASE_OUT = { x: 0.33, y: 0 };

function shape(points: readonly Point[]) {
  return {
    i: points.map(() => [0, 0]),
    o: points.map(() => [0, 0]),
    v: points,
    c: false,
  };
}

function animatedPath(start: readonly Point[], end: readonly Point[]) {
  return {
    a: 1,
    k: [
      {
        t: 0,
        s: [shape(start)],
        e: [shape(end)],
        i: EASE_IN,
        o: EASE_OUT,
      },
      {
        t: 30,
        s: [shape(end)],
        e: [shape(start)],
        i: EASE_IN,
        o: EASE_OUT,
      },
      { t: 60, s: [shape(start)] },
    ],
  };
}

function transform() {
  return {
    o: { a: 0, k: 100 },
    r: { a: 0, k: 0 },
    p: { a: 0, k: [0, 0, 0] },
    a: { a: 0, k: [0, 0, 0] },
    s: { a: 0, k: [100, 100, 100] },
  };
}

function pathLayer(
  index: number,
  name: string,
  start: readonly Point[],
  end: readonly Point[],
  color = INK,
  width = 14,
) {
  return {
    ddd: 0,
    ind: index,
    ty: 4,
    nm: name,
    ks: transform(),
    shapes: [
      { ty: 'sh', ks: animatedPath(start, end), nm: `${name} Path` },
      {
        ty: 'st',
        c: { a: 0, k: color },
        o: { a: 0, k: 100 },
        w: { a: 0, k: width },
        lc: 2,
        lj: 2,
        nm: `${name} Stroke`,
      },
    ],
    ip: 0,
    op: 60,
    st: 0,
    bm: 0,
  };
}

function headLayer(start: Point, end: Point) {
  return {
    ddd: 0,
    ind: 1,
    ty: 4,
    nm: 'Head',
    ks: {
      ...transform(),
      p: {
        a: 1,
        k: [
          { t: 0, s: [...start, 0], e: [...end, 0], i: EASE_IN, o: EASE_OUT },
          { t: 30, s: [...end, 0], e: [...start, 0], i: EASE_IN, o: EASE_OUT },
          { t: 60, s: [...start, 0] },
        ],
      },
    },
    shapes: [
      {
        ty: 'el',
        p: { a: 0, k: [0, 0] },
        s: { a: 0, k: [38, 38] },
        nm: 'Head',
      },
      {
        ty: 'fl',
        c: { a: 0, k: PRIMARY },
        o: { a: 0, k: 100 },
        r: 1,
        nm: 'Head Fill',
      },
    ],
    ip: 0,
    op: 60,
    st: 0,
    bm: 0,
  };
}

function floorLayer(index: number) {
  return {
    ddd: 0,
    ind: index,
    ty: 4,
    nm: 'Floor',
    ks: transform(),
    shapes: [
      {
        ty: 'sh',
        ks: {
          a: 0,
          k: shape([
            [35, 278],
            [265, 278],
          ]),
        },
        nm: 'Floor Path',
      },
      {
        ty: 'st',
        c: { a: 0, k: FLOOR },
        o: { a: 0, k: 100 },
        w: { a: 0, k: 5 },
        lc: 2,
        lj: 2,
        nm: 'Floor Stroke',
      },
    ],
    ip: 0,
    op: 60,
    st: 0,
    bm: 0,
  };
}

function createAnimation(motion: Motion) {
  const layers: Array<
    | ReturnType<typeof headLayer>
    | ReturnType<typeof pathLayer>
    | ReturnType<typeof floorLayer>
  > = [
    headLayer(motion.start.head, motion.end.head),
    pathLayer(2, 'Torso', motion.start.torso, motion.end.torso, INK, 17),
    pathLayer(
      3,
      'Left Arm',
      motion.start.leftArm,
      motion.end.leftArm,
      PRIMARY,
      12,
    ),
    pathLayer(
      4,
      'Right Arm',
      motion.start.rightArm,
      motion.end.rightArm,
      PRIMARY,
      12,
    ),
    pathLayer(5, 'Left Leg', motion.start.leftLeg, motion.end.leftLeg, INK, 14),
    pathLayer(
      6,
      'Right Leg',
      motion.start.rightLeg,
      motion.end.rightLeg,
      INK,
      14,
    ),
  ];

  motion.equipment?.forEach((item, equipmentIndex) => {
    layers.push(
      pathLayer(
        7 + equipmentIndex,
        item.name,
        item.start,
        item.end,
        INK,
        item.width ?? 8,
      ),
    );
  });

  layers.push(floorLayer(7 + (motion.equipment?.length ?? 0)));

  return {
    v: '5.12.2',
    fr: 30,
    ip: 0,
    op: 60,
    w: 300,
    h: 300,
    nm: `GymBro ${motion.name} Stick Figure`,
    ddd: 0,
    assets: [],
    layers,
  };
}

const standing: Pose = {
  head: [150, 48],
  torso: [
    [150, 72],
    [150, 166],
  ],
  leftArm: [
    [145, 92],
    [121, 143],
    [112, 198],
  ],
  rightArm: [
    [155, 92],
    [179, 143],
    [188, 198],
  ],
  leftLeg: [
    [146, 164],
    [127, 218],
    [118, 272],
  ],
  rightLeg: [
    [154, 164],
    [173, 218],
    [182, 272],
  ],
};

const motions: Record<string, Motion> = {
  push: {
    name: 'Push Up',
    start: {
      head: [61, 151],
      torso: [
        [82, 158],
        [186, 180],
      ],
      leftArm: [
        [91, 160],
        [89, 204],
        [72, 255],
      ],
      rightArm: [
        [104, 163],
        [112, 207],
        [102, 255],
      ],
      leftLeg: [
        [184, 180],
        [225, 209],
        [260, 259],
      ],
      rightLeg: [
        [178, 184],
        [215, 217],
        [246, 265],
      ],
    },
    end: {
      head: [65, 207],
      torso: [
        [88, 210],
        [188, 221],
      ],
      leftArm: [
        [96, 211],
        [78, 230],
        [72, 255],
      ],
      rightArm: [
        [108, 212],
        [108, 232],
        [102, 255],
      ],
      leftLeg: [
        [186, 221],
        [226, 237],
        [260, 259],
      ],
      rightLeg: [
        [180, 225],
        [218, 244],
        [246, 265],
      ],
    },
  },
  bridge: {
    name: 'Glute Bridge',
    start: {
      head: [48, 245],
      torso: [
        [70, 247],
        [157, 251],
      ],
      leftArm: [
        [75, 244],
        [112, 258],
        [145, 265],
      ],
      rightArm: [
        [76, 250],
        [112, 268],
        [148, 273],
      ],
      leftLeg: [
        [157, 250],
        [210, 221],
        [249, 266],
      ],
      rightLeg: [
        [157, 255],
        [205, 235],
        [236, 273],
      ],
    },
    end: {
      head: [48, 245],
      torso: [
        [70, 244],
        [157, 190],
      ],
      leftArm: [
        [75, 244],
        [112, 258],
        [145, 265],
      ],
      rightArm: [
        [76, 250],
        [112, 268],
        [148, 273],
      ],
      leftLeg: [
        [157, 190],
        [210, 221],
        [249, 266],
      ],
      rightLeg: [
        [157, 196],
        [205, 235],
        [236, 273],
      ],
    },
  },
  lunge: {
    name: 'Reverse Lunge',
    start: standing,
    end: {
      head: [145, 77],
      torso: [
        [145, 100],
        [150, 182],
      ],
      leftArm: [
        [140, 115],
        [116, 155],
        [111, 205],
      ],
      rightArm: [
        [150, 115],
        [174, 155],
        [181, 205],
      ],
      leftLeg: [
        [147, 181],
        [105, 214],
        [72, 267],
      ],
      rightLeg: [
        [153, 181],
        [194, 220],
        [225, 268],
      ],
    },
  },
  plank: {
    name: 'Forearm Plank',
    start: {
      head: [61, 183],
      torso: [
        [82, 188],
        [184, 195],
      ],
      leftArm: [
        [91, 190],
        [76, 224],
        [53, 258],
      ],
      rightArm: [
        [105, 191],
        [100, 229],
        [82, 260],
      ],
      leftLeg: [
        [184, 195],
        [225, 219],
        [261, 260],
      ],
      rightLeg: [
        [179, 200],
        [216, 227],
        [245, 267],
      ],
    },
    end: {
      head: [61, 179],
      torso: [
        [82, 184],
        [184, 190],
      ],
      leftArm: [
        [91, 186],
        [76, 224],
        [53, 258],
      ],
      rightArm: [
        [105, 187],
        [100, 229],
        [82, 260],
      ],
      leftLeg: [
        [184, 190],
        [225, 219],
        [261, 260],
      ],
      rightLeg: [
        [179, 195],
        [216, 227],
        [245, 267],
      ],
    },
  },
  deadBug: {
    name: 'Dead Bug',
    start: {
      head: [48, 246],
      torso: [
        [70, 247],
        [150, 250],
      ],
      leftArm: [
        [78, 244],
        [107, 197],
        [135, 152],
      ],
      rightArm: [
        [82, 251],
        [116, 210],
        [151, 173],
      ],
      leftLeg: [
        [150, 247],
        [190, 202],
        [218, 157],
      ],
      rightLeg: [
        [150, 254],
        [194, 223],
        [234, 198],
      ],
    },
    end: {
      head: [48, 246],
      torso: [
        [70, 247],
        [150, 250],
      ],
      leftArm: [
        [78, 244],
        [112, 264],
        [155, 272],
      ],
      rightArm: [
        [82, 251],
        [116, 210],
        [151, 173],
      ],
      leftLeg: [
        [150, 247],
        [190, 202],
        [218, 157],
      ],
      rightLeg: [
        [150, 254],
        [200, 260],
        [255, 270],
      ],
    },
  },
  climber: {
    name: 'Mountain Climber',
    start: {
      head: [61, 151],
      torso: [
        [82, 158],
        [181, 181],
      ],
      leftArm: [
        [91, 160],
        [84, 207],
        [72, 258],
      ],
      rightArm: [
        [104, 163],
        [108, 210],
        [103, 260],
      ],
      leftLeg: [
        [179, 180],
        [137, 217],
        [108, 264],
      ],
      rightLeg: [
        [184, 184],
        [225, 215],
        [260, 260],
      ],
    },
    end: {
      head: [61, 151],
      torso: [
        [82, 158],
        [181, 181],
      ],
      leftArm: [
        [91, 160],
        [84, 207],
        [72, 258],
      ],
      rightArm: [
        [104, 163],
        [108, 210],
        [103, 260],
      ],
      leftLeg: [
        [179, 180],
        [225, 215],
        [260, 260],
      ],
      rightLeg: [
        [184, 184],
        [142, 219],
        [112, 265],
      ],
    },
  },
  gobletSquat: {
    name: 'Kettlebell Goblet Squat',
    start: {
      ...standing,
      leftArm: [
        [145, 94],
        [126, 112],
        [145, 129],
      ],
      rightArm: [
        [155, 94],
        [174, 112],
        [155, 129],
      ],
    },
    end: {
      head: [150, 87],
      torso: [
        [150, 111],
        [150, 183],
      ],
      leftArm: [
        [145, 128],
        [124, 137],
        [145, 151],
      ],
      rightArm: [
        [155, 128],
        [176, 137],
        [155, 151],
      ],
      leftLeg: [
        [146, 181],
        [105, 209],
        [88, 267],
      ],
      rightLeg: [
        [154, 181],
        [195, 209],
        [212, 267],
      ],
    },
    equipment: [
      {
        name: 'Kettlebell',
        start: [
          [139, 128],
          [150, 142],
          [161, 128],
          [150, 118],
          [139, 128],
        ],
        end: [
          [139, 150],
          [150, 164],
          [161, 150],
          [150, 140],
          [139, 150],
        ],
        width: 7,
      },
    ],
  },
  smithSquat: {
    name: 'Smith Machine Squat',
    start: standing,
    end: {
      head: [150, 87],
      torso: [
        [150, 111],
        [150, 183],
      ],
      leftArm: [
        [145, 121],
        [114, 112],
        [88, 108],
      ],
      rightArm: [
        [155, 121],
        [186, 112],
        [212, 108],
      ],
      leftLeg: [
        [146, 181],
        [105, 209],
        [88, 267],
      ],
      rightLeg: [
        [154, 181],
        [195, 209],
        [212, 267],
      ],
    },
    equipment: [
      {
        name: 'Smith Bar',
        start: [
          [73, 103],
          [227, 103],
        ],
        end: [
          [73, 116],
          [227, 116],
        ],
        width: 8,
      },
      {
        name: 'Left Rail',
        start: [
          [58, 30],
          [58, 272],
        ],
        end: [
          [58, 30],
          [58, 272],
        ],
        width: 5,
      },
      {
        name: 'Right Rail',
        start: [
          [242, 30],
          [242, 272],
        ],
        end: [
          [242, 30],
          [242, 272],
        ],
        width: 5,
      },
    ],
  },
  row: {
    name: 'Row',
    start: {
      head: [95, 92],
      torso: [
        [112, 111],
        [177, 164],
      ],
      leftArm: [
        [117, 118],
        [100, 164],
        [85, 211],
      ],
      rightArm: [
        [126, 124],
        [121, 173],
        [119, 222],
      ],
      leftLeg: [
        [173, 163],
        [151, 218],
        [137, 271],
      ],
      rightLeg: [
        [181, 164],
        [209, 215],
        [229, 269],
      ],
    },
    end: {
      head: [95, 92],
      torso: [
        [112, 111],
        [177, 164],
      ],
      leftArm: [
        [117, 118],
        [139, 145],
        [169, 158],
      ],
      rightArm: [
        [126, 124],
        [148, 151],
        [179, 164],
      ],
      leftLeg: [
        [173, 163],
        [151, 218],
        [137, 271],
      ],
      rightLeg: [
        [181, 164],
        [209, 215],
        [229, 269],
      ],
    },
    equipment: [
      {
        name: 'Weight',
        start: [
          [73, 213],
          [98, 213],
        ],
        end: [
          [157, 162],
          [182, 162],
        ],
        width: 10,
      },
    ],
  },
  oneArmRow: {
    name: 'One Arm Dumbbell Row',
    start: {
      head: [93, 90],
      torso: [
        [111, 110],
        [176, 162],
      ],
      leftArm: [
        [116, 118],
        [159, 147],
        [198, 166],
      ],
      rightArm: [
        [126, 125],
        [122, 174],
        [120, 225],
      ],
      leftLeg: [
        [172, 160],
        [146, 211],
        [127, 268],
      ],
      rightLeg: [
        [180, 163],
        [211, 214],
        [235, 269],
      ],
    },
    end: {
      head: [93, 90],
      torso: [
        [111, 110],
        [176, 162],
      ],
      leftArm: [
        [116, 118],
        [159, 147],
        [198, 166],
      ],
      rightArm: [
        [126, 125],
        [151, 148],
        [178, 157],
      ],
      leftLeg: [
        [172, 160],
        [146, 211],
        [127, 268],
      ],
      rightLeg: [
        [180, 163],
        [211, 214],
        [235, 269],
      ],
    },
    equipment: [
      {
        name: 'Bench Support',
        start: [
          [178, 169],
          [237, 169],
        ],
        end: [
          [178, 169],
          [237, 169],
        ],
        width: 10,
      },
      {
        name: 'Dumbbell',
        start: [
          [106, 226],
          [134, 226],
        ],
        end: [
          [164, 158],
          [192, 158],
        ],
        width: 10,
      },
    ],
  },
  press: {
    name: 'Overhead Press',
    start: {
      ...standing,
      leftArm: [
        [145, 92],
        [112, 116],
        [103, 78],
      ],
      rightArm: [
        [155, 92],
        [188, 116],
        [197, 78],
      ],
    },
    end: {
      ...standing,
      leftArm: [
        [145, 92],
        [133, 54],
        [126, 22],
      ],
      rightArm: [
        [155, 92],
        [167, 54],
        [174, 22],
      ],
    },
    equipment: [
      {
        name: 'Left Weight',
        start: [
          [91, 78],
          [115, 78],
        ],
        end: [
          [114, 22],
          [138, 22],
        ],
        width: 10,
      },
      {
        name: 'Right Weight',
        start: [
          [185, 78],
          [209, 78],
        ],
        end: [
          [162, 22],
          [186, 22],
        ],
        width: 10,
      },
    ],
  },
  pullUp: {
    name: 'Pull Up',
    start: {
      head: [150, 104],
      torso: [
        [150, 127],
        [150, 204],
      ],
      leftArm: [
        [145, 133],
        [112, 85],
        [91, 36],
      ],
      rightArm: [
        [155, 133],
        [188, 85],
        [209, 36],
      ],
      leftLeg: [
        [146, 202],
        [130, 235],
        [118, 270],
      ],
      rightLeg: [
        [154, 202],
        [170, 235],
        [182, 270],
      ],
    },
    end: {
      head: [150, 55],
      torso: [
        [150, 78],
        [150, 166],
      ],
      leftArm: [
        [145, 86],
        [112, 68],
        [91, 36],
      ],
      rightArm: [
        [155, 86],
        [188, 68],
        [209, 36],
      ],
      leftLeg: [
        [146, 164],
        [130, 214],
        [118, 263],
      ],
      rightLeg: [
        [154, 164],
        [170, 214],
        [182, 263],
      ],
    },
    equipment: [
      {
        name: 'Bar',
        start: [
          [68, 35],
          [232, 35],
        ],
        end: [
          [68, 35],
          [232, 35],
        ],
        width: 8,
      },
    ],
  },
  kneeRaise: {
    name: 'Hanging Knee Raise',
    start: {
      head: [150, 83],
      torso: [
        [150, 106],
        [150, 188],
      ],
      leftArm: [
        [145, 112],
        [112, 75],
        [92, 35],
      ],
      rightArm: [
        [155, 112],
        [188, 75],
        [208, 35],
      ],
      leftLeg: [
        [146, 186],
        [130, 229],
        [119, 270],
      ],
      rightLeg: [
        [154, 186],
        [170, 229],
        [181, 270],
      ],
    },
    end: {
      head: [150, 83],
      torso: [
        [150, 106],
        [150, 188],
      ],
      leftArm: [
        [145, 112],
        [112, 75],
        [92, 35],
      ],
      rightArm: [
        [155, 112],
        [188, 75],
        [208, 35],
      ],
      leftLeg: [
        [146, 186],
        [112, 190],
        [89, 158],
      ],
      rightLeg: [
        [154, 186],
        [188, 190],
        [211, 158],
      ],
    },
    equipment: [
      {
        name: 'Bar',
        start: [
          [68, 35],
          [232, 35],
        ],
        end: [
          [68, 35],
          [232, 35],
        ],
        width: 8,
      },
    ],
  },
  bandPull: {
    name: 'Band Pull Apart',
    start: {
      ...standing,
      leftArm: [
        [145, 95],
        [130, 108],
        [142, 121],
      ],
      rightArm: [
        [155, 95],
        [170, 108],
        [158, 121],
      ],
    },
    end: {
      ...standing,
      leftArm: [
        [145, 95],
        [105, 105],
        [65, 112],
      ],
      rightArm: [
        [155, 95],
        [195, 105],
        [235, 112],
      ],
    },
    equipment: [
      {
        name: 'Band',
        start: [
          [142, 121],
          [158, 121],
        ],
        end: [
          [65, 112],
          [235, 112],
        ],
        width: 5,
      },
    ],
  },
  lateralWalk: {
    name: 'Lateral Walk',
    start: standing,
    end: {
      ...standing,
      head: [170, 48],
      torso: [
        [170, 72],
        [170, 166],
      ],
      leftLeg: [
        [166, 164],
        [132, 215],
        [91, 271],
      ],
      rightLeg: [
        [174, 164],
        [199, 219],
        [225, 270],
      ],
    },
    equipment: [
      {
        name: 'Band',
        start: [
          [120, 222],
          [180, 222],
        ],
        end: [
          [127, 220],
          [202, 220],
        ],
        width: 5,
      },
    ],
  },
  dip: {
    name: 'Bench Dip',
    start: {
      head: [118, 99],
      torso: [
        [126, 120],
        [145, 190],
      ],
      leftArm: [
        [129, 127],
        [164, 143],
        [190, 163],
      ],
      rightArm: [
        [136, 130],
        [172, 146],
        [198, 166],
      ],
      leftLeg: [
        [145, 188],
        [200, 215],
        [250, 260],
      ],
      rightLeg: [
        [141, 194],
        [192, 224],
        [238, 268],
      ],
    },
    end: {
      head: [118, 145],
      torso: [
        [126, 166],
        [145, 226],
      ],
      leftArm: [
        [129, 173],
        [164, 188],
        [190, 163],
      ],
      rightArm: [
        [136, 176],
        [172, 191],
        [198, 166],
      ],
      leftLeg: [
        [145, 224],
        [200, 238],
        [250, 260],
      ],
      rightLeg: [
        [141, 230],
        [192, 246],
        [238, 268],
      ],
    },
    equipment: [
      {
        name: 'Bench',
        start: [
          [177, 165],
          [236, 165],
        ],
        end: [
          [177, 165],
          [236, 165],
        ],
        width: 12,
      },
    ],
  },
  benchStepUp: {
    name: 'Bench Step Up',
    start: {
      head: [100, 69],
      torso: [
        [105, 94],
        [110, 177],
      ],
      leftArm: [
        [101, 112],
        [82, 154],
        [77, 198],
      ],
      rightArm: [
        [109, 112],
        [134, 150],
        [148, 190],
      ],
      leftLeg: [
        [107, 175],
        [144, 195],
        [176, 234],
      ],
      rightLeg: [
        [113, 177],
        [92, 226],
        [77, 272],
      ],
    },
    end: {
      head: [165, 43],
      torso: [
        [165, 68],
        [165, 153],
      ],
      leftArm: [
        [160, 88],
        [139, 128],
        [132, 170],
      ],
      rightArm: [
        [170, 88],
        [193, 126],
        [203, 168],
      ],
      leftLeg: [
        [161, 151],
        [174, 190],
        [181, 234],
      ],
      rightLeg: [
        [169, 151],
        [135, 158],
        [113, 129],
      ],
    },
    equipment: [
      {
        name: 'Bench',
        start: [
          [146, 235],
          [246, 235],
        ],
        end: [
          [146, 235],
          [246, 235],
        ],
        width: 12,
      },
    ],
  },
  boxStepUp: {
    name: 'Plyo Box Step Up',
    start: {
      head: [91, 70],
      torso: [
        [97, 95],
        [104, 179],
      ],
      leftArm: [
        [93, 113],
        [76, 155],
        [72, 198],
      ],
      rightArm: [
        [102, 113],
        [127, 151],
        [143, 190],
      ],
      leftLeg: [
        [101, 177],
        [142, 192],
        [178, 219],
      ],
      rightLeg: [
        [108, 179],
        [87, 227],
        [72, 272],
      ],
    },
    end: {
      head: [166, 35],
      torso: [
        [166, 60],
        [166, 145],
      ],
      leftArm: [
        [161, 80],
        [139, 119],
        [132, 162],
      ],
      rightArm: [
        [171, 80],
        [194, 118],
        [204, 160],
      ],
      leftLeg: [
        [162, 143],
        [174, 181],
        [183, 219],
      ],
      rightLeg: [
        [170, 143],
        [132, 139],
        [111, 104],
      ],
    },
    equipment: [
      {
        name: 'Plyo Box',
        start: [
          [148, 220],
          [148, 273],
          [252, 273],
          [252, 220],
          [148, 220],
        ],
        end: [
          [148, 220],
          [148, 273],
          [252, 273],
          [252, 220],
          [148, 220],
        ],
        width: 9,
      },
    ],
  },
  hinge: {
    name: 'Deadlift Hinge',
    start: standing,
    end: {
      head: [91, 110],
      torso: [
        [112, 124],
        [174, 168],
      ],
      leftArm: [
        [119, 132],
        [124, 183],
        [127, 232],
      ],
      rightArm: [
        [128, 137],
        [139, 187],
        [145, 235],
      ],
      leftLeg: [
        [170, 167],
        [149, 218],
        [136, 271],
      ],
      rightLeg: [
        [178, 168],
        [207, 216],
        [229, 269],
      ],
    },
    equipment: [
      {
        name: 'Weight',
        start: [
          [100, 207],
          [200, 207],
        ],
        end: [
          [104, 236],
          [169, 236],
        ],
        width: 9,
      },
    ],
  },
  slam: {
    name: 'Medicine Ball Slam',
    start: {
      ...standing,
      leftArm: [
        [145, 92],
        [132, 52],
        [143, 24],
      ],
      rightArm: [
        [155, 92],
        [168, 52],
        [157, 24],
      ],
    },
    end: {
      head: [104, 104],
      torso: [
        [122, 121],
        [174, 166],
      ],
      leftArm: [
        [128, 130],
        [132, 181],
        [145, 231],
      ],
      rightArm: [
        [137, 134],
        [149, 184],
        [155, 232],
      ],
      leftLeg: [
        [170, 165],
        [145, 218],
        [132, 270],
      ],
      rightLeg: [
        [178, 166],
        [207, 216],
        [229, 269],
      ],
    },
    equipment: [
      {
        name: 'Ball',
        start: [
          [137, 18],
          [163, 18],
        ],
        end: [
          [137, 239],
          [163, 239],
        ],
        width: 20,
      },
    ],
  },
  chestPress: {
    name: 'Chest Press',
    start: {
      ...standing,
      leftArm: [
        [145, 94],
        [121, 119],
        [145, 136],
      ],
      rightArm: [
        [155, 94],
        [179, 119],
        [155, 136],
      ],
    },
    end: {
      ...standing,
      leftArm: [
        [145, 94],
        [121, 107],
        [86, 108],
      ],
      rightArm: [
        [155, 94],
        [179, 107],
        [214, 108],
      ],
    },
  },
  pulldown: {
    name: 'Lat Pulldown',
    start: {
      ...standing,
      leftArm: [
        [145, 92],
        [113, 58],
        [88, 28],
      ],
      rightArm: [
        [155, 92],
        [187, 58],
        [212, 28],
      ],
    },
    end: {
      ...standing,
      leftArm: [
        [145, 92],
        [111, 104],
        [93, 84],
      ],
      rightArm: [
        [155, 92],
        [189, 104],
        [207, 84],
      ],
    },
    equipment: [
      {
        name: 'Handle',
        start: [
          [76, 27],
          [224, 27],
        ],
        end: [
          [81, 83],
          [219, 83],
        ],
        width: 7,
      },
    ],
  },
  legPress: {
    name: 'Leg Press',
    start: {
      head: [61, 202],
      torso: [
        [81, 192],
        [139, 234],
      ],
      leftArm: [
        [88, 196],
        [116, 220],
        [137, 239],
      ],
      rightArm: [
        [91, 202],
        [120, 228],
        [141, 245],
      ],
      leftLeg: [
        [139, 231],
        [181, 190],
        [222, 151],
      ],
      rightLeg: [
        [145, 237],
        [191, 201],
        [232, 168],
      ],
    },
    end: {
      head: [61, 202],
      torso: [
        [81, 192],
        [139, 234],
      ],
      leftArm: [
        [88, 196],
        [116, 220],
        [137, 239],
      ],
      rightArm: [
        [91, 202],
        [120, 228],
        [141, 245],
      ],
      leftLeg: [
        [139, 231],
        [195, 194],
        [257, 156],
      ],
      rightLeg: [
        [145, 237],
        [205, 205],
        [263, 174],
      ],
    },
    equipment: [
      {
        name: 'Platform',
        start: [
          [218, 133],
          [248, 171],
        ],
        end: [
          [253, 136],
          [276, 174],
        ],
        width: 10,
      },
    ],
  },
  legCurl: {
    name: 'Hamstring Curl',
    start: {
      head: [50, 233],
      torso: [
        [72, 237],
        [153, 240],
      ],
      leftArm: [
        [78, 235],
        [110, 250],
        [142, 258],
      ],
      rightArm: [
        [80, 242],
        [112, 260],
        [145, 267],
      ],
      leftLeg: [
        [153, 238],
        [201, 241],
        [252, 246],
      ],
      rightLeg: [
        [153, 245],
        [203, 251],
        [254, 258],
      ],
    },
    end: {
      head: [50, 233],
      torso: [
        [72, 237],
        [153, 240],
      ],
      leftArm: [
        [78, 235],
        [110, 250],
        [142, 258],
      ],
      rightArm: [
        [80, 242],
        [112, 260],
        [145, 267],
      ],
      leftLeg: [
        [153, 238],
        [193, 220],
        [171, 178],
      ],
      rightLeg: [
        [153, 245],
        [201, 229],
        [182, 188],
      ],
    },
  },
  suspensionRow: {
    name: 'Suspension Row',
    start: {
      head: [88, 129],
      torso: [
        [107, 145],
        [169, 210],
      ],
      leftArm: [
        [112, 150],
        [145, 117],
        [178, 83],
      ],
      rightArm: [
        [120, 157],
        [154, 124],
        [187, 90],
      ],
      leftLeg: [
        [166, 208],
        [207, 235],
        [245, 266],
      ],
      rightLeg: [
        [172, 213],
        [215, 242],
        [255, 272],
      ],
    },
    end: {
      head: [126, 108],
      torso: [
        [143, 125],
        [184, 203],
      ],
      leftArm: [
        [148, 130],
        [164, 108],
        [178, 83],
      ],
      rightArm: [
        [156, 137],
        [173, 115],
        [187, 90],
      ],
      leftLeg: [
        [181, 201],
        [215, 232],
        [245, 266],
      ],
      rightLeg: [
        [187, 206],
        [222, 239],
        [255, 272],
      ],
    },
  },
  rollout: {
    name: 'Ab Wheel Rollout',
    start: {
      head: [105, 123],
      torso: [
        [122, 142],
        [157, 205],
      ],
      leftArm: [
        [127, 148],
        [153, 180],
        [179, 213],
      ],
      rightArm: [
        [135, 153],
        [161, 184],
        [187, 216],
      ],
      leftLeg: [
        [155, 203],
        [130, 238],
        [106, 268],
      ],
      rightLeg: [
        [162, 208],
        [143, 243],
        [124, 272],
      ],
    },
    end: {
      head: [48, 204],
      torso: [
        [70, 208],
        [162, 222],
      ],
      leftArm: [
        [79, 210],
        [117, 225],
        [157, 243],
      ],
      rightArm: [
        [87, 215],
        [125, 231],
        [165, 247],
      ],
      leftLeg: [
        [160, 220],
        [137, 245],
        [106, 268],
      ],
      rightLeg: [
        [166, 226],
        [149, 250],
        [124, 272],
      ],
    },
    equipment: [
      {
        name: 'Wheel',
        start: [
          [171, 237],
          [189, 237],
        ],
        end: [
          [157, 252],
          [175, 252],
        ],
        width: 14,
      },
    ],
  },
};

const codeToMotion: Record<string, keyof typeof motions> = {
  PUSH_UP: 'push',
  GLUTE_BRIDGE: 'bridge',
  REVERSE_LUNGE: 'lunge',
  PLANK: 'plank',
  DEAD_BUG: 'deadBug',
  MOUNTAIN_CLIMBER: 'climber',
  DUMBBELL_ROW: 'oneArmRow',
  BARBELL_BENT_ROW: 'row',
  SHOULDER_PRESS: 'press',
  ASSISTED_PULL_UP: 'pullUp',
  HANGING_KNEE_RAISE: 'kneeRaise',
  BAND_PULL_APART: 'bandPull',
  BANDED_GLUTE_WALK: 'lateralWalk',
  BENCH_DIP: 'dip',
  BENCH_STEP_UP: 'benchStepUp',
  KETTLEBELL_GOBLET_SQUAT: 'gobletSquat',
  SMITH_MACHINE_SQUAT: 'smithSquat',
  PLYO_BOX_STEP_UP: 'boxStepUp',
  KETTLEBELL_DEADLIFT: 'hinge',
  BARBELL_ROMANIAN_DEADLIFT: 'hinge',
  MEDICINE_BALL_SLAM: 'slam',
  CABLE_CHEST_PRESS: 'chestPress',
  CABLE_LAT_PULLDOWN: 'pulldown',
  LEG_PRESS: 'legPress',
  STABILITY_BALL_LEG_CURL: 'legCurl',
  SUSPENSION_ROW: 'suspensionRow',
  AB_WHEEL_ROLLOUT: 'rollout',
};

const animations = Object.fromEntries(
  Object.entries(motions).map(([key, motion]) => [
    key,
    createAnimation(motion),
  ]),
) as Record<keyof typeof motions, ReturnType<typeof createAnimation>>;

export function stickFigureAnimationFor(exerciseCode: string) {
  const motionKey = codeToMotion[exerciseCode.toUpperCase()] ?? 'climber';
  return animations[motionKey];
}

export function stickFigureMotionNameFor(exerciseCode: string) {
  const motionKey = codeToMotion[exerciseCode.toUpperCase()] ?? 'climber';
  return motions[motionKey].name;
}
