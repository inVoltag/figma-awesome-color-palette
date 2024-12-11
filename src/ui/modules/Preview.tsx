import chroma from 'chroma-js'
import * as blinder from 'color-blind'
import { Hsluv } from 'hsluv'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { APCAcontrast, sRGBtoY } from 'apca-w3'

import {
  ColorConfiguration,
  ScaleConfiguration,
  SourceColorConfiguration,
} from '../../types/configurations'
import { ActionsList, RgbModel } from '../../types/models'
import { palette } from '../../utils/palettePackage'
import { Bar, HexModel, layouts, Select, texts } from '@a_ng_d/figmug-ui'
import { Language, PlanStatus } from '../../types/app'
import Feature from '../components/Feature'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import features from '../../config'
import { locals } from '../../content/locals'

interface PreviewProps {
  colors: Array<SourceColorConfiguration> | Array<ColorConfiguration> | []
  scale: ScaleConfiguration
  planStatus: PlanStatus
  lang: Language
}

interface PreviewStates {
  isLoaded: boolean
  isWCAGDisplayed: boolean
  isAPCADisplayed: boolean
}

export default class Preview extends PureComponent<
  PreviewProps,
  PreviewStates
> {
  static features = (planStatus: PlanStatus) => ({
    PREVIEW_WCAG: new FeatureStatus({
      features: features,
      featureName: 'PREVIEW_WCAG',
      planStatus: planStatus,
    }),
    PREVIEW_APCA: new FeatureStatus({
      features: features,
      featureName: 'PREVIEW_APCA',
      planStatus: planStatus,
    }),
  })

  static defaultProps = {
    sourceColors: [],
    scale: {},
  }

  constructor(props: PreviewProps) {
    super(props)
    this.state = {
      isLoaded: false,
      isWCAGDisplayed: true,
      isAPCADisplayed: true,
    }
  }

  // Lifecycle
  componentDidMount = (): void => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'GET_ITEMS',
          items: ['is_wcag_displayed', 'is_apca_displayed'],
        },
      },
      '*'
    )
    window.addEventListener('message', this.handleMessage)
  }

  componentWillUnmount = (): void => {
    window.removeEventListener('message', this.handleMessage)
  }

  // Handlers
  handleMessage = (e: MessageEvent) => {
    const displayWCAGScore = () => {
      if (e.data.pluginMessage.value === undefined)
        parent.postMessage(
          {
            pluginMessage: {
              type: 'SET_ITEMS',
              items: [
                {
                  key: 'is_wcag_displayed',
                  value: true,
                },
              ],
            },
          },
          '*'
        )
      else
        this.setState({
          isWCAGDisplayed: e.data.pluginMessage.value,
          isLoaded: true,
        })
    }

    const displayAPCAScore = () => {
      if (e.data.pluginMessage.value === undefined)
        parent.postMessage(
          {
            pluginMessage: {
              type: 'SET_ITEMS',
              items: [
                {
                  key: 'is_apca_displayed',
                  value: true,
                },
              ],
            },
          },
          '*'
        )
      else
        this.setState({
          isAPCADisplayed: e.data.pluginMessage.value,
          isLoaded: true,
        })
    }

    const actions: ActionsList = {
      GET_ITEM_IS_WCAG_DISPLAYED: () => displayWCAGScore(),
      GET_ITEM_IS_APCA_DISPLAYED: () => displayAPCAScore(),
      DEFAULT: () => null,
    }

    return actions[e.data.pluginMessage?.type ?? 'DEFAULT']?.()
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
    if (!this.props.colors.length || !this.state.isLoaded) return null
    return (
      <div className="preview">
        <Bar
          leftPartSlot={
            <div className={layouts['snackbar--tight']}>
              <Feature
                isActive={Preview.features(
                  this.props.planStatus
                ).PREVIEW_WCAG.isActive()}
              >
                <Select
                  id="enable-wcag-score"
                  type="SWITCH_BUTTON"
                  name="enable-wcag-score"
                  label={locals[this.props.lang].preview.wcag.label}
                  isChecked={this.state.isWCAGDisplayed}
                  isBlocked={Preview.features(
                    this.props.planStatus
                  ).PREVIEW_WCAG.isBlocked()}
                  isNew={Preview.features(
                    this.props.planStatus
                  ).PREVIEW_WCAG.isNew()}
                  onChange={() => {
                    this.setState({
                      isWCAGDisplayed: !this.state.isWCAGDisplayed,
                    })
                    parent.postMessage(
                      {
                        pluginMessage: {
                          type: 'SET_ITEMS',
                          items: [
                            {
                              key: 'is_wcag_displayed',
                              value: !this.state.isWCAGDisplayed,
                            },
                          ],
                        },
                      },
                      '*'
                    )
                  }}
                />
              </Feature>
              <Feature
                isActive={Preview.features(
                  this.props.planStatus
                ).PREVIEW_APCA.isActive()}
              >
                <Select
                  id="enable-apca-score"
                  type="SWITCH_BUTTON"
                  name="enable-apca-score"
                  label={locals[this.props.lang].preview.apca.label}
                  isChecked={this.state.isAPCADisplayed}
                  isBlocked={Preview.features(
                    this.props.planStatus
                  ).PREVIEW_APCA.isBlocked()}
                  isNew={Preview.features(
                    this.props.planStatus
                  ).PREVIEW_APCA.isNew()}
                  onChange={() => {
                    this.setState({
                      isAPCADisplayed: !this.state.isAPCADisplayed,
                    })
                    parent.postMessage(
                      {
                        pluginMessage: {
                          type: 'SET_ITEMS',
                          items: [
                            {
                              key: 'is_apca_displayed',
                              value: !this.state.isAPCADisplayed,
                            },
                          ],
                        },
                      },
                      '*'
                    )
                  }}
                />
              </Feature>
            </div>
          }
          border={['BOTTOM']}
        />
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
        {this.props.colors.map((color, index) => (
          <div
            className="preview__row"
            key={index}
          >
            {Object.values(this.props.scale)
              .reverse()
              .map((scale, index) => {
                const background = this.getColor(color.rgb, scale)
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
                    {this.state.isWCAGDisplayed && (
                      <this.wcagScoreTag
                        color={lightText}
                        score={this.getWCAGScore(background, lightText)}
                      />
                    )}
                    {this.state.isAPCADisplayed && (
                      <this.apcaScoreTag
                        color={lightText}
                        score={this.getAPCAContrast(background, lightText)}
                      />
                    )}
                    {this.state.isWCAGDisplayed && (
                      <this.wcagScoreTag
                        color={darkText}
                        score={this.getWCAGScore(background, darkText)}
                      />
                    )}
                    {this.state.isAPCADisplayed && (
                      <this.apcaScoreTag
                        color={darkText}
                        score={this.getAPCAContrast(background, darkText)}
                      />
                    )}
                  </div>
                )
              })}
          </div>
        ))}
      </div>
    )
  }
}
