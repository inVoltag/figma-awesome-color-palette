import * as blinder from 'color-blind'
import chroma from 'chroma-js'
import { Hsluv } from 'hsluv'
import React from 'react'

import { SourceColorConfiguration } from '../../types/configurations'
import { RgbModel } from '../../types/models'
import { palette } from '../../utils/palettePackage'

interface PreviewProps {
  sourceColors: Array<SourceColorConfiguration> | []
}

export default class Preview extends React.Component<PreviewProps> {
  static defaultProps = {
    sourceColors: [],
  }

  // Direct actions
  setColor = (rgb: RgbModel, scale: number) => {
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

  setHsluv = (rgb: RgbModel, scale: number) => {
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

  setVisionSimulation = (hex: string) => {
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

  // Render
  render() {
    return (
      <div className="preview">
        {this.props.sourceColors.map((sourceColor, index) => (
          <div
            className="preview__row"
            key={index}
          >
            {Object.values(palette.scale)
              .reverse()
              .map((scale, index) => (
                <div
                  className="preview__cell"
                  key={index}
                  style={{
                    backgroundColor: this.setColor(sourceColor.rgb, scale),
                  }}
                ></div>
              ))}
          </div>
        ))}
      </div>
    )
  }
}
