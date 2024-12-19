import chroma from 'chroma-js'
import { PureComponent } from 'preact/compat'
import React from 'react'

import {
  Bar,
  Button,
  HexModel,
  Icon,
  layouts,
  Menu,
  Select,
  texts,
} from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import features from '../../config'
import { locals } from '../../content/locals'
import { $isAPCADisplayed, $isWCAGDisplayed } from '../../stores/preferences'
import { Language, PlanStatus } from '../../types/app'
import {
  AlgorithmVersionConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  LockedSourceColorsConfiguration,
  ScaleConfiguration,
  ShiftConfiguration,
  SourceColorConfiguration,
  VisionSimulationModeConfiguration,
} from '../../types/configurations'
import { TextColorsThemeHexModel } from '../../types/models'
import Color from '../../utils/Color'
import Contrast from '../../utils/Contrast'
import { palette } from '../../utils/palettePackage'
import { AppStates } from '../App'

interface PreviewProps {
  colors: Array<SourceColorConfiguration> | Array<ColorConfiguration> | []
  scale: ScaleConfiguration
  shift?: ShiftConfiguration
  areSourceColorsLocked: LockedSourceColorsConfiguration
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  algorithmVersion: AlgorithmVersionConfiguration
  textColorsTheme: TextColorsThemeHexModel
  planStatus: PlanStatus
  lang: Language
  onLockSourceColors?: React.Dispatch<Partial<AppStates>>
  onResetSourceColors?: () => void
}

interface PreviewStates {
  isWCAGDisplayed: boolean
  isAPCADisplayed: boolean
  isDrawerCollapsed: boolean
  drawerHeight: string
}

export default class Preview extends PureComponent<
  PreviewProps,
  PreviewStates
> {
  private drawerRef: React.RefObject<HTMLDivElement>
  private unsubscribeWCAG: (() => void) | undefined
  private unsubscribeAPCA: (() => void) | undefined

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
      isWCAGDisplayed: true,
      isAPCADisplayed: true,
      isDrawerCollapsed: false,
      drawerHeight: 'auto',
    }
    this.drawerRef = React.createRef()
  }

  // Lifecycle
  componentDidMount = (): void => {
    this.unsubscribeWCAG = $isWCAGDisplayed.subscribe((value) => {
      this.setState({ isWCAGDisplayed: value })
    })
    this.unsubscribeAPCA = $isAPCADisplayed.subscribe((value) => {
      this.setState({ isAPCADisplayed: value })
    })
  }

  componentWillUnmount = (): void => {
    if (this.unsubscribeWCAG) this.unsubscribeWCAG()
    if (this.unsubscribeAPCA) this.unsubscribeAPCA()
  }

  componentDidUpdate = (): void => {
    if (this.props.colors.length === 0)
      this.setState({
        drawerHeight: 'auto',
      })
  }

  // Handlers
  clickHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.detail === 2) {
      document.removeEventListener('mousemove', this.onDrag)
      this.setState({
        drawerHeight: this.state.drawerHeight === 'auto' ? '100%' : 'auto',
        isDrawerCollapsed: false,
      })
    }
  }

  displayHandler = (): string => {
    const options = []
    if (this.state.isWCAGDisplayed) options.push('ENABLE_WCAG_SCORE')
    if (this.state.isAPCADisplayed) options.push('ENABLE_APCA_SCORE')
    return options.join(', ')
  }

  lockSourceColorsHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement
    palette.areSourceColorsLocked = target.checked ?? false
    if (this.props.onLockSourceColors)
      this.props.onLockSourceColors({
        areSourceColorsLocked: target.checked,
      })
  }

  // Direct actions
  setColor = (
    color: ColorConfiguration | SourceColorConfiguration,
    scale: number
  ): HexModel => {
    const colorData = new Color({
      sourceColor: [color.rgb.r * 255, color.rgb.g * 255, color.rgb.b * 255],
      lightness: scale,
      hueShifting: color.hue?.shift === undefined ? 0 : color.hue.shift,
      chromaShifting:
        color.chroma?.shift === undefined
          ? this.props.shift?.chroma
          : color.chroma.shift,
      algorithmVersion: this.props.algorithmVersion,
      visionSimulationMode: this.props.visionSimulationMode,
    })

    switch (this.props.colorSpace) {
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

  onGrab = () => {
    document.body.style.cursor = 'ns-resize'
    document.addEventListener('mousemove', this.onDrag)
  }

  onDrag = (e: MouseEvent) => {
    const { drawerRef } = this
    const { clientY } = e
    const bottom = drawerRef.current
      ? drawerRef.current.getBoundingClientRect().bottom
      : 0
    const delta = bottom - clientY

    this.setState({
      drawerHeight: `${delta}px`,
      isDrawerCollapsed: delta <= 40 ? true : false,
    })

    document.body.style.cursor = 'ns-resize'
    document.addEventListener('mouseup', () => {
      document.body.style.cursor = ''
      document.removeEventListener('mousemove', this.onDrag)
    })
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
        {`${score.toFixed(2)} : 1`}
      </span>
      <span className={'preview__tag__obs type'}>
        {score <= 4.5 ? '✘' : '✔'}
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
        {score <= 45 ? '✘' : '✔'}
      </span>
    </div>
  )

  lockColorTag = () => (
    <div className="preview__tag">
      <Icon
        type="PICTO"
        iconName="lock-on"
        iconColor="var(--black)"
      />
      <span className={`preview__tag__score type ${texts['type--truncated']}`}>
        Locked
      </span>
    </div>
  )

  // Render
  render() {
    if (!this.props.colors.length) return null
    return (
      <div
        className="preview"
        style={{
          height: this.state.drawerHeight,
        }}
        ref={this.drawerRef}
      >
        <div
          className="preview__knob-spot"
          onMouseDown={this.onGrab}
          onClick={this.clickHandler}
        />
        <Bar
          leftPartSlot={
            <div className={layouts['snackbar--tight']}>
              <Button
                type="icon"
                icon={this.state.isDrawerCollapsed ? 'caret-up' : 'caret-down'}
                action={() =>
                  this.setState({
                    isDrawerCollapsed: !this.state.isDrawerCollapsed,
                    drawerHeight: 'auto',
                  })
                }
              />
              <Menu
                id="change-score-display"
                type="ICON"
                icon="visible"
                options={[
                  {
                    label: locals[this.props.lang].preview.wcag.label,
                    value: 'ENABLE_WCAG_SCORE',
                    type: 'OPTION',
                    isActive: Preview.features(
                      this.props.planStatus
                    ).PREVIEW_WCAG.isActive(),
                    isBlocked: Preview.features(
                      this.props.planStatus
                    ).PREVIEW_WCAG.isBlocked(),
                    isNew: Preview.features(
                      this.props.planStatus
                    ).PREVIEW_WCAG.isNew(),
                    action: () => {
                      $isWCAGDisplayed.set(!this.state.isWCAGDisplayed)
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
                    },
                  },
                  {
                    label: locals[this.props.lang].preview.apca.label,
                    value: 'ENABLE_APCA_SCORE',
                    type: 'OPTION',
                    isActive: Preview.features(
                      this.props.planStatus
                    ).PREVIEW_APCA.isActive(),
                    isBlocked: Preview.features(
                      this.props.planStatus
                    ).PREVIEW_APCA.isBlocked(),
                    isNew: Preview.features(
                      this.props.planStatus
                    ).PREVIEW_APCA.isNew(),
                    action: () => {
                      $isAPCADisplayed.set(!this.state.isAPCADisplayed)
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
                    },
                  },
                ]}
                selected={this.displayHandler()}
              />
            </div>
          }
          rightPartSlot={
            <div className={layouts['snackbar--medium']}>
              <Select
                id="lock-source-colors"
                label="Lock source colors"
                type="SWITCH_BUTTON"
                isChecked={this.props.areSourceColorsLocked}
                onChange={this.lockSourceColorsHandler}
              />
              <span
                className={`type ${texts['type']} ${texts['type--secondary']}`}
              >
                {this.props.colorSpace}
              </span>
              {this.props.onResetSourceColors && (
                <div className={layouts['snackbar']}>
                  <span
                    className={`type ${texts['type']} ${texts['type--secondary']}`}
                  >
                    ・
                  </span>
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
                </div>
              )}
            </div>
          }
          border={['BOTTOM']}
        />
        {!this.state.isDrawerCollapsed && (
          <div className="preview__palette">
            <div className="preview__header">
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
            <div className="preview__rows">
              {this.props.colors.map((color, index) => {
                const scaledColors: Array<HexModel> = Object.values(
                  this.props.scale
                )
                  .reverse()
                  .map((lightness) => this.setColor(color, lightness))

                return (
                  <div
                    className="preview__row"
                    key={index}
                  >
                    {Object.values(scaledColors).map((scaledColor, index) => {
                      const sourceColor = chroma([
                        color.rgb.r * 255,
                        color.rgb.g * 255,
                        color.rgb.b * 255,
                      ]).hex()
                      const distances = scaledColors.map((scaledColor) =>
                        chroma.distance(sourceColor, scaledColor, 'rgb')
                      )
                      const minDistanceIndex = distances.indexOf(
                        Math.min(...distances)
                      )
                      const background: HexModel =
                        index === minDistanceIndex &&
                        this.props.areSourceColorsLocked
                          ? sourceColor
                          : scaledColor
                      const darkText = new Color({
                        visionSimulationMode: this.props.visionSimulationMode,
                      }).simulateColorBlindHex(
                        chroma(this.props.textColorsTheme.darkColor).rgb(false)
                      )
                      const lightText = new Color({
                        visionSimulationMode: this.props.visionSimulationMode,
                      }).simulateColorBlindHex(
                        chroma(this.props.textColorsTheme.lightColor).rgb(false)
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
                                backgroundColor: chroma(background).rgb(false),
                                textColor: lightText,
                              }).getWCAGContrast()}
                            />
                          )}
                          {this.state.isAPCADisplayed && (
                            <this.apcaScoreTag
                              color={lightText}
                              score={new Contrast({
                                backgroundColor: chroma(background).rgb(false),
                                textColor: lightText,
                              }).getAPCAContrast()}
                            />
                          )}
                          {this.state.isWCAGDisplayed && (
                            <this.wcagScoreTag
                              color={darkText}
                              score={new Contrast({
                                backgroundColor: chroma(background).rgb(false),
                                textColor: darkText,
                              }).getWCAGContrast()}
                            />
                          )}
                          {this.state.isAPCADisplayed && (
                            <this.apcaScoreTag
                              color={darkText}
                              score={new Contrast({
                                backgroundColor: chroma(background).rgb(false),
                                textColor: darkText,
                              }).getAPCAContrast()}
                            />
                          )}
                          {index === minDistanceIndex &&
                            this.props.areSourceColorsLocked && (
                              <this.lockColorTag />
                            )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }
}
