import {
  Button,
  ConsentConfiguration,
  Dialog,
  Dropdown,
  DropdownOption,
  FormItem,
  KeyboardShortcutItem,
  SectionTitle,
  layouts,
  texts,
} from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'

import features from '../../config'
import { locals } from '../../content/locals'
import { $canPaletteDeepSync } from '../../stores/preferences'
import {
  Easing,
  EditorType,
  Language,
  NamingConvention,
  PlanStatus,
} from '../../types/app'
import {
  PaletteConfiguration,
  PresetConfiguration,
  ScaleConfiguration,
  ShiftConfiguration,
  SourceColorConfiguration,
  UserConfiguration,
} from '../../types/configurations'
import { ScaleMessage } from '../../types/messages'
import { ActionsList, DispatchProcess } from '../../types/models'
import doLightnessScale from '../../utils/doLightnessScale'
import { trackScaleManagementEvent } from '../../utils/eventsTracker'
import { defaultPreset, presets } from '../../utils/palettePackage'
import type { AppStates } from '../App'
import Feature from '../components/Feature'
import SimpleSlider from '../components/SimpleSlider'
import Slider from '../components/Slider'
import Actions from '../modules/Actions'
import Dispatcher from '../modules/Dispatcher'
import { $palette } from '../../stores/palette'

interface ScaleProps {
  sourceColors?: Array<SourceColorConfiguration>
  hasPreset: boolean
  preset: PresetConfiguration
  namingConvention: NamingConvention
  distributionEasing: Easing
  scale?: ScaleConfiguration
  shift: ShiftConfiguration
  actions?: string
  userIdentity: UserConfiguration
  userConsent: Array<ConsentConfiguration>
  planStatus: PlanStatus
  editorType?: EditorType
  lang: Language
  isPrimaryLoading?: boolean
  onChangePreset?: React.Dispatch<Partial<AppStates>>
  onChangeScale: () => void
  onChangeStop?: () => void
  onAddStop?: React.Dispatch<Partial<AppStates>>
  onRemoveStop?: React.Dispatch<Partial<AppStates>>
  onChangeShift: (feature?: string, state?: string, value?: number) => void
  onChangeNamingConvention?: React.Dispatch<Partial<AppStates>>
  onChangeDistributionEasing?: React.Dispatch<Partial<AppStates>>
  onCreatePalette?: () => void
  onSyncLocalStyles?: () => void
  onSyncLocalVariables?: () => void
  onPublishPalette?: () => void
}

interface ScaleStates {
  isTipsOpen: boolean
  canPaletteDeepSync: boolean
}

export default class Scale extends PureComponent<ScaleProps, ScaleStates> {
  private scaleMessage: ScaleMessage
  private dispatch: { [key: string]: DispatchProcess }
  private unsubscribe: (() => void) | undefined
  private palette: typeof $palette

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
    SCALE_CHROMA: new FeatureStatus({
      features: features,
      featureName: 'SCALE_CHROMA',
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
    SCALE_HELPER_DISTRIBUTION_LINEAR: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_LINEAR',
      planStatus: planStatus,
    }),
    SCALE_HELPER_DISTRIBUTION_SLOW_EASE_IN: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_SLOW_EASE_IN',
      planStatus: planStatus,
    }),
    SCALE_HELPER_DISTRIBUTION_SLOW_EASE_OUT: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_SLOW_EASE_OUT',
      planStatus: planStatus,
    }),
    SCALE_HELPER_DISTRIBUTION_SLOW_EASE_IN_OUT: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_SLOW_EASE_IN_OUT',
      planStatus: planStatus,
    }),
    SCALE_HELPER_DISTRIBUTION_EASE_IN: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_EASE_IN',
      planStatus: planStatus,
    }),
    SCALE_HELPER_DISTRIBUTION_EASE_OUT: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_EASE_OUT',
      planStatus: planStatus,
    }),
    SCALE_HELPER_DISTRIBUTION_EASE_IN_OUT: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_EASE_IN_OUT',
      planStatus: planStatus,
    }),
    SCALE_HELPER_DISTRIBUTION_FAST_EASE_IN: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_FAST_EASE_IN',
      planStatus: planStatus,
    }),
    SCALE_HELPER_DISTRIBUTION_FAST_EASE_OUT: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_FAST_EASE_OUT',
      planStatus: planStatus,
    }),
    SCALE_HELPER_DISTRIBUTION_FAST_EASE_IN_OUT: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_FAST_EASE_IN_OUT',
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
    this.palette = $palette
    this.scaleMessage = {
      type: 'UPDATE_SCALE',
      data: this.palette.value as PaletteConfiguration,
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
      canPaletteDeepSync: false,
    }
  }

  // Lifecycle
  componentDidMount() {
    this.unsubscribe = $canPaletteDeepSync.subscribe((value) => {
      this.setState({ canPaletteDeepSync: value })
    })
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe()
  }

  // Handlers
  slideHandler = (state: string, feature?: string) => {
    const onReleaseStop = () => {
      this.dispatch.scale.on.status = false
      this.scaleMessage.data = this.palette.value as PaletteConfiguration
      this.scaleMessage.isEditedInRealTime = false
      this.props.onChangeScale()
      if (!this.props.hasPreset)
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onChangeStop = () => {
      this.scaleMessage.data = this.palette.value as PaletteConfiguration
      this.scaleMessage.isEditedInRealTime = false
      this.scaleMessage.feature = feature
      this.props.onChangeStop?.()
      this.props.onChangeScale()
      if (!this.props.hasPreset)
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onTypeStopValue = () => {
      this.scaleMessage.data = this.palette.value as PaletteConfiguration
      this.scaleMessage.isEditedInRealTime = false
      this.props.onChangeStop?.()
      this.props.onChangeScale()
      if (!this.props.hasPreset)
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onUpdatingStop = () => {
      this.scaleMessage.isEditedInRealTime = true
      this.props.onChangeScale()
      if (!this.props.hasPreset && this.state.canPaletteDeepSync)
        this.dispatch.scale.on.status = true
    }

    const actions: ActionsList = {
      RELEASED: () => onReleaseStop(),
      SHIFTED: () => onChangeStop(),
      TYPED: () => onTypeStopValue(),
      UPDATING: () => onUpdatingStop(),
      DEFAULT: () => null,
    }

    return actions[state ?? 'DEFAULT']?.()
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

      this.palette.setKey('preset', JSON.parse(JSON.stringify(preset)))
      this.palette.setKey(
        'preset.name',
        `${this.palette.get().preset.name} (${this.palette.get().preset.family})`
      )
      this.palette.setKey('scale', scale(preset))

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

      this.palette.setKey('preset', JSON.parse(JSON.stringify(preset)))
      this.palette.setKey(
        'preset.name',
        `${this.palette.get().preset.name} (${this.palette.get().preset.family}')`
      )
      this.palette.setKey('scale', scale(preset))

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

      this.palette.setKey('preset', preset)
      this.palette.setKey('scale', scale(preset))

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

      this.palette.setKey('preset', preset)
      this.palette.setKey('scale', scale(preset))

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

      this.palette.setKey('preset', JSON.parse(JSON.stringify(preset)))
      this.palette.setKey(
        'preset.name',
        `${this.palette.get().preset.name} (${this.palette.get().preset.family})`
      )
      this.palette.setKey('scale', scale(preset))

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

      this.palette.setKey('preset', JSON.parse(JSON.stringify(preset)))
      this.palette.setKey(
        'preset.name',
        `${this.palette.get().preset.name} (${this.palette.get().preset.family})`
      )
      this.palette.setKey('scale', scale(preset))

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

      this.palette.setKey('preset', preset)
      this.palette.setKey('scale', scale(preset))

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

      this.palette.setKey('preset', preset)
      this.palette.setKey('scale', scale(preset))

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
      this.palette.setKey('preset', preset)
      this.palette.setKey('min', preset.min)
      this.palette.setKey('max', preset.max)
      this.palette.setKey('scale', scale(preset))

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

  presetsOptions = () => {
    const orderedPresets = presets.reduce(
      (acc: { [key: string]: PresetConfiguration[] }, preset) => {
        const { family, name } = preset
        if (family !== undefined) {
          if (!acc[family]) acc[family] = []
          acc[family].push(preset)
        } else {
          if (!acc[name]) acc[name] = []
          acc[name].push(preset)
        }
        return acc
      },
      {} as { [key: string]: PresetConfiguration[] }
    )

    const options: Array<DropdownOption> = Object.entries(orderedPresets).map(
      (preset) => {
        if (preset[1].length > 1)
          return {
            label: preset[0],
            value: preset[0].toUpperCase(),
            type: 'OPTION',
            children: preset[1].map((preset: PresetConfiguration) => ({
              label: preset.name,
              value: preset.id,
              feature: `PRESETS_${preset.id}`,
              type: 'OPTION',
              isActive: Scale.features(this.props.planStatus).PRESETS[
                `PRESETS_${preset.id}`
              ].isActive(),
              isBlocked: Scale.features(this.props.planStatus).PRESETS[
                `PRESETS_${preset.id}`
              ].isBlocked(),
              isNew: Scale.features(this.props.planStatus).PRESETS[
                `PRESETS_${preset.id}`
              ].isNew(),
              action: this.presetsHandler,
            })),
          }
        else
          return {
            label: preset[1][0].name,
            value: preset[1][0].id,
            feature: `PRESETS_${preset[1][0].id}`,
            type: 'OPTION',
            isActive: Scale.features(this.props.planStatus).PRESETS[
              `PRESETS_${preset[1][0].id}`
            ].isActive(),
            isBlocked: Scale.features(this.props.planStatus).PRESETS[
              `PRESETS_${preset[1][0].id}`
            ].isBlocked(),
            isNew: Scale.features(this.props.planStatus).PRESETS[
              `PRESETS_${preset[1][0].id}`
            ].isNew(),
            action: this.presetsHandler,
          }
      }
    )

    options.splice(options.length - 1, 0, {
      type: 'SEPARATOR',
    })

    return options
  }

  customHandler = (e: Event) => {
    const stops = this.props.preset?.['scale'] ?? [1, 2]
    const preset =
      presets.find((preset) => preset.id === 'CUSTOM') ?? defaultPreset
    const scale = (stps = stops) =>
      doLightnessScale(
        stps,
        this.palette.get().min ?? 0,
        this.palette.get().max ?? 100,
        true,
        this.props.distributionEasing
      )

    const addStop = () => {
      if (stops.length < 24) {
        stops.push(stops.slice(-1)[0] + stops[0])
        preset.scale = stops
        this.palette.setKey('scale', scale())

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
        this.palette.setKey('scale', scale())

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
      this.palette.setKey('scale', scale(newStops))
      this.palette.setKey('preset', preset)

      this.props.onChangeNamingConvention?.({
        namingConvention: option,
        preset: preset,
        scale: scale(newStops),
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: option,
        }
      )
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
              isActive: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_LINEAR.isActive(),
              isBlocked: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_LINEAR.isBlocked(),
              isNew: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_LINEAR.isNew(),
              action: this.customHandler,
            },

            {
              type: 'SEPARATOR',
            },
            {
              label: locals[this.props.lang].scale.easing.slowEaseIn,
              value: 'SLOW_EASE_IN',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              type: 'OPTION',
              isActive: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_SLOW_EASE_IN.isActive(),
              isBlocked: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_SLOW_EASE_IN.isBlocked(),
              isNew: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_SLOW_EASE_IN.isNew(),
              action: this.customHandler,
            },
            {
              label: locals[this.props.lang].scale.easing.easeIn,
              value: 'EASE_IN',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              type: 'OPTION',
              isActive: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_EASE_IN.isActive(),
              isBlocked: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_EASE_IN.isBlocked(),
              isNew: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_EASE_IN.isNew(),
              action: this.customHandler,
            },
            {
              label: locals[this.props.lang].scale.easing.fastEaseIn,
              value: 'FAST_EASE_IN',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              type: 'OPTION',
              isActive: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_FAST_EASE_IN.isActive(),
              isBlocked: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_FAST_EASE_IN.isBlocked(),
              isNew: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_FAST_EASE_IN.isNew(),
              action: this.customHandler,
            },
            {
              type: 'SEPARATOR',
            },
            {
              label: locals[this.props.lang].scale.easing.slowEaseOut,
              value: 'SLOW_EASE_OUT',
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
              isActive: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_EASE_OUT.isActive(),
              isBlocked: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_EASE_OUT.isBlocked(),
              isNew: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_EASE_OUT.isNew(),
              action: this.customHandler,
            },
            {
              label: locals[this.props.lang].scale.easing.fastEaseOut,
              value: 'FAST_EASE_OUT',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              type: 'OPTION',
              isActive: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_FAST_EASE_OUT.isActive(),
              isBlocked: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_FAST_EASE_OUT.isBlocked(),
              isNew: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_FAST_EASE_OUT.isNew(),
              action: this.customHandler,
            },
            {
              type: 'SEPARATOR',
            },
            {
              label: locals[this.props.lang].scale.easing.slowEaseInOut,
              value: 'SLOW_EASE_IN_OUT',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              type: 'OPTION',
              isActive: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_SLOW_EASE_IN_OUT.isActive(),
              isBlocked: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_SLOW_EASE_IN_OUT.isBlocked(),
              isNew: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_SLOW_EASE_IN_OUT.isNew(),
              action: this.customHandler,
            },
            {
              label: locals[this.props.lang].scale.easing.easeInOut,
              value: 'EASE_IN_OUT',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              type: 'OPTION',
              isActive: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_EASE_IN_OUT.isActive(),
              isBlocked: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_EASE_IN_OUT.isBlocked(),
              isNew: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_EASE_IN_OUT.isNew(),
              action: this.customHandler,
            },
            {
              label: locals[this.props.lang].scale.easing.fastEaseInOut,
              value: 'FAST_EASE_IN_OUT',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              type: 'OPTION',
              isActive: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_FAST_EASE_IN_OUT.isActive(),
              isBlocked: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_FAST_EASE_IN_OUT.isBlocked(),
              isNew: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_FAST_EASE_IN_OUT.isNew(),
              action: this.customHandler,
            },
          ]}
          selected={this.props.distributionEasing}
          pin="BOTTOM"
          containerId="scale"
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
        <div
          id="scale"
          className="control__block control__block--distributed"
        >
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
                  options={this.presetsOptions()}
                  selected={this.props.preset.id}
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
              {...this.props}
              type="EDIT"
              presetName={this.props.preset.name}
              stops={this.props.preset.scale}
              min={this.palette.get().min}
              max={this.palette.get().max}
              colors={{
                min: 'var(--black)',
                max: 'var(--white)',
              }}
              onChange={this.slideHandler}
            />
          </Feature>
          <Feature
            isActive={Scale.features(
              this.props.planStatus
            ).SCALE_CHROMA.isActive()}
          >
            <SimpleSlider
              id="update-chroma"
              shortId={locals[this.props.lang].scale.shift.chroma}
              value={this.props.shift.chroma}
              min={0}
              max={200}
              colors={{
                min: 'hsl(187, 0%, 75%)',
                max: 'hsl(187, 100%, 75%)',
              }}
              feature="SHIFT_CHROMA"
              isBlocked={Scale.features(
                this.props.planStatus
              ).SCALE_CHROMA.isBlocked()}
              isNew={Scale.features(this.props.planStatus).SCALE_CHROMA.isNew()}
              onChange={(feature, state, value) => {
                this.palette.setKey('shift.chroma', value)
                this.props.onChangeShift()
              }}
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
    this.palette.setKey('scale', {})
    return (
      <div className="controls__control">
        <div
          id="scale"
          className="control__block control__block--distributed"
        >
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
                {...this.props}
                type="FULLY_EDIT"
                presetName={this.props.preset.name}
                stops={this.props.preset.scale}
                colors={{
                  min: 'var(--black)',
                  max: 'var(--white)',
                }}
                onChange={this.slideHandler}
              />
            ) : (
              <Slider
                type="EDIT"
                {...this.props}
                presetName={this.props.preset.name}
                stops={this.props.preset.scale}
                colors={{
                  min: 'var(--black)',
                  max: 'var(--white)',
                }}
                onChange={this.slideHandler}
              />
            )}
          </Feature>
          <Feature
            isActive={Scale.features(
              this.props.planStatus
            ).SCALE_CHROMA.isActive()}
          >
            <SimpleSlider
              id="update-chroma"
              shortId={locals[this.props.lang].scale.shift.chroma}
              value={this.props.shift.chroma}
              min={0}
              max={200}
              colors={{
                min: 'hsl(187, 0%, 75%)',
                max: 'hsl(187, 100%, 75%)',
              }}
              feature="SHIFT_CHROMA"
              isBlocked={Scale.features(
                this.props.planStatus
              ).SCALE_CHROMA.isBlocked()}
              isNew={Scale.features(this.props.planStatus).SCALE_CHROMA.isNew()}
              onChange={(feature, state, value) => {
                this.palette.setKey('shift.chroma', value)
                this.props.onChangeShift(feature, state, value)
                this.slideHandler(state)
              }}
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
