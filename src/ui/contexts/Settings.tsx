import { ConsentConfiguration, HexModel } from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'

import features from '../../config'
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
import { trackSettingsManagementEvent } from '../../utils/eventsTracker'
import { palette } from '../../utils/palettePackage'
import type { AppStates } from '../App'
import Feature from '../components/Feature'
import Actions from '../modules/Actions'
import Dispatcher from '../modules/Dispatcher'
import Preview from '../modules/Preview'
import ColorSettings from './ColorSettings'
import ContrastSettings from './ContrastSettings'
import GlobalSettings from './GlobalSettings'
import SyncSettings from './SyncSettings'

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
    SETTINGS_GLOBAL: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_GLOBAL',
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
    SETTINGS_SYNC: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_SYNC',
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

    const updateVariablesCollection = () =>
      parent.postMessage(
        {
          pluginMessage: {
            type: 'UPDATE_VARIABLES_COLLECTION',
            data: {
              id: target.dataset.value,
            },
          },
        },
        '*'
      )

    const updateVariablesDeepSync = () =>
      parent.postMessage(
        {
          pluginMessage: {
            type: 'SET_ITEMS',
            items: [
              {
                key: 'can_deep_sync_variables',
                value: target.checked,
              },
            ],
          },
        },
        '*'
      )

    const updateStylesDeepSync = () =>
      parent.postMessage(
        {
          pluginMessage: {
            type: 'SET_ITEMS',
            items: [
              {
                key: 'can_deep_sync_styles',
                value: target.checked,
              },
            ],
          },
        },
        '*'
      )

    const actions: ActionsList = {
      RENAME_PALETTE: () => renamePalette(),
      UPDATE_DESCRIPTION: () => updateDescription(),
      UPDATE_VIEW: () => updateView(),
      UPDATE_COLOR_SPACE: () => updateColorSpace(),
      UPDATE_COLOR_BLIND_MODE: () => updatevisionSimulationMode(),
      UPDATE_ALGORITHM_VERSION: () => updateAlgorythmVersion(),
      UPDATE_TEXT_LIGHT_COLOR: () => updateTextLightColor(),
      UPDATE_TEXT_DARK_COLOR: () => updateTextDarkColor(),
      UPDATE_VARIABLES_COLLECTION: () => updateVariablesCollection(),
      UPDATE_VARIABLES_DEEP_SYNC: () => updateVariablesDeepSync(),
      UPDATE_STYLES_DEEP_SYNC: () => updateStylesDeepSync(),
      DEFAULT: () => null,
    }

    return actions[feature ?? 'DEFAULT']?.()
  }

  render() {
    return (
      <div className="controls__control">
        <div className="control__block control__block--no-padding">
          <Feature
            isActive={Settings.features(
              this.props.planStatus
            ).SETTINGS_GLOBAL.isActive()}
          >
            <GlobalSettings
              {...this.props}
              onChangeSettings={this.settingsHandler}
            />
          </Feature>
          <Feature
            isActive={Settings.features(
              this.props.planStatus
            ).SETTINGS_COLOR_MANAGEMENT.isActive()}
          >
            <ColorSettings
              {...this.props}
              onChangeSettings={this.settingsHandler}
            />
          </Feature>
          <Feature
            isActive={Settings.features(
              this.props.planStatus
            ).SETTINGS_CONTRAST_MANAGEMENT.isActive()}
          >
            <ContrastSettings
              {...this.props}
              isLast={this.props.context === 'CREATE'}
              onChangeSettings={this.settingsHandler}
            />
          </Feature>
          <Feature
            isActive={
              Settings.features(
                this.props.planStatus
              ).SETTINGS_SYNC.isActive() &&
              this.props.context === 'LOCAL_STYLES'
            }
          >
            <SyncSettings
              {...this.props}
              isLast={this.props.context === 'LOCAL_STYLES'}
              onChangeSettings={this.settingsHandler}
            />
          </Feature>
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
