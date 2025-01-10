import { PureComponent } from 'preact/compat'
import React from 'react'

import {
  Bar,
  Button,
  ConsentConfiguration,
  Dropdown,
  HexModel,
  layouts,
  Menu,
  Select,
  texts,
} from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import features from '../../config'
import { locals } from '../../content/locals'
import { $palette } from '../../stores/palette'
import { $isAPCADisplayed, $isWCAGDisplayed } from '../../stores/preferences'
import { Language, PlanStatus, Service } from '../../types/app'
import {
  AlgorithmVersionConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  LockedSourceColorsConfiguration,
  ScaleConfiguration,
  ShiftConfiguration,
  SourceColorConfiguration,
  UserConfiguration,
  VisionSimulationModeConfiguration,
} from '../../types/configurations'
import { ActionsList, TextColorsThemeHexModel } from '../../types/models'
import Color from '../../utils/Color'
import { trackPreviewManagementEvent } from '../../utils/eventsTracker'
import { AppStates } from '../App'
import Feature from '../components/Feature'
import Shade from '../components/Shade'

interface PreviewProps {
  service: Service
  colors: Array<SourceColorConfiguration> | Array<ColorConfiguration> | []
  scale: ScaleConfiguration
  shift?: ShiftConfiguration
  areSourceColorsLocked: LockedSourceColorsConfiguration
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  algorithmVersion: AlgorithmVersionConfiguration
  textColorsTheme: TextColorsThemeHexModel
  userIdentity: UserConfiguration
  userConsent: Array<ConsentConfiguration>
  planStatus: PlanStatus
  lang: Language
  onLockSourceColors: React.Dispatch<Partial<AppStates>>
  onResetSourceColors?: () => void
  onChangeSettings: React.Dispatch<Partial<AppStates>>
}

interface PreviewStates {
  isWCAGDisplayed: boolean
  isAPCADisplayed: boolean
  isDrawerCollapsed: boolean
  drawerHeight: string
}

export default class Preview extends PureComponent<PreviewProps, PreviewStates> {
  private drawerRef: React.RefObject<HTMLDivElement>
  private unsubscribeWCAG: (() => void) | undefined
  private unsubscribeAPCA: (() => void) | undefined
  private palette: typeof $palette

  static features = (planStatus: PlanStatus) => ({
    PREVIEW_SCORES: new FeatureStatus({
      features: features,
      featureName: 'PREVIEW_SCORES',
      planStatus: planStatus,
    }),
    PREVIEW_SCORES_WCAG: new FeatureStatus({
      features: features,
      featureName: 'PREVIEW_SCORES_WCAG',
      planStatus: planStatus,
    }),
    PREVIEW_SCORES_APCA: new FeatureStatus({
      features: features,
      featureName: 'PREVIEW_SCORES_APCA',
      planStatus: planStatus,
    }),
    PREVIEW_LOCK_SOURCE_COLORS: new FeatureStatus({
      features: features,
      featureName: 'PREVIEW_LOCK_SOURCE_COLORS',
      planStatus: planStatus,
    }),
    SETTINGS_COLOR_SPACE: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_COLOR_SPACE',
      planStatus: planStatus,
    }),
    SETTINGS_COLOR_SPACE_LCH: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_COLOR_SPACE_LCH',
      planStatus: planStatus,
    }),
    SETTINGS_COLOR_SPACE_OKLCH: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_COLOR_SPACE_OKLCH',
      planStatus: planStatus,
    }),
    SETTINGS_COLOR_SPACE_LAB: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_COLOR_SPACE_LAB',
      planStatus: planStatus,
    }),
    SETTINGS_COLOR_SPACE_OKLAB: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_COLOR_SPACE_OKLAB',
      planStatus: planStatus,
    }),
    SETTINGS_COLOR_SPACE_HSL: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_COLOR_SPACE_HSL',
      planStatus: planStatus,
    }),
    SETTINGS_COLOR_SPACE_HSLUV: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_COLOR_SPACE_HSLUV',
      planStatus: planStatus,
    }),
    SETTINGS_VISION_SIMULATION_MODE: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE',
      planStatus: planStatus,
    }),
    SETTINGS_VISION_SIMULATION_MODE_NONE: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_NONE',
      planStatus: planStatus,
    }),
    SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY',
      planStatus: planStatus,
    }),
    SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA',
      planStatus: planStatus,
    }),
    SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY',
      planStatus: planStatus,
    }),
    SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA',
      planStatus: planStatus,
    }),
    SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY',
      planStatus: planStatus,
    }),
    SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA',
      planStatus: planStatus,
    }),
    SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY',
      planStatus: planStatus,
    }),
    SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA',
      planStatus: planStatus,
    }),
  })

  static defaultProps = {
    sourceColors: [],
    scale: {},
  }

  constructor(props: PreviewProps) {
    super(props)
    this.palette = $palette
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
    document.body.style.cursor = ''
    document.removeEventListener('mousemove', this.onDrag)

    if (e.detail === 2)
      this.setState({
        drawerHeight: this.state.drawerHeight === 'auto' ? '100%' : 'auto',
        isDrawerCollapsed: false,
      })
  }

  displayHandler = (): string => {
    const options = []
    if (this.state.isWCAGDisplayed) options.push('ENABLE_WCAG_SCORE')
    if (this.state.isAPCADisplayed) options.push('ENABLE_APCA_SCORE')
    return options.join(', ')
  }

  colorSettingsHandler = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLLIElement>
  ) => {
    const lockSourceColors = () => {
      const target = e.target as HTMLInputElement
      this.palette.setKey('areSourceColorsLocked', target.checked ?? false)

      this.props.onLockSourceColors({
        areSourceColorsLocked: target.checked,
      })

      if (this.props.service === 'EDIT')
        parent.postMessage(
          {
            pluginMessage: {
              type: 'UPDATE_PALETTE',
              items: [
                {
                  key: 'areSourceColorsLocked',
                  value: target.checked,
                },
              ],
            },
          },
          '*'
        )

      trackPreviewManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'LOCK_SOURCE_COLORS',
        }
      )
    }

    const updateColorSpace = () => {
      const target = e.target as HTMLLIElement
      this.palette.setKey(
        'colorSpace',
        target.dataset.value as ColorSpaceConfiguration
      )

      this.props.onChangeSettings({
        colorSpace: target.dataset.value as ColorSpaceConfiguration,
      })

      if (this.props.service === 'EDIT')
        parent.postMessage(
          {
            pluginMessage: {
              type: 'UPDATE_PALETTE',
              items: [
                {
                  key: 'colorSpace',
                  value: target.dataset.value,
                },
              ],
            },
          },
          '*'
        )

      trackPreviewManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_COLOR_SPACE',
        }
      )
    }

    const updateColorBlindMode = () => {
      const target = e.target as HTMLLIElement
      this.palette.setKey(
        'visionSimulationMode',
        target.dataset.value as VisionSimulationModeConfiguration
      )

      this.props.onChangeSettings({
        visionSimulationMode: target.dataset
          .value as VisionSimulationModeConfiguration,
      })

      if (this.props.service === 'EDIT')
        parent.postMessage(
          {
            pluginMessage: {
              type: 'UPDATE_PALETTE',
              items: [
                {
                  key: 'visionSimulationMode',
                  value: target.dataset.value,
                },
              ],
            },
          },
          '*'
        )

      trackPreviewManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_VISION_SIMULATION_MODE',
        }
      )
    }

    const actions: ActionsList = {
      LOCK_SOURCE_COLORS: () => lockSourceColors(),
      UPDATE_COLOR_SPACE: () => updateColorSpace(),
      UPDATE_COLOR_BLIND_MODE: () => updateColorBlindMode(),
      DEFAULT: () => null,
    }

    actions[(e.target as HTMLElement).dataset.feature ?? 'DEFAULT']()
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
      isDrawerCollapsed: delta <= 40,
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

  // Render
  render() {
    if (!this.props.colors.length) return null
    return (
      <div
        id="preview"
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
                icon={this.state.isDrawerCollapsed ? 'upward' : 'downward'}
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
                    label: locals[this.props.lang].preview.score.wcag,
                    value: 'ENABLE_WCAG_SCORE',
                    type: 'OPTION',
                    isActive: Preview.features(
                      this.props.planStatus
                    ).PREVIEW_SCORES_WCAG.isActive(),
                    isBlocked: Preview.features(
                      this.props.planStatus
                    ).PREVIEW_SCORES_WCAG.isBlocked(),
                    isNew: Preview.features(
                      this.props.planStatus
                    ).PREVIEW_SCORES_WCAG.isNew(),
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
                    label: locals[this.props.lang].preview.score.apca,
                    value: 'ENABLE_APCA_SCORE',
                    type: 'OPTION',
                    isActive: Preview.features(
                      this.props.planStatus
                    ).PREVIEW_SCORES_APCA.isActive(),
                    isBlocked: Preview.features(
                      this.props.planStatus
                    ).PREVIEW_SCORES_APCA.isBlocked(),
                    isNew: Preview.features(
                      this.props.planStatus
                    ).PREVIEW_SCORES_APCA.isNew(),
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
                alignment="TOP_LEFT"
                isBlocked={Preview.features(
                  this.props.planStatus
                ).PREVIEW_SCORES.isBlocked()}
                isNew={Preview.features(
                  this.props.planStatus
                ).PREVIEW_SCORES.isNew()}
              />
            </div>
          }
          rightPartSlot={
            <div className={layouts['snackbar--tight']}>
              <Feature
                isActive={Preview.features(
                  this.props.planStatus
                ).PREVIEW_LOCK_SOURCE_COLORS.isActive()}
              >
                <Select
                  id="lock-source-colors"
                  label={locals[this.props.lang].preview.lock.label}
                  type="SWITCH_BUTTON"
                  feature="LOCK_SOURCE_COLORS"
                  isChecked={this.props.areSourceColorsLocked}
                  action={this.colorSettingsHandler}
                />
              </Feature>
              <Feature
                isActive={Preview.features(
                  this.props.planStatus
                ).SETTINGS_COLOR_SPACE.isActive()}
              >
                <Dropdown
                  id="update-color-space"
                  options={[
                    {
                      label:
                        locals[this.props.lang].settings.color.colorSpace.lch,
                      value: 'LCH',
                      feature: 'UPDATE_COLOR_SPACE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_COLOR_SPACE_LCH.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_COLOR_SPACE_LCH.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_COLOR_SPACE_LCH.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label:
                        locals[this.props.lang].settings.color.colorSpace.oklch,
                      value: 'OKLCH',
                      feature: 'UPDATE_COLOR_SPACE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_COLOR_SPACE_OKLCH.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_COLOR_SPACE_OKLCH.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_COLOR_SPACE_OKLCH.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label:
                        locals[this.props.lang].settings.color.colorSpace.lab,
                      value: 'LAB',
                      feature: 'UPDATE_COLOR_SPACE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_COLOR_SPACE_LAB.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_COLOR_SPACE_LAB.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_COLOR_SPACE_LAB.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label:
                        locals[this.props.lang].settings.color.colorSpace.oklab,
                      value: 'OKLAB',
                      feature: 'UPDATE_COLOR_SPACE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_COLOR_SPACE_OKLAB.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_COLOR_SPACE_OKLAB.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_COLOR_SPACE_OKLAB.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label:
                        locals[this.props.lang].settings.color.colorSpace.hsl,
                      value: 'HSL',
                      feature: 'UPDATE_COLOR_SPACE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_COLOR_SPACE_HSL.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_COLOR_SPACE_HSL.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_COLOR_SPACE_HSL.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label:
                        locals[this.props.lang].settings.color.colorSpace.hsluv,
                      value: 'HSLUV',
                      feature: 'UPDATE_COLOR_SPACE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_COLOR_SPACE_HSLUV.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_COLOR_SPACE_HSLUV.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_COLOR_SPACE_HSLUV.isNew(),
                      action: this.colorSettingsHandler,
                    },
                  ]}
                  selected={this.props.colorSpace}
                  alignment="RIGHT"
                  containerId="app"
                  isBlocked={Preview.features(
                    this.props.planStatus
                  ).SETTINGS_COLOR_SPACE.isBlocked()}
                  isNew={Preview.features(
                    this.props.planStatus
                  ).SETTINGS_COLOR_SPACE.isNew()}
                />
              </Feature>
              <Feature
                isActive={Preview.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE.isActive()}
              >
                <Dropdown
                  id="update-color-blind-mode"
                  options={[
                    {
                      label:
                        locals[this.props.lang].settings.color
                          .visionSimulationMode.noneAlternative,
                      value: 'NONE',
                      feature: 'UPDATE_COLOR_BLIND_MODE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_NONE.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_NONE.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_NONE.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      type: 'SEPARATOR',
                    },
                    {
                      label:
                        locals[this.props.lang].settings.color
                          .visionSimulationMode.colorBlind,
                      type: 'TITLE',
                    },
                    {
                      label:
                        locals[this.props.lang].settings.color
                          .visionSimulationMode.protanomaly,
                      value: 'PROTANOMALY',
                      feature: 'UPDATE_COLOR_BLIND_MODE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label:
                        locals[this.props.lang].settings.color
                          .visionSimulationMode.protanopia,
                      value: 'PROTANOPIA',
                      feature: 'UPDATE_COLOR_BLIND_MODE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label:
                        locals[this.props.lang].settings.color
                          .visionSimulationMode.deuteranomaly,
                      value: 'DEUTERANOMALY',
                      feature: 'UPDATE_COLOR_BLIND_MODE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label:
                        locals[this.props.lang].settings.color
                          .visionSimulationMode.deuteranopia,
                      value: 'DEUTERANOPIA',
                      feature: 'UPDATE_COLOR_BLIND_MODE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label:
                        locals[this.props.lang].settings.color
                          .visionSimulationMode.tritanomaly,
                      value: 'TRITANOMALY',
                      feature: 'UPDATE_COLOR_BLIND_MODE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label:
                        locals[this.props.lang].settings.color
                          .visionSimulationMode.tritanopia,
                      value: 'TRITANOPIA',
                      feature: 'UPDATE_COLOR_BLIND_MODE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label:
                        locals[this.props.lang].settings.color
                          .visionSimulationMode.achromatomaly,
                      value: 'ACHROMATOMALY',
                      feature: 'UPDATE_COLOR_BLIND_MODE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isNew(),
                      action: this.colorSettingsHandler,
                    },
                    {
                      label:
                        locals[this.props.lang].settings.color
                          .visionSimulationMode.achromatopsia,
                      value: 'ACHROMATOPSIA',
                      feature: 'UPDATE_COLOR_BLIND_MODE',
                      type: 'OPTION',
                      isActive: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isActive(),
                      isBlocked: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isBlocked(),
                      isNew: Preview.features(
                        this.props.planStatus
                      ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isNew(),
                      action: this.colorSettingsHandler,
                    },
                  ]}
                  selected={this.props.visionSimulationMode}
                  alignment="RIGHT"
                  containerId="app"
                  isBlocked={Preview.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE.isBlocked()}
                  isNew={Preview.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE.isNew()}
                />
              </Feature>
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
              {this.props.colors
                .sort((a, b) => {
                  if (this.props.service === 'EDIT') return 0
                  if (a.name.localeCompare(b.name) > 0) return 1
                  else if (a.name.localeCompare(b.name) < 0) return -1
                  else return 0
                })
                .map((color, index) => {
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
                        return (
                          <Shade
                            key={index}
                            index={index}
                            color={scaledColor}
                            sourceColor={color}
                            scaledColors={scaledColors}
                            isWCAGDisplayed={this.state.isWCAGDisplayed}
                            isAPCADisplayed={this.state.isAPCADisplayed}
                            {...this.props}
                          />
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
