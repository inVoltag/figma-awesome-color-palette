import { HexModel, RgbModel } from '@a_ng_d/figmug-ui'

import { ThirdParty } from './app'
import { TextColorsThemeHexModel } from './models'

export interface SourceColorConfiguration {
  name: string
  rgb: RgbModel
  source: 'CANVAS' | 'REMOTE' | ThirdParty
  id: string
  isRemovable: boolean
  description?: string
  hue?: {
    shift: number
    isLocked: boolean
  }
  chroma?: {
    shift: number
    isLocked: boolean
  }
  hueShifting?: number
  chromaShifting?: number
}

export interface PaletteConfiguration {
  [key: string]: string | number | boolean | object | undefined
  name: string
  description: string
  min?: number
  max?: number
  preset: PresetConfiguration
  scale: ScaleConfiguration
  shift: ShiftConfiguration
  areSourceColorsLocked: LockedSourceColorsConfiguration
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  view: ViewConfiguration
  algorithmVersion: AlgorithmVersionConfiguration
  textColorsTheme: TextColorsThemeHexModel
}

export interface ExtractOfPaletteConfiguration {
  id: string
  name: string
  preset: string
  colors: Array<ColorConfiguration>
  themes: Array<ThemeConfiguration>
  screenshot: Uint8Array | null
  devStatus: string | null
}

export interface PresetConfiguration {
  name: string
  scale: Array<number>
  min: number
  max: number
  isDistributed: boolean
  family?: string
  id: string
}

export type ScaleConfiguration = Record<string, number>

export interface ShiftConfiguration {
  chroma: number
}

export type LockedSourceColorsConfiguration = boolean

export interface ColorConfiguration {
  name: string
  description: string
  rgb: RgbModel
  hue: {
    shift: number
    isLocked: boolean
  }
  chroma: {
    shift: number
    isLocked: boolean
  }
  hueShifting?: number
  chromaShifting?: number
  id: string
}

export interface ThemeConfiguration {
  name: string
  description: string
  scale: ScaleConfiguration
  paletteBackground: HexModel
  isEnabled: boolean
  id: string
  type: 'default theme' | 'custom theme'
}

export interface ExportConfiguration {
  format: 'JSON' | 'CSS' | 'TAILWIND' | 'SWIFT' | 'KT' | 'XML' | 'CSV'
  context:
    | 'TOKENS_GLOBAL'
    | 'TOKENS_AMZN_STYLE_DICTIONARY'
    | 'TOKENS_TOKENS_STUDIO'
    | 'CSS'
    | 'TAILWIND'
    | 'APPLE_SWIFTUI'
    | 'APPLE_UIKIT'
    | 'ANDROID_COMPOSE'
    | 'ANDROID_XML'
    | 'CSV'
  label: string
  colorSpace: ColorSpaceConfiguration
  mimeType:
    | 'application/json'
    | 'text/css'
    | 'text/javascript'
    | 'text/swift'
    | 'text/x-kotlin'
    | 'text/xml'
    | 'text/csv'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}

export type ColorSpaceConfiguration =
  | 'LCH'
  | 'OKLCH'
  | 'LAB'
  | 'OKLAB'
  | 'HSL'
  | 'HSLUV'
  | 'RGB'
  | 'HEX'
  | 'P3'

export type VisionSimulationModeConfiguration =
  | 'NONE'
  | 'PROTANOMALY'
  | 'PROTANOPIA'
  | 'DEUTERANOMALY'
  | 'DEUTERANOPIA'
  | 'TRITANOMALY'
  | 'TRITANOPIA'
  | 'ACHROMATOMALY'
  | 'ACHROMATOPSIA'

export type ViewConfiguration =
  | 'PALETTE_WITH_PROPERTIES'
  | 'PALETTE'
  | 'SHEET'
  | 'SHEET_SAFE_MODE'

export type AlgorithmVersionConfiguration = 'v1' | 'v2' | 'v3'

export interface DatesConfiguration {
  createdAt: Date | string
  updatedAt: Date | string
  publishedAt: Date | string
}

export interface PublicationConfiguration {
  isPublished: boolean
  isShared: boolean
}

export interface CreatorConfiguration {
  creatorFullName: string
  creatorAvatar: string
  creatorId: string
}

export interface UserConfiguration {
  id: string
  fullName: string
  avatar: string
}

export interface MetaConfiguration {
  id: string
  dates: DatesConfiguration
  publicationStatus: PublicationConfiguration
  creatorIdentity: CreatorConfiguration
}
