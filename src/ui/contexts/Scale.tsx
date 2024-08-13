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
import React from 'react'

import { locals } from '../../content/locals'
import { EditorType, Language, PlanStatus } from '../../types/app'
import {
  NamingConventionConfiguration,
  PresetConfiguration,
  ScaleConfiguration,
  SourceColorConfiguration,
} from '../../types/configurations'
import { Easing } from '../../types/management'
import { ScaleMessage } from '../../types/messages'
import { ActionsList, DispatchProcess } from '../../types/models'
import { Identity } from '../../types/user'
import features from '../../utils/config'
import doLightnessScale from '../../utils/doLightnessScale'
import { trackScaleManagementEvent } from '../../utils/eventsTracker'
import isBlocked from '../../utils/isBlocked'
import { palette, presets } from '../../utils/palettePackage'
import type { AppStates } from '../App'
import Feature from '../components/Feature'
import Slider from '../components/Slider'
import Actions from '../modules/Actions'
import Dispatcher from '../modules/Dispatcher'

interface ScaleProps {
  sourceColors?: Array<SourceColorConfiguration>
  hasPreset: boolean
  preset: PresetConfiguration
  namingConvention: NamingConventionConfiguration
  scale?: ScaleConfiguration
  actions?: string
  identity: Identity
  userConsent: Array<ConsentConfiguration>
  planStatus: PlanStatus
  editorType?: EditorType
  lang: Language
  figmaUserId: string
  onChangePreset?: React.Dispatch<Partial<AppStates>>
  onChangeScale: () => void
  onChangeStop?: () => void
  onAddStop?: React.Dispatch<Partial<AppStates>>
  onRemoveStop?: React.Dispatch<Partial<AppStates>>
  onChangeNamingConvention?: React.Dispatch<Partial<AppStates>>
  onCreatePalette?: () => void
  onSyncLocalStyles?: () => void
  onSyncLocalVariables?: () => void
  onPublishPalette?: () => void
}

interface ScaleStates {
  distributionEasing: Easing
  isTipsOpen: boolean
}

export default class Scale extends React.Component<ScaleProps, ScaleStates> {
  scaleMessage: ScaleMessage
  dispatch: { [key: string]: DispatchProcess }

  static defaultProps: Partial<ScaleProps> = {
    namingConvention: 'ONES',
  }

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
      distributionEasing: 'LINEAR',
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

  presetsHandler = (e: React.SyntheticEvent) => {
    const setMaterialDesignPreset = () => {
      this.props.onChangePreset?.({
        preset: presets.find((preset) => preset.id === 'MATERIAL'),
        scale: {},
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.figmaUserId,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_MATERIAL',
        }
      )
    }

    const setMaterial3Preset = () => {
      this.props.onChangePreset?.({
        preset: presets.find((preset) => preset.id === 'MATERIAL_3'),
        scale: {},
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.figmaUserId,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_MATERIAL_3',
        }
      )
    }

    const setTailwindPreset = () => {
      this.props.onChangePreset?.({
        preset: presets.find((preset) => preset.id === 'TAILWIND'),
        scale: {},
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.figmaUserId,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_MATERIAL',
        }
      )
    }

    const setAntDesignPreset = () => {
      this.props.onChangePreset?.({
        preset: presets.find((preset) => preset.id === 'ANT'),
        scale: {},
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.figmaUserId,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_ANT',
        }
      )
    }

    const setAdsPreset = () => {
      this.props.onChangePreset?.({
        preset: presets.find((preset) => preset.id === 'ADS'),
        scale: {},
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.figmaUserId,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_ADS',
        }
      )
    }

    const setAdsNeutralPreset = () => {
      this.props.onChangePreset?.({
        preset: presets.find((preset) => preset.id === 'ADS_NEUTRAL'),
        scale: {},
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.figmaUserId,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_ADS_NEUTRAL',
        }
      )
    }

    const setCarbonPreset = () => {
      this.props.onChangePreset?.({
        preset: presets.find((preset) => preset.id === 'CARBON'),
        scale: {},
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.figmaUserId,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_CARBON',
        }
      )
    }

    const setBasePreset = () => {
      this.props.onChangePreset?.({
        preset: presets.find((preset) => preset.id === 'BASE'),
        scale: {},
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.figmaUserId,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_BASE',
        }
      )
    }

    const setCustomPreset = () => {
      this.props.onChangePreset?.({
        preset: presets.find((preset) => preset.id === 'CUSTOM'),
        scale: {},
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.figmaUserId,
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
      NULL: () => null,
    }

    return actions[(e.target as HTMLElement).dataset.value ?? 'NULL']?.()
  }

  customHandler = (e: React.SyntheticEvent) => {
    const scale = this.props.preset?.['scale'] ?? [1, 2]

    const addStop = () => {
      if (scale.length < 24) {
        scale.push(scale.slice(-1)[0] + scale[0])
        this.props.onAddStop?.({
          preset: {
            name: presets.find((preset) => preset.id === 'CUSTOM')?.name ?? '',
            scale: scale,
            min: palette.min ?? 0,
            max: palette.max ?? 100,
            isDistributed: true,
            id: 'CUSTOM',
          },
          scale: {},
        })
      }
    }

    const removeStop = () => {
      if (scale.length > 2) {
        scale.pop()
        this.props.onRemoveStop?.({
          preset: {
            name: presets.find((preset) => preset.id === 'CUSTOM')?.name ?? '',
            scale: scale,
            min: palette.min ?? 0,
            max: palette.max ?? 100,
            isDistributed: true,
            id: 'CUSTOM',
          },
          scale: {},
        })
      }
    }

    const changeNamingConvention = () => {
      const option = (e.target as HTMLInputElement).dataset
        .value as NamingConventionConfiguration

      this.props.onChangeNamingConvention?.({
        namingConvention: option,
        preset: {
          name: presets.find((preset) => preset.id === 'CUSTOM')?.name ?? '',
          scale: scale.map((stop, index) => {
            if (option === 'TENS') return (index + 1) * 10
            else if (option === 'HUNDREDS') return (index + 1) * 100
            return (index + 1) * 1
          }),
          min: palette.min ?? 0,
          max: palette.max ?? 100,
          isDistributed: true,
          id: 'CUSTOM',
        },
        scale: {},
      })
    }

    const changeDistributionEasing = () => {
      const value = (e.target as HTMLElement).dataset.value as Easing

      this.setState({
        distributionEasing: value,
      })

      trackScaleManagementEvent(
        this.props.figmaUserId,
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
      NULL: () => null,
    }

    return actions[(e.target as HTMLInputElement).dataset.feature ?? 'NULL']?.()
  }

  // Templates
  DistributionEasing = () => {
    return (
      <FormItem
        label={locals[this.props.lang].scale.easing.label}
        id="distribution-easing"
        shouldFill={false}
      >
        <Dropdown
          id="distribution-easing"
          options={[
            {
              label: locals[this.props.lang].scale.easing.linear,
              value: 'LINEAR',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              position: 0,
              type: 'OPTION',
              isActive: true,
              isBlocked: false,
              isNew: false,
              children: [],
              action: this.customHandler,
            },
            {
              label: '',
              value: null,
              feature: null,
              position: 1,
              type: 'SEPARATOR',
              isActive: true,
              isBlocked: false,
              children: [],
              action: () => null,
            },
            {
              label: locals[this.props.lang].scale.easing.easeIn,
              value: 'EASE_IN',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              position: 2,
              type: 'OPTION',
              isActive: true,
              isBlocked: false,
              isNew: false,
              children: [],
              action: this.customHandler,
            },
            {
              label: locals[this.props.lang].scale.easing.easeOut,
              value: 'EASE_OUT',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              position: 3,
              type: 'OPTION',
              isActive: true,
              isBlocked: false,
              isNew: false,
              children: [],
              action: this.customHandler,
            },
            {
              label: locals[this.props.lang].scale.easing.easeInOut,
              value: 'EASE_IN_OUT',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              position: 4,
              type: 'OPTION',
              isActive: true,
              isBlocked: false,
              isNew: false,
              children: [],
              action: this.customHandler,
            },
          ]}
          selected={this.state.distributionEasing}
          parentClassName="controls"
          isNew={
            features.find(
              (feature) => feature.name === 'SCALE_HELPER_DISTRIBUTION'
            )?.isNew
          }
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
            position: 0,
            type: 'OPTION',
            isActive: true,
            isBlocked: false,
            isNew: false,
            children: [],
            action: this.customHandler,
          },
          {
            label: locals[this.props.lang].scale.namingConvention.tens,
            value: 'TENS',
            feature: 'UPDATE_NAMING_CONVENTION',
            position: 0,
            type: 'OPTION',
            isActive: true,
            isBlocked: false,
            isNew: false,
            children: [],
            action: this.customHandler,
          },
          {
            label: locals[this.props.lang].scale.namingConvention.hundreds,
            value: 'HUNDREDS',
            feature: 'UPDATE_NAMING_CONVENTION',
            position: 0,
            type: 'OPTION',
            isActive: true,
            isBlocked: false,
            isNew: false,
            children: [],
            action: this.customHandler,
          },
        ]}
        selected={this.props.namingConvention}
        parentClassName="controls"
        alignment="RIGHT"
        isNew={
          features.find(
            (feature) => feature.name === 'SCALE_PRESETS_NAMING_CONVENTION'
          )?.isNew
        }
      />
    )
  }

  KeyboardShortcuts = () => {
    const isMacOrWinKeyboard =
      navigator.userAgent.indexOf('Mac') !== -1 ? '⌘' : '⌃' ?? '⌘'

    trackScaleManagementEvent(
      this.props.figmaUserId,
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
              {!this.props.hasPreset ? (
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
              ) : null}
            </ul>
          </div>
          {!this.props.hasPreset ? (
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
          ) : null}
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
                isActive={
                  features.find((feature) => feature.name === 'SCALE_PRESETS')
                    ?.isActive
                }
              >
                <Dropdown
                  id="presets"
                  options={Object.entries(presets).map((preset) => {
                    return {
                      label: preset[1].name,
                      value: preset[1].id,
                      feature: 'UPDATE_PRESET',
                      position: 0,
                      type: 'OPTION',
                      isActive: features.find(
                        (feature) => feature.name === `PRESETS_${preset[1].id}`
                      )?.isActive,
                      isBlocked: isBlocked(
                        `PRESETS_${preset[1].id}`,
                        this.props.planStatus
                      ),
                      isNew: features.find(
                        (feature) => feature.name === `PRESETS_${preset[1].id}`
                      )?.isNew,
                      children: [],
                      action: (e) => this.presetsHandler?.(e),
                    }
                  })}
                  selected={this.props.preset.id}
                  parentClassName="controls"
                  alignment="RIGHT"
                />
              </Feature>
              <Feature
                isActive={
                  features.find((feature) => feature.name === 'SCALE_PRESETS')
                    ?.isActive
                }
              >
                {this.props.preset.name === 'Custom' ? (
                  <>
                    <Feature
                      isActive={
                        features.find(
                          (feature) =>
                            feature.name === 'SCALE_PRESETS_NAMING_CONVENTION'
                        )?.isActive
                      }
                    >
                      <this.NamingConvention />
                    </Feature>
                    {this.props.preset.scale.length > 2 ? (
                      <Button
                        type="icon"
                        icon="minus"
                        feature="REMOVE_STOP"
                        action={this.customHandler}
                      />
                    ) : null}
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
                ) : null}
              </Feature>
            </div>
          </div>
          <Feature
            isActive={
              features.find((feature) => feature.name === 'SCALE_CONFIGURATION')
                ?.isActive
            }
          >
            {this.props.preset.isDistributed &&
            Object.keys(this.props.scale ?? {}).length === 0 ? (
              <Slider
                type="EQUAL"
                hasPreset={this.props.hasPreset}
                presetName={this.props.preset.name}
                stops={this.props.preset.scale}
                min={palette.min}
                max={palette.max}
                distributionEasing={this.state.distributionEasing}
                onChange={this.slideHandler}
              />
            ) : (
              <Slider
                type="CUSTOM"
                hasPreset={this.props.hasPreset}
                presetName={this.props.preset.name}
                stops={this.props.preset.scale}
                scale={
                  Object.keys(this.props.scale ?? {}).length === 0
                    ? doLightnessScale(
                        this.props.preset.scale,
                        this.props.preset.min,
                        this.props.preset.max,
                        false
                      )
                    : this.props.scale
                }
                distributionEasing={this.state.distributionEasing}
                onChange={this.slideHandler}
              />
            )}
          </Feature>
          <Feature
            isActive={
              features.find((feature) => feature.name === 'SCALE_HELPER')
                ?.isActive
            }
          >
            <div className="section-controls">
              <div className="section-controls__left-part">
                <Feature
                  isActive={
                    features.find(
                      (feature) => feature.name === 'SCALE_HELPER_DISTRIBUTION'
                    )?.isActive
                  }
                >
                  <this.DistributionEasing />
                </Feature>
              </div>
              <div className="section-controls__right-part">
                <Feature
                  isActive={
                    features.find(
                      (feature) => feature.name === 'SCALE_HELPER_TIPS'
                    )?.isActive
                  }
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
                      ﹒
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
            {this.state.isTipsOpen ? <this.KeyboardShortcuts /> : null}
          </Feature>
        </div>
        <Actions
          {...this.props}
          context="CREATE"
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
            isActive={
              features.find((feature) => feature.name === 'SCALE_CONFIGURATION')
                ?.isActive
            }
          >
            <Slider
              type="CUSTOM"
              hasPreset={this.props.hasPreset}
              presetName={this.props.preset.name}
              stops={this.props.preset.scale}
              scale={this.props.scale}
              distributionEasing={this.state.distributionEasing}
              onChange={this.slideHandler}
            />
          </Feature>
          <Feature
            isActive={
              features.find((feature) => feature.name === 'SCALE_HELPER')
                ?.isActive
            }
          >
            <div className="section-controls">
              <div className="section-controls__left-part">
                <Feature
                  isActive={
                    features.find(
                      (feature) => feature.name === 'SCALE_HELPER_DISTRIBUTION'
                    )?.isActive
                  }
                >
                  <this.DistributionEasing />
                </Feature>
              </div>
              <div className="section-controls__right-part">
                <Feature
                  isActive={
                    features.find(
                      (feature) => feature.name === 'SCALE_HELPER_TIPS'
                    )?.isActive
                  }
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
                      ﹒
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
            {this.state.isTipsOpen ? <this.KeyboardShortcuts /> : null}
          </Feature>
        </div>
        <Actions
          context="DEPLOY"
          {...this.props}
        />
      </div>
    )
  }

  // Render
  render() {
    return <>{!this.props.hasPreset ? <this.Edit /> : <this.Create />}</>
  }
}
