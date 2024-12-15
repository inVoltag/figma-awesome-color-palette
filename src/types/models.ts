import { HexModel } from '@a_ng_d/figmug-ui'

export interface RgbModel {
  r: number
  g: number
  b: number
}

export interface TextColorsThemeHexModel {
  lightColor: HexModel
  darkColor: HexModel
}

export interface TextColorsThemeGLModel {
  lightColor: Array<number>
  darkColor: Array<number>
}

export interface ActionsList {
  [action: string]: () => void
}

export interface DispatchProcess {
  time: number
  on: {
    active: boolean
    blocked: boolean
    interval: string
    send: () => void
    stop: () => void
    status: boolean
  }
}
