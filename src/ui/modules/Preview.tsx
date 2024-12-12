import { APCAcontrast, sRGBtoY } from 'apca-w3'
import chroma from 'chroma-js'
import { PureComponent } from 'preact/compat'
import React from 'react'

import {
  Bar,
  Button,
  HexModel,
  layouts,
  Select,
  texts,
} from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import features from '../../config'
import { locals } from '../../content/locals'
import { Language, PlanStatus } from '../../types/app'
import {
  ColorConfiguration,
  ScaleConfiguration,
  SourceColorConfiguration,
} from '../../types/configurations'
import { ActionsList, RgbModel } from '../../types/models'
import Color from '../../utils/Color'
import Contrast from '../../utils/Contrast'
import { palette } from '../../utils/palettePackage'
import Feature from '../components/Feature'

interface PreviewProps {
  colors: Array<SourceColorConfiguration> | Array<ColorConfiguration> | []
  scale: ScaleConfiguration
  planStatus: PlanStatus
  lang: Language
  onResetSourceColors?: () => void
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
  setColor = (color: RgbModel | HexModel, scale: number): HexModel => {
    const colorData = new Color({
      sourceColor:
        typeof color === 'string'
          ? chroma(color).rgb()
          : chroma([color.r * 255, color.g * 255, color.b * 255]).rgb(),
      lightness: scale,
      hueShifting: 0,
      chromaShifting: 100,
      algorithmVersion: palette.algorithmVersion,
      visionSimulationMode: palette.visionSimulationMode,
    })

    switch (palette.colorSpace) {
      case 'LCH':
        return colorData.lch() as HexModel
      case 'OKLCH':
        return colorData.oklch() as HexModel
      case 'LAB':
        return colorData.lab() as HexModel
      case 'OKLAB':
        return colorData.oklab() as HexModel
      case 'HSL':
        return colorData.hsl() as HexModel
      case 'HSLUV':
        return colorData.hsluv() as HexModel
      default:
        return '#000000'
    }
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
          rightPartSlot={
            <>
              {this.props.onResetSourceColors && (
                <Button
                  type="icon"
                  icon="trash"
                  action={this.props.onResetSourceColors}
                  isDisabled={
                    this.props.colors.some(
                      (color) =>
                        (color as SourceColorConfiguration).source ===
                          'COOLORS' ||
                        (color as SourceColorConfiguration).source ===
                          'REALTIME_COLORS' ||
                        (color as SourceColorConfiguration).source ===
                          'COLOUR_LOVERS'
                    )
                      ? false
                      : true
                  }
                  helper={locals[this.props.lang].preview.reset.helper}
                />
              )}
            </>
          }
          border={['BOTTOM']}
        />
        <div className="preview__row">
          {Object.keys(this.props.scale)
            .reverse()
            .map((scale, index) => {
              return (
                <div
                  className="preview__cell preview__cell--no-height"
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
              .map((lightness, index) => {
                const background: HexModel = this.setColor(color.rgb, lightness)
                const darkText = new Color({
                  visionSimulationMode: palette.visionSimulationMode,
                }).simulateColorBlindHex(
                  chroma(palette.textColorsTheme.darkColor).rgb()
                )
                const lightText = new Color({
                  visionSimulationMode: palette.visionSimulationMode,
                }).simulateColorBlindHex(
                  chroma(palette.textColorsTheme.lightColor).rgb()
                )

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
                        score={new Contrast({
                          backgroundColor: chroma(background).rgb(),
                          textColor: lightText,
                        }).getWCAGContrast()}
                      />
                    )}
                    {this.state.isAPCADisplayed && (
                      <this.apcaScoreTag
                        color={lightText}
                        score={new Contrast({
                          backgroundColor: chroma(background).rgb(),
                          textColor: lightText,
                        }).getAPCAContrast()}
                      />
                    )}
                    {this.state.isWCAGDisplayed && (
                      <this.wcagScoreTag
                        color={darkText}
                        score={new Contrast({
                          backgroundColor: chroma(background).rgb(),
                          textColor: darkText,
                        }).getWCAGContrast()}
                      />
                    )}
                    {this.state.isAPCADisplayed && (
                      <this.apcaScoreTag
                        color={darkText}
                        score={new Contrast({
                          backgroundColor: chroma(background).rgb(),
                          textColor: darkText,
                        }).getAPCAContrast()}
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
