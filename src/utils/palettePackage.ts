interface Preset {
  name: string,
  scale: Array<number>,
  min: number,
  max: number
}

interface Scale {
  [key: string]: string
}

interface Palette {
  name: string,
  scale: Scale,
  min: number,
  max: number,
  captions: boolean,
  preset: {}
}

export const palette: Palette = {
  name: '',
  scale: {},
  min: null,
  max: null,
  captions: true,
  preset: {}
};

export const presets = {
  material: {
    name: 'Material Design 50-900 (Google) ',
    scale: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    min: 24,
    max: 96
  } as Preset,
  ant: {
    name: 'Ant Design 1-10',
    scale: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    min: 24,
    max: 96
  } as Preset,
  atlassian: {
    name: 'ADS Foundations 50-500 (Atlassian)',
    scale: [50, 75, 100, 200, 300, 400, 500],
    min: 24,
    max: 96
  } as Preset,
  atlassianNeutral: {
    name: 'ADS Foundations, Neutral 50-500 (Atlassian)',
    scale: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    min: 8,
    max: 100
  } as Preset,
  carbon: {
    name: 'Carbon 10-100 (IBM)',
    scale: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    min: 24,
    max: 96
  } as Preset,
  base: {
    name: 'Base 50-700 (Uber)',
    scale: [50, 100, 200, 300, 400, 500, 600, 700],
    min: 24,
    max: 96
  } as Preset,
  custom: {
    name: 'Custom',
    scale: [1, 2],
    min: 10,
    max: 90
  } as Preset
}
