import { HexModel } from '@a_ng_d/figmug-ui'

import { ThirdParty } from './app'
import { RgbModel, TextColorsThemeHexModel } from './models'

export interface SourceColorConfiguration {
  name: string
  rgb: RgbModel
  source: 'CANVAS' | 'REMOTE' | ThirdParty
  id: string
  isRemovable: boolean
  hueShifting?: number
  chromaShifting?: number
}

export interface PaletteConfiguration {
  name: string
  description: string
  preset: PresetConfiguration
  scale: ScaleConfiguration
  min: number | undefined
  max: number | undefined
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  view: ViewConfiguration
  textColorsTheme: TextColorsThemeHexModel
  algorithmVersion: AlgorithmVersionConfiguration
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
  id: string
}

export interface ScaleConfiguration {
  [key: string]: number
}

export type NamingConventionConfiguration = 'ONES' | 'TENS' | 'HUNDREDS'

export interface ColorConfiguration {
  name: string
  description: string
  rgb: {
    r: number
    g: number
    b: number
  }
  oklch: boolean
  hueShifting: number
  chromaShifting: number
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

export type AlgorithmVersionConfiguration = 'v1' | 'v2'

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

export interface MetaConfiguration {
  id: string
  dates: DatesConfiguration
  publicationStatus: PublicationConfiguration
  creatorIdentity: CreatorConfiguration
}
