import {
  PaletteConfiguration,
  PresetConfiguration,
} from '../types/configurations'

export const presets: Array<PresetConfiguration> = [
  {
    name: 'Material Design, 50-900 (Google)',
    scale: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    min: 24,
    max: 96,
    isDistributed: true,
    id: 'MATERIAL',
  },
  {
    name: 'Material 3, 0-100 (Google)',
    scale: [100, 99, 95, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0],
    min: 0,
    max: 100,
    isDistributed: false,
    id: 'MATERIAL_3',
  },
  {
    name: 'Tailwind, 50-950',
    scale: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    min: 16,
    max: 96,
    isDistributed: true,
    id: 'TAILWIND',
  },
  {
    name: 'Ant Design, 1-10',
    scale: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    min: 24,
    max: 96,
    isDistributed: true,
    id: 'ANT',
  },
  {
    name: 'ADS Foundations, 100-1000 (Atlassian)',
    scale: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
    min: 24,
    max: 96,
    isDistributed: true,
    id: 'ADS',
  },
  {
    name: 'ADS Foundations, Neutral 0-1100 (Atlassian)',
    scale: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100],
    min: 8,
    max: 100,
    isDistributed: true,
    id: 'ADS_NEUTRAL',
  },
  {
    name: 'Carbon, 10-100 (IBM)',
    scale: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    min: 24,
    max: 96,
    isDistributed: true,
    id: 'CARBON',
  },
  {
    name: 'Base, 50-700 (Uber)',
    scale: [50, 100, 200, 300, 400, 500, 600, 700],
    min: 24,
    max: 96,
    isDistributed: true,
    id: 'BASE',
  },
  {
    name: 'Custom',
    scale: [1, 2],
    min: 10,
    max: 90,
    isDistributed: true,
    id: 'CUSTOM',
  },
]

export const defaultPreset = presets[0]

export const palette: PaletteConfiguration = {
  name: '',
  description: '',
  min: undefined,
  max: undefined,
  preset: presets[0],
  scale: {},
  colorSpace: 'LCH',
  visionSimulationMode: 'NONE',
  view: 'PALETTE_WITH_PROPERTIES',
  textColorsTheme: {
    lightColor: '#FFFFFF',
    darkColor: '#000000',
  },
  algorithmVersion: 'v2',
}
