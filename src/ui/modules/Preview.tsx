import chroma from 'chroma-js'
import * as blinder from 'color-blind'
import { Hsluv } from 'hsluv'
import { Component } from 'preact/compat'
import React from 'react'
import { APCAcontrast, sRGBtoY } from 'apca-w3'

import {
  ScaleConfiguration,
  SourceColorConfiguration,
} from '../../types/configurations'
import { RgbModel } from '../../types/models'
import { palette } from '../../utils/palettePackage'
import { HexModel, texts } from '@a_ng_d/figmug-ui'
import { Language } from '../../types/app'

interface PreviewProps {
  sourceColors: Array<SourceColorConfiguration> | []
  scale: ScaleConfiguration
  lang: Language
}

export default class Preview extends Component<PreviewProps> {
  static defaultProps = {
    sourceColors: [],
  }

  // Direct actions
  getColor = (rgb: RgbModel, scale: number): HexModel => {
    scale =
      palette.colorSpace.includes('OK') || palette.colorSpace === 'HSL'
        ? scale / 100
        : scale

    if (palette.colorSpace === 'HSLUV')
      return this.setVisionSimulation(this.setHsluv(rgb, scale))
    else
      return this.setVisionSimulation(
        chroma(Object.values(rgb).map((value) => value * 255))
          .set(`${palette.colorSpace.toLowerCase()}.l`, scale)
          .hex()
      )
  }

  setHsluv = (rgb: RgbModel, scale: number): HexModel => {
    const hsluv = new Hsluv()

    hsluv.rgb_r = rgb.r
    hsluv.rgb_g = rgb.g
    hsluv.rgb_b = rgb.b

    hsluv.rgbToHsluv()

    hsluv.hsluv_l = scale

    if (Number.isNaN(hsluv.hsluv_s)) hsluv.hsluv_s = 0
    if (Number.isNaN(hsluv.hsluv_h)) hsluv.hsluv_h = 0

    hsluv.hsluvToHex()

    return hsluv.hex
  }

  setVisionSimulation = (hex: HexModel): HexModel => {
    if (palette.visionSimulationMode === 'PROTANOMALY')
      return blinder.protanomaly(hex)
    if (palette.visionSimulationMode === 'PROTANOPIA')
      return blinder.protanopia(hex)
    if (palette.visionSimulationMode === 'DEUTERANOMALY')
      return blinder.deuteranomaly(hex)
    if (palette.visionSimulationMode === 'DEUTERANOPIA')
      return blinder.deuteranopia(hex)
    if (palette.visionSimulationMode === 'TRITANOMALY')
      return blinder.tritanomaly(hex)
    if (palette.visionSimulationMode === 'TRITANOPIA')
      return blinder.tritanopia(hex)
    if (palette.visionSimulationMode === 'ACHROMATOMALY')
      return blinder.achromatomaly(hex)
    if (palette.visionSimulationMode === 'ACHROMATOPSIA')
      return blinder.achromatopsia(hex)
    return hex
  }

  getWCAGScore = (background: HexModel, text: HexModel): number => {
    return chroma.contrast(background, text)
  }

  getAPCAContrast = (background: HexModel, textColor: HexModel) => {
    return Math.abs(
      APCAcontrast(
        sRGBtoY(chroma(background).rgb()),
        sRGBtoY(chroma(textColor).rgb())
      )
    )
  }

  // Templates
  stopTag = ({ stop }: { stop: string }) => (
    <div className="preview__tag">
      <span className={`preview__tag__score type ${texts['type--truncated']}`}>
        {stop}
      </span>
    </div>
  )

  wcagScoreTag = ({ color, score }: { color: HexModel; score: number }) => (
    <div className="preview__tag">
      <div
        className="preview__tag__color"
        style={{
          backgroundColor: color,
        }}
      />
      <span className={`preview__tag__score type ${texts['type--truncated']}`}>
        {`${score.toFixed(1)} : 1`}
      </span>
      <span className={'preview__tag__obs type'}>
        {score < 4.5 ? '✘' : '✔'}
      </span>
    </div>
  )

  apcaScoreTag = ({ color, score }: { color: HexModel; score: number }) => (
    <div className="preview__tag">
      <div
        className="preview__tag__color"
        style={{
          backgroundColor: color,
        }}
      />
      <span
        className={`preview__tag__score type ${texts['type--truncated']}`}
      >{`Lc ${score.toFixed(1)}`}</span>
      <span className={'preview__tag__obs type'}>
        {score < 15 ? '✘' : '✔'}
      </span>
    </div>
  )

  // Render
  render() {
    if (!this.props.sourceColors.length) return null
    return (
      <div className="preview">
        <div className="preview__row">
          {Object.keys(this.props.scale)
            .reverse()
            .map((scale, index) => {
              return (
                <div
                  className="preview__cell"
                  key={index}
                >
                  <this.stopTag stop={scale.replace('lightness-', '')} />
                </div>
              )
            })}
        </div>
        {this.props.sourceColors.map((sourceColor, index) => (
          <div
            className="preview__row"
            key={index}
          >
            {Object.values(this.props.scale)
              .reverse()
              .map((scale, index) => {
                const background = this.getColor(sourceColor.rgb, scale)
                const darkText = palette.textColorsTheme.darkColor
                const lightText = palette.textColorsTheme.lightColor

                return (
                  <div
                    className="preview__cell"
                    key={index}
                    style={{
                      backgroundColor: background,
                    }}
                  >
                    <this.wcagScoreTag
                      color={lightText}
                      score={this.getWCAGScore(background, lightText)}
                    />
                    <this.apcaScoreTag
                      color={lightText}
                      score={this.getAPCAContrast(background, lightText)}
                    />
                    <this.wcagScoreTag
                      color={darkText}
                      score={this.getWCAGScore(background, darkText)}
                    />
                    <this.apcaScoreTag
                      color={darkText}
                      score={this.getAPCAContrast(background, darkText)}
                    />
                  </div>
                )
              })}
          </div>
        ))}
      </div>
    )
  }
}
