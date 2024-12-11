import { HexModel } from '@a_ng_d/figmug-ui'
import { APCAcontrast, fontLookupAPCA, sRGBtoY } from 'apca-w3'
import chroma from 'chroma-js'
import { Hsluv } from 'hsluv'

import { lang, locals } from '../content/locals'
import { VisionSimulationModeConfiguration } from '../types/configurations'

export default class Contrast {
  backgroundColor: [number, number, number]
  textColor: HexModel
  visionSimulationMode: VisionSimulationModeConfiguration

  constructor(data: {
    backgroundColor: [number, number, number]
    textColor: HexModel
    visionSimulationMode: VisionSimulationModeConfiguration
  }) {
    this.backgroundColor = data.backgroundColor
    this.textColor = data.textColor
    this.visionSimulationMode = data.visionSimulationMode
  }

  getWCAGContrast = () => {
    return chroma.contrast(chroma(this.backgroundColor).hex(), this.textColor)
  }

  getAPCAContrast = () => {
    return Math.abs(
      APCAcontrast(
        sRGBtoY(chroma(this.textColor).rgb()),
        sRGBtoY(this.backgroundColor)
      )
    )
  }

  getWCAGScore = () => {
    return this.getWCAGContrast() < 4.5
      ? 'A'
      : this.getWCAGContrast() >= 4.5 && this.getWCAGContrast() < 7
        ? 'AA'
        : 'AAA'
  }

  getScoreColor = () => {
    if (
      this.getWCAGScore() !== 'A' &&
      this.getWCAGScore() !== locals[lang].paletteProperties.avoid
    )
      return {
        r: 0.5294117647,
        g: 0.8156862745,
        b: 0.6941176471,
      }
    else {
      return {
        r: 0.8274509804,
        g: 0.7019607843,
        b: 0.7803921569,
      }
    }
  }

  getMinFontSizes = () => {
    return fontLookupAPCA(this.getAPCAContrast())
  }

  getRecommendedUsage = () => {
    if (this.getAPCAContrast() >= 90)
      return locals[lang].paletteProperties.fluentText
    if (this.getAPCAContrast() >= 75 && this.getAPCAContrast() < 90)
      return locals[lang].paletteProperties.contentText
    if (this.getAPCAContrast() >= 60 && this.getAPCAContrast() < 75)
      return locals[lang].paletteProperties.bodyText
    if (this.getAPCAContrast() >= 45 && this.getAPCAContrast() < 60)
      return locals[lang].paletteProperties.headlines
    if (this.getAPCAContrast() >= 30 && this.getAPCAContrast() < 45)
      return locals[lang].paletteProperties.spotText
    if (this.getAPCAContrast() >= 15 && this.getAPCAContrast() < 30)
      return locals[lang].paletteProperties.nonText
    if (this.getAPCAContrast() < 15) return locals[lang].paletteProperties.avoid

    return locals[lang].paletteProperties.unknown
  }

  getHsluv = () => {
    const hsluv = new Hsluv()
    hsluv.rgb_r = this.backgroundColor[0] / 255
    hsluv.rgb_g = this.backgroundColor[1] / 255
    hsluv.rgb_b = this.backgroundColor[2] / 255
    hsluv.rgbToHsluv()

    return [hsluv.hsluv_h, hsluv.hsluv_s, hsluv.hsluv_l]
  }
}
