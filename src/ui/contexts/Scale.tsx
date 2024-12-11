import {
  Button,
  ConsentConfiguration,
  Dialog,
  Dropdown,
  FormItem,
  KeyboardShortcutItem,
  SectionTitle,
  layouts,
  texts,
} from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'

import { locals } from '../../content/locals'
import {
  Easing,
  EditorType,
  Language,
  NamingConvention,
  PlanStatus,
} from '../../types/app'
import {
  PresetConfiguration,
  ScaleConfiguration,
  SourceColorConfiguration,
  UserConfiguration,
} from '../../types/configurations'
import { ScaleMessage } from '../../types/messages'
import { ActionsList, DispatchProcess } from '../../types/models'
import features from '../../config'
import doLightnessScale from '../../utils/doLightnessScale'
import { trackScaleManagementEvent } from '../../utils/eventsTracker'
import { defaultPreset, palette, presets } from '../../utils/palettePackage'
import type { AppStates } from '../App'
import Feature from '../components/Feature'
import Slider from '../components/Slider'
import Actions from '../modules/Actions'
import Dispatcher from '../modules/Dispatcher'

interface ScaleProps {
  sourceColors?: Array<SourceColorConfiguration>
  hasPreset: boolean
  preset: PresetConfiguration
  namingConvention: NamingConvention
  distributionEasing: Easing
  scale?: ScaleConfiguration
  actions?: string
  userIdentity: UserConfiguration
  userConsent: Array<ConsentConfiguration>
  planStatus: PlanStatus
  editorType?: EditorType
  lang: Language
  onChangePreset?: React.Dispatch<Partial<AppStates>>
  onChangeScale: () => void
  onChangeStop?: () => void
  onAddStop?: React.Dispatch<Partial<AppStates>>
  onRemoveStop?: React.Dispatch<Partial<AppStates>>
  onChangeNamingConvention?: React.Dispatch<Partial<AppStates>>
  onChangeDistributionEasing?: React.Dispatch<Partial<AppStates>>
  onCreatePalette?: () => void
  onSyncLocalStyles?: () => void
  onSyncLocalVariables?: () => void
  onPublishPalette?: () => void
}

interface ScaleStates {
  isTipsOpen: boolean
}

export default class Scale extends PureComponent<ScaleProps, ScaleStates> {
  scaleMessage: ScaleMessage
  dispatch: { [key: string]: DispatchProcess }

  static defaultProps: Partial<ScaleProps> = {
    namingConvention: 'ONES',
    distributionEasing: 'LINEAR',
  }

  static features = (planStatus: PlanStatus) => ({
    SCALE_PRESETS: new FeatureStatus({
      features: features,
      featureName: 'SCALE_PRESETS',
      planStatus: planStatus,
    }),
    SCALE_PRESETS_NAMING_CONVENTION: new FeatureStatus({
      features: features,
      featureName: 'SCALE_PRESETS_NAMING_CONVENTION',
      planStatus: planStatus,
    }),
    SCALE_CONFIGURATION: new FeatureStatus({
      features: features,
      featureName: 'SCALE_CONFIGURATION',
      planStatus: planStatus,
    }),
    SCALE_HELPER: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER',
      planStatus: planStatus,
    }),
    SCALE_HELPER_DISTRIBUTION: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION',
      planStatus: planStatus,
    }),
    SCALE_HELPER_TIPS: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_TIPS',
      planStatus: planStatus,
    }),
    PREVIEW: new FeatureStatus({
      features: features,
      featureName: 'PREVIEW',
      planStatus: planStatus,
    }),
    PRESETS: (() => {
      return Object.fromEntries(
        Object.entries(presets).map(([, preset]) => [
          `PRESETS_${preset.id}`,
          new FeatureStatus({
            features: features,
            featureName: `PRESETS_${preset.id}`,
            planStatus: planStatus,
          }),
        ])
      )
    })(),
  })

  constructor(props: ScaleProps) {
    super(props)
    this.scaleMessage = {
      type: 'UPDATE_SCALE',
      data: palette,
      isEditedInRealTime: true,
    }
    this.dispatch = {
      scale: new Dispatcher(
        () => parent.postMessage({ pluginMessage: this.scaleMessage }, '*'),
        500
      ) as DispatchProcess,
    }
    this.state = {
      isTipsOpen: false,
    }
  }

  // Handlers
  slideHandler = (state: string, feature?: string) => {
    const onReleaseStop = () => {
      this.dispatch.scale.on.status = false
      this.scaleMessage.data = palette
      this.scaleMessage.isEditedInRealTime = false
      this.props.onChangeScale()
      if (!this.props.hasPreset)
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onChangeStop = () => {
      this.scaleMessage.data = palette
      this.scaleMessage.isEditedInRealTime = false
      this.scaleMessage.feature = feature
      this.props.onChangeStop?.()
      if (!this.props.hasPreset)
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onTypeStopValue = () => {
      this.scaleMessage.data = palette
      this.scaleMessage.isEditedInRealTime = false
      this.props.onChangeStop?.()
      if (!this.props.hasPreset)
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onUpdatingStop = () => {
      this.scaleMessage.isEditedInRealTime = true
      this.props.onChangeScale()
      if (!this.props.hasPreset) this.dispatch.scale.on.status = true
    }

    const actions: ActionsList = {
      RELEASED: () => onReleaseStop(),
      SHIFTED: () => onChangeStop(),
      TYPED: () => onTypeStopValue(),
      UPDATING: () => onUpdatingStop(),
    }

    return actions[state]?.()
  }

  presetsHandler = (e: Event) => {
    const scale = (preset: PresetConfiguration) =>
      doLightnessScale(
        preset.scale ?? [],
        preset.min ?? 0,
        preset.max ?? 100,
        preset.isDistributed ?? true,
        this.props.distributionEasing
      )

    const setMaterialDesignPreset = () => {
      const preset =
        presets.find((preset) => preset.id === 'MATERIAL') ?? defaultPreset

      palette.preset = preset
      palette.scale = scale(preset)

      this.props.onChangePreset?.({
        preset: preset,
        scale: scale(preset),
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_MATERIAL',
        }
      )
    }

    const setMaterial3Preset = () => {
      const preset =
        presets.find((preset) => preset.id === 'MATERIAL_3') ?? defaultPreset

      palette.preset = preset
      palette.scale = scale(preset)

      this.props.onChangePreset?.({
        preset: preset,
        scale: scale(preset),
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_MATERIAL_3',
        }
      )
    }

    const setTailwindPreset = () => {
      const preset =
        presets.find((preset) => preset.id === 'TAILWIND') ?? defaultPreset

      palette.preset = preset
      palette.scale = scale(preset)

      this.props.onChangePreset?.({
        preset: preset,
        scale: scale(preset),
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_MATERIAL',
        }
      )
    }

    const setAntDesignPreset = () => {
      const preset =
        presets.find((preset) => preset.id === 'ANT') ?? defaultPreset

      palette.preset = preset
      palette.scale = scale(preset)

      this.props.onChangePreset?.({
        preset: preset,
        scale: scale(preset),
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_ANT',
        }
      )
    }

    const setAdsPreset = () => {
      const preset =
        presets.find((preset) => preset.id === 'ADS') ?? defaultPreset

      palette.preset = preset
      palette.scale = scale(preset)

      this.props.onChangePreset?.({
        preset: preset,
        scale: scale(preset),
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_ADS',
        }
      )
    }

    const setAdsNeutralPreset = () => {
      const preset =
        presets.find((preset) => preset.id === 'ADS_NEUTRAL') ?? defaultPreset

      palette.preset = preset
      palette.scale = scale(preset)

      this.props.onChangePreset?.({
        preset: preset,
        scale: scale(preset),
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_ADS_NEUTRAL',
        }
      )
    }

    const setCarbonPreset = () => {
      const preset =
        presets.find((preset) => preset.id === 'CARBON') ?? defaultPreset

      palette.preset = preset
      palette.scale = scale(preset)

      this.props.onChangePreset?.({
        preset: preset,
        scale: scale(preset),
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_CARBON',
        }
      )
    }

    const setBasePreset = () => {
      const preset =
        presets.find((preset) => preset.id === 'BASE') ?? defaultPreset

      palette.preset = preset
      palette.scale = scale(preset)

      this.props.onChangePreset?.({
        preset: preset,
        scale: scale(preset),
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_BASE',
        }
      )
    }

    const setCustomPreset = () => {
      const preset =
        presets.find((preset) => preset.id === 'CUSTOM') ?? defaultPreset
      const newScale = preset?.scale.map((stop, index) => {
        if (this.props.namingConvention === 'TENS') return (index + 1) * 10
        else if (this.props.namingConvention === 'HUNDREDS')
          return (index + 1) * 100
        return (index + 1) * 1
      })

      preset.scale = newScale ?? []
      palette.preset = preset
      palette.min = preset.min
      palette.max = preset.max
      palette.scale = scale(preset)

      this.props.onChangePreset?.({
        preset: preset,
        scale: scale(preset),
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_CUSTOM',
        }
      )
    }

    const actions: ActionsList = {
      MATERIAL: () => setMaterialDesignPreset(),
      MATERIAL_3: () => setMaterial3Preset(),
      TAILWIND: () => setTailwindPreset(),
      ANT: () => setAntDesignPreset(),
      ADS: () => setAdsPreset(),
      ADS_NEUTRAL: () => setAdsNeutralPreset(),
      CARBON: () => setCarbonPreset(),
      BASE: () => setBasePreset(),
      CUSTOM: () => setCustomPreset(),
      DEFAULT: () => null,
    }

    return actions[(e.target as HTMLElement).dataset.value ?? 'DEFAULT']?.()
  }

  customHandler = (e: Event) => {
    const stops = this.props.preset?.['scale'] ?? [1, 2]
    const preset =
      presets.find((preset) => preset.id === 'CUSTOM') ?? defaultPreset
    const scale = (stps = stops) =>
      doLightnessScale(
        stps,
        palette.min ?? 0,
        palette.max ?? 100,
        true,
        this.props.distributionEasing
      )

    const addStop = () => {
      if (stops.length < 24) {
        stops.push(stops.slice(-1)[0] + stops[0])
        preset.scale = stops
        palette.scale = scale()

        this.props.onAddStop?.({
          preset: preset,
          scale: scale(),
        })
      }
    }

    const removeStop = () => {
      if (stops.length > 2) {
        stops.pop()
        preset.scale = stops
        palette.scale = scale()

        this.props.onRemoveStop?.({
          preset: preset,
          scale: scale(),
        })
      }
    }

    const changeNamingConvention = () => {
      const preset =
        presets.find((preset) => preset.id === 'CUSTOM') ?? defaultPreset
      const option = (e.target as HTMLInputElement).dataset
        .value as NamingConvention
      const newStops = stops.map((stop, index) => {
        if (option === 'TENS') return (index + 1) * 10
        else if (option === 'HUNDREDS') return (index + 1) * 100
        return (index + 1) * 1
      })

      preset.scale = newStops
      palette.scale = scale(newStops)
      palette.preset = preset

      this.props.onChangeNamingConvention?.({
        namingConvention: option,
        preset: preset,
        scale: scale(newStops),
      })
    }

    const changeDistributionEasing = () => {
      const value =
        ((e.target as HTMLElement).dataset.value as Easing) ?? 'LINEAR'

      this.props.onChangeDistributionEasing?.({
        distributionEasing: value,
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: value,
        }
      )
    }

    const actions: ActionsList = {
      ADD_STOP: () => addStop(),
      REMOVE_STOP: () => removeStop(),
      UPDATE_NAMING_CONVENTION: () => changeNamingConvention(),
      UPDATE_DISTRIBUTION_EASING: () => changeDistributionEasing(),
      DEFAULT: () => null,
    }

    return actions[
      (e.target as HTMLInputElement).dataset.feature ?? 'DEFAULT'
    ]?.()
  }

  // Templates
  DistributionEasing = () => {
    return (
      <FormItem
        id="update-distribution-easing"
        label={locals[this.props.lang].scale.easing.label}
        shouldFill={false}
        isBlocked={Scale.features(
          this.props.planStatus
        ).SCALE_HELPER_DISTRIBUTION.isBlocked()}
      >
        <Dropdown
          id="update-distribution-easing"
          options={[
            {
              label: locals[this.props.lang].scale.easing.linear,
              value: 'LINEAR',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              type: 'OPTION',
              isActive: true,
              isBlocked: false,
              isNew: false,
              action: this.customHandler,
            },
            {
              type: 'SEPARATOR',
            },
            {
              label: locals[this.props.lang].scale.easing.easeIn,
              value: 'EASE_IN',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              type: 'OPTION',
              isActive: true,
              isBlocked: false,
              isNew: false,
              action: this.customHandler,
            },
            {
              label: locals[this.props.lang].scale.easing.easeOut,
              value: 'EASE_OUT',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              type: 'OPTION',
              isActive: true,
              isBlocked: false,
              isNew: false,
              action: this.customHandler,
            },
            {
              label: locals[this.props.lang].scale.easing.easeInOut,
              value: 'EASE_IN_OUT',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              type: 'OPTION',
              isActive: true,
              isBlocked: false,
              isNew: false,
              action: this.customHandler,
            },
          ]}
          selected={this.props.distributionEasing}
          parentClassName="controls"
          pin="BOTTOM"
          isBlocked={Scale.features(
            this.props.planStatus
          ).SCALE_HELPER_DISTRIBUTION.isBlocked()}
          isNew={Scale.features(
            this.props.planStatus
          ).SCALE_HELPER_DISTRIBUTION.isNew()}
        />
      </FormItem>
    )
  }

  NamingConvention = () => {
    return (
      <Dropdown
        id="naming-convention"
        options={[
          {
            label: locals[this.props.lang].scale.namingConvention.ones,
            value: 'ONES',
            feature: 'UPDATE_NAMING_CONVENTION',
            type: 'OPTION',
            isActive: true,
            isBlocked: false,
            isNew: false,
            action: this.customHandler,
          },
          {
            label: locals[this.props.lang].scale.namingConvention.tens,
            value: 'TENS',
            feature: 'UPDATE_NAMING_CONVENTION',
            type: 'OPTION',
            isActive: true,
            isBlocked: false,
            isNew: false,
            action: this.customHandler,
          },
          {
            label: locals[this.props.lang].scale.namingConvention.hundreds,
            value: 'HUNDREDS',
            feature: 'UPDATE_NAMING_CONVENTION',
            type: 'OPTION',
            isActive: true,
            isBlocked: false,
            isNew: false,
            action: this.customHandler,
          },
        ]}
        selected={this.props.namingConvention}
        parentClassName="controls"
        alignment="RIGHT"
        pin="TOP"
        isBlocked={Scale.features(
          this.props.planStatus
        ).SCALE_PRESETS_NAMING_CONVENTION.isBlocked()}
        isNew={Scale.features(
          this.props.planStatus
        ).SCALE_PRESETS_NAMING_CONVENTION.isNew()}
      />
    )
  }

  KeyboardShortcuts = () => {
    const isMacOrWinKeyboard =
      navigator.userAgent.indexOf('Mac') !== -1 ? '⌘' : '⌃'

    trackScaleManagementEvent(
      this.props.userIdentity.id,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'OPEN_KEYBOARD_SHORTCUTS',
      }
    )

    return (
      <Dialog
        title={locals[this.props.lang].scale.tips.title}
        actions={{}}
        onClose={() =>
          this.setState({
            isTipsOpen: false,
          })
        }
      >
        <div className="controls__control controls__control--horizontal">
          <div className="control__block control__block--no-padding">
            <ul className="list">
              <KeyboardShortcutItem
                label={locals[this.props.lang].scale.tips.move}
                shortcuts={[[isMacOrWinKeyboard, 'drag']]}
              />
              <KeyboardShortcutItem
                label={locals[this.props.lang].scale.tips.distribute}
                shortcuts={[['⇧', 'drag']]}
              />
              <KeyboardShortcutItem
                label={locals[this.props.lang].scale.tips.select}
                shortcuts={[['click']]}
              />
              <KeyboardShortcutItem
                label={locals[this.props.lang].scale.tips.unselect}
                shortcuts={[['⎋ Esc']]}
              />
              <KeyboardShortcutItem
                label={locals[this.props.lang].scale.tips.navPrevious}
                shortcuts={[['⇧', '⇥ Tab']]}
              />
              <KeyboardShortcutItem
                label={locals[this.props.lang].scale.tips.navNext}
                shortcuts={[['⇥ Tab']]}
              />
              {!this.props.hasPreset && (
                <>
                  <KeyboardShortcutItem
                    label={locals[this.props.lang].scale.tips.type}
                    shortcuts={[['db click'], ['↩︎ Enter']]}
                    separator="or"
                  />
                  <KeyboardShortcutItem
                    label={locals[this.props.lang].scale.tips.shiftLeft}
                    shortcuts={[['←'], [isMacOrWinKeyboard, '←']]}
                    separator="or"
                  />
                  <KeyboardShortcutItem
                    label={locals[this.props.lang].scale.tips.shiftRight}
                    shortcuts={[['→'], [isMacOrWinKeyboard, '→']]}
                    separator="or"
                  />
                </>
              )}
            </ul>
          </div>
          {!this.props.hasPreset && (
            <div className="control__block control__block--list">
              <div className="section-controls">
                <div className="section-controls__left-part">
                  <SectionTitle
                    label={locals[this.props.lang].scale.tips.custom}
                  />
                </div>
                <div className="section-controls__right-part"></div>
              </div>
              <ul className="list">
                <KeyboardShortcutItem
                  label={locals[this.props.lang].scale.tips.add}
                  shortcuts={[['click']]}
                />
                <KeyboardShortcutItem
                  label={locals[this.props.lang].scale.tips.remove}
                  shortcuts={[['⌫']]}
                />
              </ul>
            </div>
          )}
        </div>
      </Dialog>
    )
  }

  Create = () => {
    return (
      <div className="controls__control">
        <div className="control__block control__block--distributed">
          <div className="section-controls">
            <div className="section-controls__left-part">
              <SectionTitle label={locals[this.props.lang].scale.title} />
            </div>
            <div className="section-controls__right-part">
              <Feature
                isActive={Scale.features(
                  this.props.planStatus
                ).SCALE_PRESETS.isActive()}
              >
                <Dropdown
                  id="presets"
                  options={Object.entries(presets).map((preset) => {
                    return {
                      label: preset[1].name,
                      value: preset[1].id,
                      feature: 'UPDATE_PRESET',
                      type: 'OPTION',
                      isActive: Scale.features(this.props.planStatus).PRESETS[
                        `PRESETS_${preset[1].id}`
                      ].isActive(),
                      isBlocked: Scale.features(this.props.planStatus).PRESETS[
                        `PRESETS_${preset[1].id}`
                      ].isBlocked(),
                      isNew: Scale.features(this.props.planStatus).PRESETS[
                        `PRESETS_${preset[1].id}`
                      ].isNew(),
                      action: (e) => this.presetsHandler?.(e),
                    }
                  })}
                  selected={this.props.preset.id}
                  parentClassName="controls"
                  alignment="RIGHT"
                  pin="TOP"
                />
              </Feature>
              <Feature
                isActive={Scale.features(
                  this.props.planStatus
                ).SCALE_PRESETS.isActive()}
              >
                {this.props.preset.name === 'Custom' && (
                  <>
                    <Feature
                      isActive={Scale.features(
                        this.props.planStatus
                      ).SCALE_PRESETS_NAMING_CONVENTION.isActive()}
                    >
                      <this.NamingConvention />
                    </Feature>
                    {this.props.preset.scale.length > 2 && (
                      <Button
                        type="icon"
                        icon="minus"
                        feature="REMOVE_STOP"
                        action={this.customHandler}
                      />
                    )}
                    <Button
                      type="icon"
                      icon="plus"
                      isDisabled={this.props.preset.scale.length === 24}
                      feature="ADD_STOP"
                      action={
                        this.props.preset.scale.length >= 24
                          ? () => null
                          : this.customHandler
                      }
                    />
                  </>
                )}
              </Feature>
            </div>
          </div>
          <Feature
            isActive={Scale.features(
              this.props.planStatus
            ).SCALE_CONFIGURATION.isActive()}
          >
            <Slider
              type="PRE_EDIT"
              hasPreset={this.props.hasPreset}
              presetName={this.props.preset.name}
              stops={this.props.preset.scale}
              scale={this.props.scale}
              min={palette.min}
              max={palette.max}
              distributionEasing={this.props.distributionEasing}
              onChange={this.slideHandler}
            />
          </Feature>
          <Feature
            isActive={Scale.features(
              this.props.planStatus
            ).SCALE_HELPER.isActive()}
          >
            <div className="section-controls">
              <div className="section-controls__left-part">
                <Feature
                  isActive={Scale.features(
                    this.props.planStatus
                  ).SCALE_HELPER_DISTRIBUTION.isActive()}
                >
                  <this.DistributionEasing />
                </Feature>
              </div>
              <div className="section-controls__right-part">
                <Feature
                  isActive={Scale.features(
                    this.props.planStatus
                  ).SCALE_HELPER_TIPS.isActive()}
                >
                  <div className={layouts['snackbar--tight']}>
                    <Button
                      type="tertiary"
                      label={locals[this.props.lang].scale.howTo}
                      action={() =>
                        parent.postMessage(
                          {
                            pluginMessage: {
                              type: 'OPEN_IN_BROWSER',
                              url: 'https://uicp.link/how-to-adjust',
                            },
                          },
                          '*'
                        )
                      }
                    />
                    <span
                      className={`type ${texts.type} ${texts['type--secondary']}`}
                    >
                      ・
                    </span>
                    <Button
                      type="tertiary"
                      label={locals[this.props.lang].scale.keyboardShortcuts}
                      action={() =>
                        this.setState({
                          isTipsOpen: true,
                        })
                      }
                    />
                  </div>
                </Feature>
              </div>
            </div>
            {this.state.isTipsOpen && <this.KeyboardShortcuts />}
          </Feature>
        </div>
        <Actions
          {...this.props}
          service="CREATE"
        />
      </div>
    )
  }

  Edit = () => {
    palette.scale = {}
    return (
      <div className="controls__control">
        <div className="control__block control__block--distributed">
          <div className="section-controls">
            <div className="section-controls__left-part">
              <SectionTitle
                label={locals[this.props.lang].scale.title}
                indicator={Object.entries(
                  this.props.scale ?? {}
                ).length.toString()}
              />
            </div>
            <div className="section-controls__right-part">
              <div className={`label ${texts.label}`}>
                {this.props.preset.name}
              </div>
            </div>
          </div>
          <Feature
            isActive={Scale.features(
              this.props.planStatus
            ).SCALE_CONFIGURATION.isActive()}
          >
            {this.props.preset.id === 'CUSTOM' ? (
              <Slider
                type="FULLY_EDIT"
                hasPreset={this.props.hasPreset}
                presetName={this.props.preset.name}
                stops={this.props.preset.scale}
                scale={this.props.scale}
                distributionEasing={this.props.distributionEasing}
                onChange={this.slideHandler}
              />
            ) : (
              <Slider
                type="EDIT"
                hasPreset={this.props.hasPreset}
                presetName={this.props.preset.name}
                stops={this.props.preset.scale}
                scale={this.props.scale}
                distributionEasing={this.props.distributionEasing}
                onChange={this.slideHandler}
              />
            )}
          </Feature>
          <Feature
            isActive={Scale.features(
              this.props.planStatus
            ).SCALE_HELPER.isActive()}
          >
            <div className="section-controls">
              <div className="section-controls__left-part">
                <Feature
                  isActive={Scale.features(
                    this.props.planStatus
                  ).SCALE_HELPER_DISTRIBUTION.isActive()}
                >
                  <this.DistributionEasing />
                </Feature>
              </div>
              <div className="section-controls__right-part">
                <Feature
                  isActive={Scale.features(
                    this.props.planStatus
                  ).SCALE_HELPER_TIPS.isActive()}
                >
                  <div className={layouts['snackbar--tight']}>
                    <Button
                      type="tertiary"
                      label={locals[this.props.lang].scale.howTo}
                      action={() =>
                        parent.postMessage(
                          {
                            pluginMessage: {
                              type: 'OPEN_IN_BROWSER',
                              url: 'https://uicp.link/how-to-adjust',
                            },
                          },
                          '*'
                        )
                      }
                    />
                    <span
                      className={`type ${texts.type} ${texts['type--secondary']}`}
                    >
                      ・
                    </span>
                    <Button
                      type="tertiary"
                      label={locals[this.props.lang].scale.keyboardShortcuts}
                      action={() =>
                        this.setState({
                          isTipsOpen: true,
                        })
                      }
                    />
                  </div>
                </Feature>
              </div>
            </div>
            {this.state.isTipsOpen && <this.KeyboardShortcuts />}
          </Feature>
        </div>
        <Actions
          {...this.props}
          service="EDIT"
        />
      </div>
    )
  }

  // Render
  render() {
    return <>{!this.props.hasPreset ? <this.Edit /> : <this.Create />}</>
  }
}
