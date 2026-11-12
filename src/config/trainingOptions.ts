export const equipmentGroups = [
  {
    label: 'Free weights',
    options: ['Dumbbells', 'Kettlebell', 'Barbell', 'Medicine ball'],
  },
  {
    label: 'Gym stations',
    options: [
      'Bench',
      'Pull-up bar',
      'Cable machine',
      'Smith machine',
      'Leg press machine',
    ],
  },
  {
    label: 'Functional training',
    options: [
      'Resistance bands',
      'Stability ball',
      'Suspension trainer',
      'Plyo box',
      'Ab wheel',
    ],
  },
] as const;

export const equipmentOptions = equipmentGroups.flatMap(group => group.options);
