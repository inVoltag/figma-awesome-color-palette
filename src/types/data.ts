import { HexModel } from '@a_ng_d/figmug-ui'

import {
  ColorConfiguration,
  PresetConfiguration,
  ThemeConfiguration,
} from './configurations'

export interface PaletteData {
  name: string
  description: string
  themes: Array<PaletteDataThemeItem>
  collectionId: string
  type: 'palette'
}

export interface PaletteDataThemeItem {
  name: string
  description: string
  colors: Array<PaletteDataColorItem>
  modeId: string
  id: string
  type: 'default theme' | 'custom theme'
}

export interface PaletteDataColorItem {
  name: string
  description: string
  shades: Array<PaletteDataShadeItem>
  id: string
  type: 'color'
}

export interface PaletteDataShadeItem {
  name: string
  description: string
  hex: HexModel
  rgb: [number, number, number]
  gl: [number, number, number, number]
  lch: [number, number, number]
  oklch: [number, number, number]
  lab: [number, number, number]
  oklab: [number, number, number]
  hsl: [number, number, number]
  hsluv: [number, number, number]
  variableId: string
  styleId: string
  type: 'source color' | 'color shade'
}

export interface ColourLovers {
  apiUrl: string
  badgeUrl: string
  colors: Array<HexModel>
  dateCreated: Date | string
  description: string
  id: number
  imageUrl: string
  numComments: number
  numHearts: number
  numViews: number
  numVotes: number
  rank: number
  title: string
  url: string
  userName: string
}

export interface ExternalPalettes {
  palette_id: string
  screenshot: string
  name: string
  preset: PresetConfiguration
  colors: Array<ColorConfiguration>
  themes: Array<ThemeConfiguration>
  creator_avatar: string
  creator_full_name: string
  creator_id: string
  is_shared: boolean
}
