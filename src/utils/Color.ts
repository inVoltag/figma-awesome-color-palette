import chroma from 'chroma-js'
import * as blinder from 'color-blind'
import { Hsluv } from 'hsluv'

import { HexModel } from '@a_ng_d/figmug-ui'
import { algorithmVersion } from '../config'
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
    this.algorithmVersion = data.algorithmVersion ?? algorithmVersion
    this.visionSimulationMode = data.visionSimulationMode
  }

  adjustHue = (hue: number): number => {
    if (hue + this.hueShifting < 0) return hue + this.hueShifting + 360
    if (hue + this.hueShifting > 360) return hue + this.hueShifting - 360
    return hue + this.hueShifting
  }

  adjustChroma = (chroma: number): number => {
    if (this.algorithmVersion === 'v1') return chroma
    if (this.algorithmVersion === 'v2')
      return Math.sin((this.lightness / 100) * Math.PI) * chroma
    if (this.algorithmVersion === 'v3') {
      const lightnessFactor = this.lightness / 100
      const sinComponent = Math.sin(lightnessFactor * Math.PI)
      const tanhComponent = Math.tanh(lightnessFactor * Math.PI)
      const weightedComponent = sinComponent * 0.5 + tanhComponent * 0.5
      const smoothedComponent = Math.pow(weightedComponent, 0.5) // Pour adoucir la variation
      return smoothedComponent * chroma
    }
    return chroma
  }

  lch = (): HexModel | [number, number, number] => {
    const lch = chroma(this.sourceColor).lch(),
      newColor = chroma
        .lch(
          this.lightness,
          this.adjustChroma(lch[1] * (this.chromaShifting / 100)),
          this.adjustHue(lch[2])
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
          this.adjustChroma(oklch[1] * (this.chromaShifting / 100)),
          this.adjustHue(oklch[2])
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
        this.adjustChroma(newLabA),
        this.adjustChroma(newLabB)
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
        this.adjustChroma(newLabA),
        this.adjustChroma(newLabB)
      )
      .rgb()

    if (this.render === 'HEX') return this.simulateColorBlindHex(newColor)
    return this.simulateColorBlindRgb(newColor)
  }

  hsl = (): HexModel | [number, number, number] => {
    const hsl = chroma(this.sourceColor).hsl(),
      newColor = chroma
        .hsl(
          this.adjustHue(hsl[0]),
          this.adjustChroma(hsl[1] * (this.chromaShifting / 100)),
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
    hsluv.hsluv_s = this.adjustChroma(
      hsluv.hsluv_s * (this.chromaShifting / 100)
    )
    hsluv.hsluv_h = this.adjustHue(hsluv.hsluv_h)

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
    const v3Color = this.algorithmVersion === 'v3' ? sourceColor : sourceColor
    const actions: ActionsList = {
      NONE: () => v3Color,
      PROTANOMALY: () =>
        chroma(blinder.protanomaly(chroma(v3Color).hex())).rgb(false),
      PROTANOPIA: () =>
        chroma(blinder.protanopia(chroma(v3Color).hex())).rgb(false),
      DEUTERANOMALY: () =>
        chroma(blinder.deuteranomaly(chroma(v3Color).hex())).rgb(false),
      DEUTERANOPIA: () =>
        chroma(blinder.deuteranopia(chroma(v3Color).hex())).rgb(false),
      TRITANOMALY: () =>
        chroma(blinder.tritanomaly(chroma(v3Color).hex())).rgb(false),
      TRITANOPIA: () =>
        chroma(blinder.tritanopia(chroma(v3Color).hex())).rgb(false),
      ACHROMATOMALY: () =>
        chroma(blinder.achromatomaly(chroma(v3Color).hex())).rgb(false),
      ACHROMATOPSIA: () =>
        chroma(blinder.achromatopsia(chroma(v3Color).hex())).rgb(false),
    }

    const result = actions[this.visionSimulationMode]?.()
    return result !== undefined ? result : [0, 0, 0]
  }

  simulateColorBlindHex = (sourceColor: [number, number, number]): HexModel => {
    const v3Color = this.algorithmVersion === 'v3' ? sourceColor : sourceColor
    const actions: ActionsList = {
      NONE: () => chroma(v3Color).hex(),
      PROTANOMALY: () => blinder.protanomaly(chroma(v3Color).hex()),
      PROTANOPIA: () => blinder.protanopia(chroma(v3Color).hex()),
      DEUTERANOMALY: () => blinder.deuteranomaly(chroma(v3Color).hex()),
      DEUTERANOPIA: () => blinder.deuteranopia(chroma(v3Color).hex()),
      TRITANOMALY: () => blinder.tritanomaly(chroma(v3Color).hex()),
      TRITANOPIA: () => blinder.tritanopia(chroma(v3Color).hex()),
      ACHROMATOMALY: () => blinder.achromatomaly(chroma(v3Color).hex()),
      ACHROMATOPSIA: () => blinder.achromatopsia(chroma(v3Color).hex()),
    }

    const result = actions[this.visionSimulationMode]?.()
    return result !== undefined ? result : '#000000'
  }

  toSRGB = (
    sourceColor: [number, number, number]
  ): [number, number, number] => {
    const linearRgb = sourceColor.map((value) => {
      const normalized = value / 255
      return Math.pow((normalized + 0.055) / 1.055, 2.4)
    }) as [number, number, number]

    // Calculate luminance
    const luminance =
      0.2126 * linearRgb[0] + 0.7152 * linearRgb[1] + 0.0722 * linearRgb[2]
    const targetLuminance = this.lightness / 100

    // Scale the linear RGB values to match the target luminance
    const scale = targetLuminance / luminance
    const adjustedLinearRgb = linearRgb.map((value) => value * scale) as [
      number,
      number,
      number,
    ]

    // Convert adjusted linear RGB back to sRGB
    const adjustedRgb = adjustedLinearRgb.map((value) => {
      return (1.055 * Math.pow(value, 1 / 2.4) - 0.055) * 255
    }) as [number, number, number]

    // Apply a soft adjustment to preserve saturation
    const finalRgb = adjustedRgb.map((value, index) => {
      const originalValue = sourceColor[index]
      return originalValue + (value - originalValue) * 0.5
    }) as [number, number, number]

    return finalRgb
  }
}
