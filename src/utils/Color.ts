import chroma from 'chroma-js'
import * as blinder from 'color-blind'
import { Hsluv } from 'hsluv'

import { HexModel } from '@a_ng_d/figmug-ui'
import {
  AlgorithmVersionConfiguration,
  VisionSimulationModeConfiguration,
} from '../types/configurations'
import { ActionsList } from '../types/models'

export default class Color {
  private render: 'HEX' | 'RGB'
  private sourceColor: [number, number, number]
  private lightness: number
  private hueShifting: number
  private chromaShifting: number
  private algorithmVersion: AlgorithmVersionConfiguration
  private visionSimulationMode: VisionSimulationModeConfiguration

  constructor(data: {
    render?: 'HEX' | 'RGB'
    sourceColor?: [number, number, number]
    lightness?: number
    hueShifting?: number
    chromaShifting?: number
    algorithmVersion?: AlgorithmVersionConfiguration
    visionSimulationMode: VisionSimulationModeConfiguration
  }) {
    this.render = data.render ?? 'HEX'
    this.sourceColor = data.sourceColor ?? [0, 0, 0]
    this.lightness = data.lightness ?? 100
    this.hueShifting = data.hueShifting ?? 0
    this.chromaShifting = data.chromaShifting ?? 100
    this.algorithmVersion = data.algorithmVersion ?? 'v2'
    this.visionSimulationMode = data.visionSimulationMode
  }

  lch = (): HexModel | [number, number, number] => {
    const lch = chroma(this.sourceColor).lch(),
      newColor = chroma
        .lch(
          this.lightness,
          this.algorithmVersion === 'v2'
            ? Math.sin((this.lightness / 100) * Math.PI) *
                lch[1] *
                (this.chromaShifting / 100)
            : lch[1] * (this.chromaShifting / 100),
          lch[2] + this.hueShifting < 0
            ? 0
            : lch[2] + this.hueShifting > 360
              ? 360
              : lch[2] + this.hueShifting
        )
        .rgb()

    if (this.render === 'HEX') return this.simulateColorBlindHex(newColor)
    return this.simulateColorBlindRgb(newColor)
  }

  oklch = (): HexModel | [number, number, number] => {
    const oklch = chroma(this.sourceColor).oklch(),
      newColor = chroma
        .oklch(
          this.lightness / 100,
          this.algorithmVersion === 'v2'
            ? Math.sin((this.lightness / 100) * Math.PI) *
                oklch[1] *
                (this.chromaShifting / 100)
            : oklch[1] * (this.chromaShifting / 100),
          oklch[2] + this.hueShifting < 0
            ? 0
            : oklch[2] + this.hueShifting > 360
              ? 360
              : oklch[2] + this.hueShifting
        )
        .rgb()

    if (this.render === 'HEX') return this.simulateColorBlindHex(newColor)
    return this.simulateColorBlindRgb(newColor)
  }

  lab = (): HexModel | [number, number, number] => {
    const labA = chroma(this.sourceColor).get('lab.a'),
      labB = chroma(this.sourceColor).get('lab.b'),
      chr = Math.sqrt(labA ** 2 + labB ** 2) * (this.chromaShifting / 100)
    let h = Math.atan(labB / labA) + this.hueShifting * (Math.PI / 180)

    if (h > Math.PI) h = Math.PI
    else if (h < -Math.PI) h = Math.PI

    let newLabA = chr * Math.cos(h),
      newLabB = chr * Math.sin(h)

    if (Math.sign(labA) === -1 && Math.sign(labB) === 1) {
      newLabA *= -1
      newLabB *= -1
    }
    if (Math.sign(labA) === -1 && Math.sign(labB) === -1) {
      newLabA *= -1
      newLabB *= -1
    }

    const newColor = chroma
      .lab(
        this.lightness,
        this.algorithmVersion === 'v2'
          ? Math.sin((this.lightness / 100) * Math.PI) * newLabA
          : newLabA,
        this.algorithmVersion === 'v2'
          ? Math.sin((this.lightness / 100) * Math.PI) * newLabB
          : newLabB
      )
      .rgb()

    if (this.render === 'HEX') return this.simulateColorBlindHex(newColor)
    return this.simulateColorBlindRgb(newColor)
  }

  oklab = (): HexModel | [number, number, number] => {
    const labA = chroma(this.sourceColor).get('oklab.a'),
      labB = chroma(this.sourceColor).get('oklab.b'),
      chr = Math.sqrt(labA ** 2 + labB ** 2) * (this.chromaShifting / 100)
    let h = Math.atan(labB / labA) + this.hueShifting * (Math.PI / 180)

    if (h > Math.PI) h = Math.PI
    else if (h < -Math.PI) h = Math.PI

    let newLabA = chr * Math.cos(h),
      newLabB = chr * Math.sin(h)

    if (Math.sign(labA) === -1 && Math.sign(labB) === 1) {
      newLabA *= -1
      newLabB *= -1
    }
    if (Math.sign(labA) === -1 && Math.sign(labB) === -1) {
      newLabA *= -1
      newLabB *= -1
    }

    if (Number.isNaN(newLabA)) newLabA = 0
    if (Number.isNaN(newLabB)) newLabB = 0

    const newColor = chroma
      .oklab(
        this.lightness / 100,
        this.algorithmVersion === 'v2'
          ? Math.sin((this.lightness / 100) * Math.PI) * newLabA
          : newLabA,
        this.algorithmVersion === 'v2'
          ? Math.sin((this.lightness / 100) * Math.PI) * newLabB
          : newLabB
      )
      .rgb()

    if (this.render === 'HEX') return this.simulateColorBlindHex(newColor)
    return this.simulateColorBlindRgb(newColor)
  }

  hsl = (): HexModel | [number, number, number] => {
    const hsl = chroma(this.sourceColor).hsl(),
      newColor = chroma
        .hsl(
          hsl[0] + this.hueShifting < 0
            ? 0
            : hsl[0] + this.hueShifting > 360
              ? 360
              : hsl[0] + this.hueShifting,
          this.algorithmVersion === 'v2'
            ? Math.sin((this.lightness / 100) * Math.PI) *
                hsl[1] *
                (this.chromaShifting / 100)
            : hsl[1] * (this.chromaShifting / 100),
          this.lightness / 100
        )
        .rgb()

    if (this.render === 'HEX') return this.simulateColorBlindHex(newColor)
    return this.simulateColorBlindRgb(newColor)
  }

  hsluv = (): HexModel | [number, number, number] => {
    const hsluv = new Hsluv()

    hsluv.rgb_r = this.sourceColor[0] / 255
    hsluv.rgb_g = this.sourceColor[1] / 255
    hsluv.rgb_b = this.sourceColor[2] / 255

    hsluv.rgbToHsluv()

    hsluv.hsluv_l = this.lightness
    hsluv.hsluv_s =
      this.algorithmVersion === 'v2'
        ? Math.sin((this.lightness / 100) * Math.PI) *
          hsluv.hsluv_s *
          (this.chromaShifting / 100)
        : hsluv.hsluv_s * (this.chromaShifting / 100)
    hsluv.hsluv_h =
      hsluv.hsluv_h + this.hueShifting < 0
        ? 0
        : hsluv.hsluv_h + this.hueShifting > 360
          ? 360
          : hsluv.hsluv_h + this.hueShifting

    if (Number.isNaN(hsluv.hsluv_s)) hsluv.hsluv_s = 0
    if (Number.isNaN(hsluv.hsluv_h)) hsluv.hsluv_h = 0

    hsluv.hsluvToRgb()

    const newColor: [number, number, number] = [
      hsluv.rgb_r * 255,
      hsluv.rgb_g * 255,
      hsluv.rgb_b * 255,
    ]

    if (this.render === 'HEX') return this.simulateColorBlindHex(newColor)
    return this.simulateColorBlindRgb(newColor)
  }

  getHsluv = (): [number, number, number] => {
    const hsluv = new Hsluv()
    hsluv.rgb_r = this.sourceColor[0] / 255
    hsluv.rgb_g = this.sourceColor[1] / 255
    hsluv.rgb_b = this.sourceColor[2] / 255
    hsluv.rgbToHsluv()

    return [hsluv.hsluv_h, hsluv.hsluv_s, hsluv.hsluv_l]
  }

  simulateColorBlindRgb = (
    sourceColor: [number, number, number]
  ): [number, number, number] => {
    const actions: ActionsList = {
      NONE: () => sourceColor,
      PROTANOMALY: () =>
        chroma(blinder.protanomaly(chroma(sourceColor).hex())).rgb(false),
      PROTANOPIA: () =>
        chroma(blinder.protanopia(chroma(sourceColor).hex())).rgb(false),
      DEUTERANOMALY: () =>
        chroma(blinder.deuteranomaly(chroma(sourceColor).hex())).rgb(false),
      DEUTERANOPIA: () =>
        chroma(blinder.deuteranopia(chroma(sourceColor).hex())).rgb(false),
      TRITANOMALY: () =>
        chroma(blinder.tritanomaly(chroma(sourceColor).hex())).rgb(false),
      TRITANOPIA: () =>
        chroma(blinder.tritanopia(chroma(sourceColor).hex())).rgb(false),
      ACHROMATOMALY: () =>
        chroma(blinder.achromatomaly(chroma(sourceColor).hex())).rgb(false),
      ACHROMATOPSIA: () =>
        chroma(blinder.achromatopsia(chroma(sourceColor).hex())).rgb(false),
    }

    const result = actions[this.visionSimulationMode]?.()
    return result !== undefined ? result : [0, 0, 0]
  }

  simulateColorBlindHex = (sourceColor: [number, number, number]): HexModel => {
    const actions: ActionsList = {
      NONE: () => chroma(sourceColor).hex(),
      PROTANOMALY: () => blinder.protanomaly(chroma(sourceColor).hex()),
      PROTANOPIA: () => blinder.protanopia(chroma(sourceColor).hex()),
      DEUTERANOMALY: () => blinder.deuteranomaly(chroma(sourceColor).hex()),
      DEUTERANOPIA: () => blinder.deuteranopia(chroma(sourceColor).hex()),
      TRITANOMALY: () => blinder.tritanomaly(chroma(sourceColor).hex()),
      TRITANOPIA: () => blinder.tritanopia(chroma(sourceColor).hex()),
      ACHROMATOMALY: () => blinder.achromatomaly(chroma(sourceColor).hex()),
      ACHROMATOPSIA: () => blinder.achromatopsia(chroma(sourceColor).hex()),
    }

    const result = actions[this.visionSimulationMode]?.()
    return result !== undefined ? result : '#000000'
  }
}
