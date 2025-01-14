import { deepMap } from 'nanostores'
import { PaletteConfiguration } from 'src/types/configurations'
import { algorithmVersion } from '../config'
import { presets } from './presets'
import { lang, locals } from '../content/locals'

export const $palette = deepMap<PaletteConfiguration>({
  name: locals[lang].settings.global.name.default,
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
  algorithmVersion: algorithmVersion,
  textColorsTheme: {
    lightColor: '#FFFFFF',
    darkColor: '#000000',
  },
})
