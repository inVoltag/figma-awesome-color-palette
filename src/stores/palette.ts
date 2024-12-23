import { deepMap } from 'nanostores'
import { PaletteConfiguration } from 'src/types/configurations'
import { algorithmVersion } from '../config'
import { presets } from '../utils/palettePackage'

export const $palette = deepMap<PaletteConfiguration>({
  name: '',
  description: '',
  min: 0,
  max: 100,
  preset: presets[0],
  scale: {},
  shift: {
    chroma: 100,
  },
  areSourceColorsLocked: false,
  colorSpace: 'LCH',
  visionSimulationMode: 'NONE',
  view: 'PALETTE_WITH_PROPERTIES',
  textColorsTheme: {
    lightColor: '#FFFFFF',
    darkColor: '#000000',
  },
  algorithmVersion: algorithmVersion,
})
