import {
  ConsentConfiguration,
  Dropdown,
  FormItem,
  HexModel,
  Input,
  SectionTitle,
  Select,
  SemanticMessage,
} from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'

import { locals } from '../../content/locals'
import { EditorType, Language, PlanStatus } from '../../types/app'
import {
  AlgorithmVersionConfiguration,
  ColorSpaceConfiguration,
  SourceColorConfiguration,
  UserConfiguration,
  ViewConfiguration,
  VisionSimulationModeConfiguration,
} from '../../types/configurations'
import { SettingsMessage } from '../../types/messages'
import {
  ActionsList,
  DispatchProcess,
  TextColorsThemeHexModel,
} from '../../types/models'
import features from '../../config'
import { trackSettingsManagementEvent } from '../../utils/eventsTracker'
import { palette } from '../../utils/palettePackage'
import type { AppStates } from '../App'
import Feature from '../components/Feature'
import Actions from '../modules/Actions'
import Dispatcher from '../modules/Dispatcher'
import Preview from '../modules/Preview'

interface SettingsProps {
  context: string
  sourceColors?: Array<SourceColorConfiguration>
  name: string
  description: string
  textColorsTheme: TextColorsThemeHexModel
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  view: string
  algorithmVersion?: AlgorithmVersionConfiguration
  userIdentity: UserConfiguration
  userConsent: Array<ConsentConfiguration>
  planStatus: PlanStatus
  editorType?: EditorType
  lang: Language
  onChangeSettings: React.Dispatch<Partial<AppStates>>
  onCreatePalette?: () => void
  onSyncLocalStyles?: () => void
  onSyncLocalVariables?: () => void
  onPublishPalette?: () => void
}

export default class Settings extends PureComponent<SettingsProps> {
  settingsMessage: SettingsMessage
  dispatch: { [key: string]: DispatchProcess }

  static features = (planStatus: PlanStatus) => ({
    SCALE_PRESETS: new FeatureStatus({
      features: features,
      featureName: 'SCALE_PRESETS',
      planStatus: planStatus,
    }),
    SETTINGS_NAME: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_NAME',
      planStatus: planStatus,
    }),
    SETTINGS_DESCRIPTION: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_DESCRIPTION',
      planStatus: planStatus,
    }),
    VIEWS: new FeatureStatus({
      features: features,
      featureName: 'VIEWS',
      planStatus: planStatus,
    }),
    VIEWS_PALETTE_WITH_PROPERTIES: new FeatureStatus({
      features: features,
      featureName: 'VIEWS_PALETTE_WITH_PROPERTIES',
      planStatus: planStatus,
    }),
    VIEWS_PALETTE: new FeatureStatus({
      features: features,
      featureName: 'VIEWS_PALETTE',
      planStatus: planStatus,
    }),
    VIEWS_SHEET: new FeatureStatus({
      features: features,
      featureName: 'VIEWS_SHEET',
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
    SETTINGS_NEW_ALGORITHM: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_NEW_ALGORITHM',
      planStatus: planStatus,
    }),
    SETTINGS_GLOBAL: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_GLOBAL',
      planStatus: planStatus,
    }),
    SETTINGS_TEXT_COLORS_THEME: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_TEXT_COLORS_THEME',
      planStatus: planStatus,
    }),
    SETTINGS_COLOR_MANAGEMENT: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_COLOR_MANAGEMENT',
      planStatus: planStatus,
    }),
    SETTINGS_CONTRAST_MANAGEMENT: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_CONTRAST_MANAGEMENT',
      planStatus: planStatus,
    }),
    PREVIEW: new FeatureStatus({
      features: features,
      featureName: 'PREVIEW',
      planStatus: planStatus,
    }),
  })

  constructor(props: SettingsProps) {
    super(props)
    this.settingsMessage = {
      type: 'UPDATE_SETTINGS',
      data: {
        name: '',
        description: '',
        colorSpace: 'LCH',
        visionSimulationMode: 'NONE',
        textColorsTheme: {
          lightColor: '#FFFFFF',
          darkColor: '#000000',
        },
        algorithmVersion: 'v2',
      },
      isEditedInRealTime: false,
      isSynchronized: false,
    }
    this.dispatch = {
      textColorsTheme: new Dispatcher(
        () => parent.postMessage({ pluginMessage: this.settingsMessage }, '*'),
        500
      ) as DispatchProcess,
    }
  }

  // Direct actions
  settingsHandler = (e: Event) => {
    const target = e.target as HTMLInputElement,
      feature = target.dataset.feature ?? 'DEFAULT'

    const renamePalette = () => {
      palette.name = target.value
      this.settingsMessage.data.name = target.value
      this.settingsMessage.data.description = this.props.description
      this.settingsMessage.data.colorSpace = this.props.colorSpace
      this.settingsMessage.data.visionSimulationMode =
        this.props.visionSimulationMode
      this.settingsMessage.data.textColorsTheme = this.props.textColorsTheme
      this.settingsMessage.data.algorithmVersion =
        this.props.algorithmVersion ?? 'v2'

      this.props.onChangeSettings({
        name: this.settingsMessage.data.name,
        onGoingStep: 'settings changed',
      })

      if (
        (e.type === 'focusout' || (e as KeyboardEvent).key === 'Enter') &&
        this.props.context === 'LOCAL_STYLES'
      ) {
        parent.postMessage({ pluginMessage: this.settingsMessage }, '*')
        trackSettingsManagementEvent(
          this.props.userIdentity.id,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: 'RENAME_PALETTE',
          }
        )
      }
    }

    const updateDescription = () => {
      palette.description = target.value
      this.settingsMessage.data.name = this.props.name
      this.settingsMessage.data.description = target.value
      this.settingsMessage.data.colorSpace = this.props.colorSpace
      this.settingsMessage.data.visionSimulationMode =
        this.props.visionSimulationMode
      this.settingsMessage.data.textColorsTheme = this.props.textColorsTheme
      this.settingsMessage.data.algorithmVersion =
        this.props.algorithmVersion ?? 'v2'

      this.props.onChangeSettings({
        description: this.settingsMessage.data.description,
        onGoingStep: 'settings changed',
      })

      if (e.type === 'focusout' && this.props.context === 'LOCAL_STYLES') {
        parent.postMessage({ pluginMessage: this.settingsMessage }, '*')
        trackSettingsManagementEvent(
          this.props.userIdentity.id,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: 'DESCRIBE_PALETTE',
          }
        )
      }
    }

    const updateView = () => {
      if (target.dataset.isBlocked === 'false') {
        palette.view = target.dataset.value as ViewConfiguration

        this.props.onChangeSettings({
          view: target.dataset.value as ViewConfiguration,
          onGoingStep: 'view changed',
        })

        if (this.props.context === 'LOCAL_STYLES') {
          parent.postMessage(
            { pluginMessage: { type: 'UPDATE_VIEW', data: palette } },
            '*'
          )
          trackSettingsManagementEvent(
            this.props.userIdentity.id,
            this.props.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: 'UPDATE_VIEW',
            }
          )
        }
      }
    }

    const updateColorSpace = () => {
      palette.colorSpace = target.dataset.value as ColorSpaceConfiguration
      this.settingsMessage.data.name = this.props.name
      this.settingsMessage.data.description = this.props.description
      this.settingsMessage.data.colorSpace = target.dataset
        .value as ColorSpaceConfiguration
      this.settingsMessage.data.visionSimulationMode =
        this.props.visionSimulationMode
      this.settingsMessage.data.textColorsTheme = this.props.textColorsTheme
      this.settingsMessage.data.algorithmVersion =
        this.props.algorithmVersion ?? 'v2'

      this.props.onChangeSettings({
        colorSpace: this.settingsMessage.data.colorSpace,
        onGoingStep: 'settings changed',
      })

      if (this.props.context === 'LOCAL_STYLES') {
        parent.postMessage({ pluginMessage: this.settingsMessage }, '*')
        trackSettingsManagementEvent(
          this.props.userIdentity.id,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: 'UPDATE_COLOR_SPACE',
          }
        )
      }
    }

    const updatevisionSimulationMode = () => {
      palette.visionSimulationMode = target.dataset
        .value as VisionSimulationModeConfiguration
      this.settingsMessage.data.name = this.props.name
      this.settingsMessage.data.description = this.props.description
      this.settingsMessage.data.colorSpace = this.props.colorSpace
      this.settingsMessage.data.visionSimulationMode = target.dataset
        .value as VisionSimulationModeConfiguration
      this.settingsMessage.data.textColorsTheme = this.props.textColorsTheme
      this.settingsMessage.data.algorithmVersion =
        this.props.algorithmVersion ?? 'v2'

      this.props.onChangeSettings({
        visionSimulationMode: this.settingsMessage.data.visionSimulationMode,
        onGoingStep: 'settings changed',
      })

      if (this.props.context === 'LOCAL_STYLES') {
        parent.postMessage({ pluginMessage: this.settingsMessage }, '*')
        trackSettingsManagementEvent(
          this.props.userIdentity.id,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: 'UPDATE_VISION_SIMULATION_MODE',
          }
        )
      }
    }

    const updateAlgorythmVersion = () => {
      this.settingsMessage.data.name = this.props.name
      this.settingsMessage.data.description = this.props.description
      this.settingsMessage.data.colorSpace = this.props.colorSpace
      this.settingsMessage.data.visionSimulationMode =
        this.props.visionSimulationMode
      this.settingsMessage.data.textColorsTheme = this.props.textColorsTheme
      this.settingsMessage.data.algorithmVersion = !target.checked ? 'v1' : 'v2'

      this.props.onChangeSettings({
        algorithmVersion: this.settingsMessage.data.algorithmVersion,
        onGoingStep: 'settings changed',
      })

      parent.postMessage({ pluginMessage: this.settingsMessage }, '*')
      trackSettingsManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_ALGORITHM',
        }
      )
    }

    const updateTextLightColor = () => {
      const code: HexModel =
        target.value.indexOf('#') === -1 ? '#' + target.value : target.value

      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(code)) {
        this.settingsMessage.data.name = this.props.name
        this.settingsMessage.data.description = this.props.description
        this.settingsMessage.data.colorSpace = this.props.colorSpace
        this.settingsMessage.data.visionSimulationMode =
          this.props.visionSimulationMode
        this.settingsMessage.data.textColorsTheme.lightColor = code
        palette.textColorsTheme.lightColor = code
        this.settingsMessage.data.textColorsTheme.darkColor =
          this.props.textColorsTheme.darkColor
        this.settingsMessage.data.algorithmVersion =
          this.props.algorithmVersion ?? 'v2'
      }

      this.props.onChangeSettings({
        textColorsTheme: this.settingsMessage.data.textColorsTheme,
        onGoingStep: 'settings changed',
      })

      if (e.type === 'focusout' && this.props.context === 'LOCAL_STYLES') {
        this.dispatch.textColorsTheme.on.status = false
        parent.postMessage({ pluginMessage: this.settingsMessage }, '*')
        trackSettingsManagementEvent(
          this.props.userIdentity.id,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: 'UPDATE_TEXT_COLORS_THEME',
          }
        )
      } else if (this.props.context === 'LOCAL_STYLES')
        this.dispatch.textColorsTheme.on.status = true
    }

    const updateTextDarkColor = () => {
      const code: HexModel =
        target.value.indexOf('#') === -1 ? '#' + target.value : target.value

      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(code)) {
        this.settingsMessage.data.name = this.props.name
        this.settingsMessage.data.description = this.props.description
        this.settingsMessage.data.colorSpace = this.props.colorSpace
        this.settingsMessage.data.visionSimulationMode =
          this.props.visionSimulationMode
        this.settingsMessage.data.textColorsTheme.lightColor =
          this.props.textColorsTheme.lightColor
        this.settingsMessage.data.textColorsTheme.darkColor = code
        palette.textColorsTheme.darkColor = code
        this.settingsMessage.data.algorithmVersion =
          this.props.algorithmVersion ?? 'v2'
      }

      this.props.onChangeSettings({
        textColorsTheme: this.settingsMessage.data.textColorsTheme,
        onGoingStep: 'settings changed',
      })

      if (e.type === 'focusout' && this.props.context === 'LOCAL_STYLES') {
        this.dispatch.textColorsTheme.on.status = false
        parent.postMessage({ pluginMessage: this.settingsMessage }, '*')
        trackSettingsManagementEvent(
          this.props.userIdentity.id,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: 'UPDATE_TEXT_COLORS_THEME',
          }
        )
      } else if (this.props.context === 'LOCAL_STYLES')
        this.dispatch.textColorsTheme.on.status = true
    }

    const actions: ActionsList = {
      RENAME_PALETTE: () => renamePalette(),
      UPDATE_DESCRIPTION: () => updateDescription(),
      UPDATE_VIEW: () => updateView(),
      UPDATE_COLOR_SPACE: () => updateColorSpace(),
      UPDATE_COLOR_BLIND_MODE: () => updatevisionSimulationMode(),
      UPDATE_ALGORITHM_VERSION: () => updateAlgorythmVersion(),
      UPDATE_TEXT_LIGHT_COLOR: () => updateTextLightColor(),
      UPDATE_TEXT_DARK_COLOR: () => updateTextDarkColor(),
      NULL: () => null,
    }

    return actions[feature ?? 'NULL']?.()
  }

  // Templates
  Name = () => {
    return (
      <Feature
        isActive={Settings.features(
          this.props.planStatus
        ).SETTINGS_NAME.isActive()}
      >
        <div className="settings__item">
          <FormItem
            label={locals[this.props.lang].settings.global.name.label}
            id="update-palette-name"
            isBlocked={Settings.features(
              this.props.planStatus
            ).SETTINGS_NAME.isBlocked()}
          >
            <Input
              id="update-palette-name"
              type="TEXT"
              placeholder={locals[this.props.lang].name}
              value={this.props.name !== '' ? this.props.name : ''}
              charactersLimit={64}
              isBlocked={Settings.features(
                this.props.planStatus
              ).SETTINGS_NAME.isBlocked()}
              isNew={Settings.features(
                this.props.planStatus
              ).SETTINGS_NAME.isNew()}
              feature="RENAME_PALETTE"
              onChange={this.settingsHandler}
              onFocus={this.settingsHandler}
              onBlur={this.settingsHandler}
              onConfirm={this.settingsHandler}
            />
          </FormItem>
        </div>
      </Feature>
    )
  }

  Description = () => {
    return (
      <Feature
        isActive={Settings.features(
          this.props.planStatus
        ).SETTINGS_DESCRIPTION.isActive()}
      >
        <div className="settings__item">
          <FormItem
            label={locals[this.props.lang].settings.global.description.label}
            id="update-palette-description"
            isBlocked={Settings.features(
              this.props.planStatus
            ).SETTINGS_DESCRIPTION.isBlocked()}
          >
            <Input
              id="update-palette-description"
              type="LONG_TEXT"
              placeholder={
                locals[this.props.lang].global.description.placeholder
              }
              value={this.props.description}
              isBlocked={Settings.features(
                this.props.planStatus
              ).SETTINGS_DESCRIPTION.isBlocked()}
              isNew={Settings.features(
                this.props.planStatus
              ).SETTINGS_DESCRIPTION.isNew()}
              feature="UPDATE_DESCRIPTION"
              isGrowing={true}
              onFocus={this.settingsHandler}
              onBlur={this.settingsHandler}
              onConfirm={this.settingsHandler}
            />
          </FormItem>
        </div>
      </Feature>
    )
  }

  View = () => {
    return (
      <Feature
        isActive={Settings.features(this.props.planStatus).VIEWS.isActive()}
      >
        <div className="settings__item">
          <FormItem
            id="update-view"
            label={locals[this.props.lang].settings.global.views.label}
            isBlocked={Settings.features(
              this.props.planStatus
            ).VIEWS.isBlocked()}
          >
            <Dropdown
              id="views"
              options={[
                {
                  label: locals[this.props.lang].settings.global.views.detailed,
                  value: 'PALETTE_WITH_PROPERTIES',
                  feature: 'UPDATE_VIEW',
                  position: 0,
                  type: 'OPTION',
                  isActive: Settings.features(
                    this.props.planStatus
                  ).VIEWS_PALETTE_WITH_PROPERTIES.isActive(),
                  isBlocked: Settings.features(
                    this.props.planStatus
                  ).VIEWS_PALETTE_WITH_PROPERTIES.isBlocked(),
                  isNew: Settings.features(
                    this.props.planStatus
                  ).VIEWS_PALETTE_WITH_PROPERTIES.isNew(),
                  action: this.settingsHandler,
                },
                {
                  label: locals[this.props.lang].settings.global.views.simple,
                  value: 'PALETTE',
                  feature: 'UPDATE_VIEW',
                  position: 1,
                  type: 'OPTION',
                  isActive: Settings.features(
                    this.props.planStatus
                  ).VIEWS_PALETTE.isActive(),
                  isBlocked: Settings.features(
                    this.props.planStatus
                  ).VIEWS_PALETTE.isBlocked(),
                  isNew: Settings.features(
                    this.props.planStatus
                  ).VIEWS_PALETTE.isNew(),
                  action: this.settingsHandler,
                },
                {
                  label: locals[this.props.lang].settings.global.views.sheet,
                  value: 'SHEET',
                  feature: 'UPDATE_VIEW',
                  position: 2,
                  type: 'OPTION',
                  isActive: Settings.features(
                    this.props.planStatus
                  ).VIEWS_SHEET.isActive(),
                  isBlocked: Settings.features(
                    this.props.planStatus
                  ).VIEWS_SHEET.isBlocked(),
                  isNew: Settings.features(
                    this.props.planStatus
                  ).VIEWS_SHEET.isNew(),
                  action: this.settingsHandler,
                },
              ]}
              selected={this.props.view}
              isBlocked={Settings.features(
                this.props.planStatus
              ).VIEWS.isBlocked()}
              isNew={Settings.features(this.props.planStatus).VIEWS.isNew()}
            />
          </FormItem>
        </div>
      </Feature>
    )
  }

  ColorSpace = () => {
    return (
      <Feature
        isActive={Settings.features(
          this.props.planStatus
        ).SETTINGS_COLOR_SPACE.isActive()}
      >
        <div className="settings__item">
          <FormItem
            id="update-color-space"
            label={locals[this.props.lang].settings.color.colorSpace.label}
            isBlocked={Settings.features(
              this.props.planStatus
            ).SETTINGS_COLOR_SPACE.isBlocked()}
          >
            <Dropdown
              id="update-color-space"
              options={[
                {
                  label: locals[this.props.lang].settings.color.colorSpace.lch,
                  value: 'LCH',
                  feature: 'UPDATE_COLOR_SPACE',
                  position: 0,
                  type: 'OPTION',
                  isActive: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_COLOR_SPACE_LCH.isActive(),
                  isBlocked: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_COLOR_SPACE_LCH.isBlocked(),
                  isNew: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_COLOR_SPACE_LCH.isNew(),
                  action: this.settingsHandler,
                },
                {
                  label:
                    locals[this.props.lang].settings.color.colorSpace.oklch,
                  value: 'OKLCH',
                  feature: 'UPDATE_COLOR_SPACE',
                  position: 1,
                  type: 'OPTION',
                  isActive: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_COLOR_SPACE_OKLCH.isActive(),
                  isBlocked: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_COLOR_SPACE_OKLCH.isBlocked(),
                  isNew: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_COLOR_SPACE_OKLCH.isNew(),
                  action: this.settingsHandler,
                },
                {
                  label: locals[this.props.lang].settings.color.colorSpace.lab,
                  value: 'LAB',
                  feature: 'UPDATE_COLOR_SPACE',
                  position: 2,
                  type: 'OPTION',
                  isActive: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_COLOR_SPACE_LAB.isActive(),
                  isBlocked: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_COLOR_SPACE_LAB.isBlocked(),
                  isNew: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_COLOR_SPACE_LAB.isNew(),
                  action: this.settingsHandler,
                },
                {
                  label:
                    locals[this.props.lang].settings.color.colorSpace.oklab,
                  value: 'OKLAB',
                  feature: 'UPDATE_COLOR_SPACE',
                  position: 3,
                  type: 'OPTION',
                  isActive: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_COLOR_SPACE_OKLAB.isActive(),
                  isBlocked: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_COLOR_SPACE_OKLAB.isBlocked(),
                  isNew: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_COLOR_SPACE_OKLAB.isNew(),
                  action: this.settingsHandler,
                },
                {
                  label: locals[this.props.lang].settings.color.colorSpace.hsl,
                  value: 'HSL',
                  feature: 'UPDATE_COLOR_SPACE',
                  position: 4,
                  type: 'OPTION',
                  isActive: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_COLOR_SPACE_HSL.isActive(),
                  isBlocked: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_COLOR_SPACE_HSL.isBlocked(),
                  isNew: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_COLOR_SPACE_HSL.isNew(),
                  action: this.settingsHandler,
                },
                {
                  label:
                    locals[this.props.lang].settings.color.colorSpace.hsluv,
                  value: 'HSLUV',
                  feature: 'UPDATE_COLOR_SPACE',
                  position: 5,
                  type: 'OPTION',
                  isActive: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_COLOR_SPACE_HSLUV.isActive(),
                  isBlocked: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_COLOR_SPACE_HSLUV.isBlocked(),
                  isNew: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_COLOR_SPACE_HSLUV.isNew(),
                  action: this.settingsHandler,
                },
              ]}
              selected={this.props.colorSpace}
              isBlocked={Settings.features(
                this.props.planStatus
              ).SETTINGS_COLOR_SPACE.isBlocked()}
              isNew={Settings.features(
                this.props.planStatus
              ).SETTINGS_COLOR_SPACE.isNew()}
            />
          </FormItem>
          {this.props.colorSpace === 'HSL' && (
            <SemanticMessage
              type="WARNING"
              message={locals[this.props.lang].warning.hslColorSpace}
            />
          )}
        </div>
      </Feature>
    )
  }

  VisionSimulationMode = () => {
    return (
      <Feature
        isActive={Settings.features(
          this.props.planStatus
        ).SETTINGS_VISION_SIMULATION_MODE.isActive()}
      >
        <div className="settings__item">
          <FormItem
            id="update-color-blind-mode"
            label={
              locals[this.props.lang].settings.color.visionSimulationMode.label
            }
            isBlocked={Settings.features(
              this.props.planStatus
            ).SETTINGS_VISION_SIMULATION_MODE.isBlocked()}
          >
            <Dropdown
              id="update-color-blind-mode"
              options={[
                {
                  label:
                    locals[this.props.lang].settings.color.visionSimulationMode
                      .none,
                  value: 'NONE',
                  feature: 'UPDATE_COLOR_BLIND_MODE',
                  position: 0,
                  type: 'OPTION',
                  isActive: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_NONE.isActive(),
                  isBlocked: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_NONE.isBlocked(),
                  isNew: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_NONE.isNew(),
                  action: this.settingsHandler,
                },
                {
                  position: 1,
                  type: 'SEPARATOR',
                },
                {
                  label:
                    locals[this.props.lang].settings.color.visionSimulationMode
                      .colorBlind,
                  position: 2,
                  type: 'TITLE',
                },
                {
                  label:
                    locals[this.props.lang].settings.color.visionSimulationMode
                      .protanomaly,
                  value: 'PROTANOMALY',
                  feature: 'UPDATE_COLOR_BLIND_MODE',
                  position: 3,
                  type: 'OPTION',
                  isActive: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isActive(),
                  isBlocked: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isBlocked(),
                  isNew: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isNew(),
                  action: this.settingsHandler,
                },
                {
                  label:
                    locals[this.props.lang].settings.color.visionSimulationMode
                      .protanopia,
                  value: 'PROTANOPIA',
                  feature: 'UPDATE_COLOR_BLIND_MODE',
                  position: 4,
                  type: 'OPTION',
                  isActive: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isActive(),
                  isBlocked: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isBlocked(),
                  isNew: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isNew(),
                  action: this.settingsHandler,
                },
                {
                  label:
                    locals[this.props.lang].settings.color.visionSimulationMode
                      .deuteranomaly,
                  value: 'DEUTERANOMALY',
                  feature: 'UPDATE_COLOR_BLIND_MODE',
                  position: 5,
                  type: 'OPTION',
                  isActive: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isActive(),
                  isBlocked: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isBlocked(),
                  isNew: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isNew(),
                  action: this.settingsHandler,
                },
                {
                  label:
                    locals[this.props.lang].settings.color.visionSimulationMode
                      .deuteranopia,
                  value: 'DEUTERANOPIA',
                  feature: 'UPDATE_COLOR_BLIND_MODE',
                  position: 6,
                  type: 'OPTION',
                  isActive: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isActive(),
                  isBlocked: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isBlocked(),
                  isNew: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isNew(),
                  action: this.settingsHandler,
                },
                {
                  label:
                    locals[this.props.lang].settings.color.visionSimulationMode
                      .tritanomaly,
                  value: 'TRITANOMALY',
                  feature: 'UPDATE_COLOR_BLIND_MODE',
                  position: 7,
                  type: 'OPTION',
                  isActive: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isActive(),
                  isBlocked: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isBlocked(),
                  isNew: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isNew(),
                  action: this.settingsHandler,
                },
                {
                  label:
                    locals[this.props.lang].settings.color.visionSimulationMode
                      .tritanopia,
                  value: 'TRITANOPIA',
                  feature: 'UPDATE_COLOR_BLIND_MODE',
                  position: 8,
                  type: 'OPTION',
                  isActive: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isActive(),
                  isBlocked: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isBlocked(),
                  isNew: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isNew(),
                  action: this.settingsHandler,
                },
                {
                  label:
                    locals[this.props.lang].settings.color.visionSimulationMode
                      .achromatomaly,
                  value: 'ACHROMATOMALY',
                  feature: 'UPDATE_COLOR_BLIND_MODE',
                  position: 9,
                  type: 'OPTION',
                  isActive: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isActive(),
                  isBlocked: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isBlocked(),
                  isNew: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isNew(),
                  action: this.settingsHandler,
                },
                {
                  label:
                    locals[this.props.lang].settings.color.visionSimulationMode
                      .achromatopsia,
                  value: 'ACHROMATOPSIA',
                  feature: 'UPDATE_COLOR_BLIND_MODE',
                  position: 10,
                  type: 'OPTION',
                  isActive: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isActive(),
                  isBlocked: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isBlocked(),
                  isNew: Settings.features(
                    this.props.planStatus
                  ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isNew(),
                  action: this.settingsHandler,
                },
              ]}
              selected={this.props.visionSimulationMode}
              isBlocked={Settings.features(
                this.props.planStatus
              ).SETTINGS_VISION_SIMULATION_MODE.isBlocked()}
              isNew={Settings.features(
                this.props.planStatus
              ).SETTINGS_VISION_SIMULATION_MODE.isNew()}
            />
          </FormItem>
        </div>
      </Feature>
    )
  }

  NewAlgorithm = () => {
    return (
      <Feature
        isActive={Settings.features(
          this.props.planStatus
        ).SETTINGS_NEW_ALGORITHM.isActive()}
      >
        <div className="settings__item">
          <Select
            id="update-algorithm"
            type="SWITCH_BUTTON"
            name="algorythm"
            label={locals[this.props.lang].settings.color.newAlgorithm.label}
            isChecked={this.props.algorithmVersion === 'v2' ? true : false}
            isBlocked={Settings.features(
              this.props.planStatus
            ).SETTINGS_NEW_ALGORITHM.isBlocked()}
            isNew={Settings.features(
              this.props.planStatus
            ).SETTINGS_NEW_ALGORITHM.isNew()}
            feature="UPDATE_ALGORITHM_VERSION"
            onChange={this.settingsHandler}
          />
          <SemanticMessage
            type="INFO"
            message={
              locals[this.props.lang].settings.color.newAlgorithm.description
            }
          />
        </div>
      </Feature>
    )
  }

  TextColorsTheme = () => {
    return (
      <Feature
        isActive={Settings.features(
          this.props.planStatus
        ).SETTINGS_TEXT_COLORS_THEME.isActive()}
      >
        <div className="settings__item">
          <FormItem
            label={
              locals[this.props.lang].settings.contrast.textColors
                .textLightColor
            }
            id="update-text-light-color"
            isBlocked={Settings.features(
              this.props.planStatus
            ).SETTINGS_TEXT_COLORS_THEME.isBlocked()}
          >
            <Input
              id="update-text-light-color"
              type="COLOR"
              value={this.props.textColorsTheme?.lightColor ?? '#FFFFFF'}
              isBlocked={Settings.features(
                this.props.planStatus
              ).SETTINGS_TEXT_COLORS_THEME.isBlocked()}
              isNew={Settings.features(
                this.props.planStatus
              ).SETTINGS_TEXT_COLORS_THEME.isNew()}
              feature="UPDATE_TEXT_LIGHT_COLOR"
              onChange={this.settingsHandler}
              onFocus={this.settingsHandler}
              onBlur={this.settingsHandler}
            />
          </FormItem>
          <FormItem
            label={
              locals[this.props.lang].settings.contrast.textColors.textDarkColor
            }
            id="update-text-dark-color"
            isBlocked={Settings.features(
              this.props.planStatus
            ).SETTINGS_TEXT_COLORS_THEME.isBlocked()}
          >
            <Input
              id="update-text-dark-color"
              type="COLOR"
              value={this.props.textColorsTheme?.darkColor ?? '#OOOOOO'}
              isBlocked={Settings.features(
                this.props.planStatus
              ).SETTINGS_TEXT_COLORS_THEME.isBlocked()}
              isNew={Settings.features(
                this.props.planStatus
              ).SETTINGS_TEXT_COLORS_THEME.isNew()}
              feature="UPDATE_TEXT_DARK_COLOR"
              onChange={this.settingsHandler}
              onFocus={this.settingsHandler}
              onBlur={this.settingsHandler}
            />
          </FormItem>
          <SemanticMessage
            type="INFO"
            message={
              locals[this.props.lang].settings.contrast.textColors
                .textThemeColorsDescription
            }
          />
        </div>
      </Feature>
    )
  }

  Global = () => {
    return (
      <Feature
        isActive={Settings.features(
          this.props.planStatus
        ).SETTINGS_GLOBAL.isActive()}
      >
        <div className="settings__group">
          <div className="section-controls">
            <div className="section-controls__left-part">
              <SectionTitle
                label={locals[this.props.lang].settings.global.title}
              />
            </div>
          </div>
          <this.Name />
          <this.Description />
          <this.View />
        </div>
      </Feature>
    )
  }

  ColorManagement = () => {
    return (
      <Feature
        isActive={Settings.features(
          this.props.planStatus
        ).SETTINGS_COLOR_MANAGEMENT.isActive()}
      >
        <div className="settings__group">
          <div className="section-controls">
            <div className="section-controls__left-part">
              <SectionTitle
                label={locals[this.props.lang].settings.color.title}
              />
            </div>
          </div>
          <this.ColorSpace />
          <this.VisionSimulationMode />
          {this.props.context === 'LOCAL_STYLES' ? <this.NewAlgorithm /> : null}
        </div>
      </Feature>
    )
  }

  ContrastManagement = () => {
    return (
      <Feature
        isActive={Settings.features(
          this.props.planStatus
        ).SETTINGS_CONTRAST_MANAGEMENT.isActive()}
      >
        <div className="settings__group">
          <div className="section-controls">
            <div className="section-controls__left-part">
              <SectionTitle
                label={locals[this.props.lang].settings.contrast.title}
              />
            </div>
          </div>
          <this.TextColorsTheme />
        </div>
      </Feature>
    )
  }

  render() {
    return (
      <div className="controls__control">
        <div className="control__block control__block--no-padding">
          <this.Global />
          <this.ColorManagement />
          <this.ContrastManagement />
        </div>
        {this.props.context === 'CREATE' ? (
          <>
            <Actions
              {...this.props}
              context="CREATE"
            />
            <Feature
              isActive={Settings.features(
                this.props.planStatus
              ).PREVIEW.isActive()}
            >
              <Preview sourceColors={this.props.sourceColors} />
            </Feature>
          </>
        ) : (
          <Actions
            {...this.props}
            context="DEPLOY"
          />
        )}
      </div>
    )
  }
}
