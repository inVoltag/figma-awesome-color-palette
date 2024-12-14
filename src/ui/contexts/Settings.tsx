import { Bar, ConsentConfiguration, HexModel, Tabs } from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'

import features, { algorithmVersion } from '../../config'
import {
  Context,
  ContextItem,
  EditorType,
  Language,
  PlanStatus,
  Service,
} from '../../types/app'
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
import { setContexts } from '../../utils/setContexts'
import type { AppStates } from '../App'
import Feature from '../components/Feature'
import Actions from '../modules/Actions'
import Dispatcher from '../modules/Dispatcher'
import ColorSettings from './ColorSettings'
import ContrastSettings from './ContrastSettings'
import GlobalSettings from './GlobalSettings'
import SyncPreferences from './SyncPreferences'

interface SettingsProps {
  service: Service
  sourceColors?: Array<SourceColorConfiguration>
  name: string
  description: string
  view: ViewConfiguration
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  textColorsTheme: TextColorsThemeHexModel
  algorithmVersion?: AlgorithmVersionConfiguration
  userIdentity: UserConfiguration
  userConsent: Array<ConsentConfiguration>
  planStatus: PlanStatus
  editorType?: EditorType
  lang: Language
  isPrimaryLoading?: boolean
  onChangeSettings: React.Dispatch<Partial<AppStates>>
  onCreatePalette?: () => void
  onSyncLocalStyles?: () => void
  onSyncLocalVariables?: () => void
  onPublishPalette?: () => void
}

interface SettingsStates {
  context: Context | ''
}

export default class Settings extends PureComponent<
  SettingsProps,
  SettingsStates
> {
  private settingsMessage: SettingsMessage
  private dispatch: { [key: string]: DispatchProcess }
  private contexts: Array<ContextItem>

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
        algorithmVersion: algorithmVersion,
      },
      isEditedInRealTime: false,
    }
    this.contexts = setContexts(
      [
        'SETTINGS_PALETTE',
        this.props.service === 'EDIT' ? 'SETTINGS_PREFERENCES' : null,
      ].filter(Boolean) as Context[],
      props.planStatus
    )
    this.state = {
      context: this.contexts[0] !== undefined ? this.contexts[0].id : '',
    }
    this.dispatch = {
      textColorsTheme: new Dispatcher(
        () => parent.postMessage({ pluginMessage: this.settingsMessage }, '*'),
        500
      ) as DispatchProcess,
    }
  }

  // Handlers
  navHandler = (e: Event) =>
    this.setState({
      context: (e.target as HTMLElement).dataset.feature as Context,
    })

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
        this.props.algorithmVersion ?? algorithmVersion

      this.props.onChangeSettings({
        name: this.settingsMessage.data.name,
        onGoingStep: 'settings changed',
      })

      if (
        (e.type === 'focusout' || (e as KeyboardEvent).key === 'Enter') &&
        this.props.service === 'EDIT'
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
        this.props.algorithmVersion ?? algorithmVersion

      this.props.onChangeSettings({
        description: this.settingsMessage.data.description,
        onGoingStep: 'settings changed',
      })

      if (e.type === 'focusout' && this.props.service === 'EDIT') {
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

        if (this.props.service === 'EDIT') {
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
        this.props.algorithmVersion ?? algorithmVersion

      this.props.onChangeSettings({
        colorSpace: this.settingsMessage.data.colorSpace,
        onGoingStep: 'settings changed',
      })

      if (this.props.service === 'EDIT') {
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
        this.props.algorithmVersion ?? algorithmVersion

      this.props.onChangeSettings({
        visionSimulationMode: this.settingsMessage.data.visionSimulationMode,
        onGoingStep: 'settings changed',
      })

      if (this.props.service === 'EDIT') {
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

    const updateAlgorithmVersion = () => {
      palette.algorithmVersion = target.dataset
        .value as AlgorithmVersionConfiguration

      this.settingsMessage.data.name = this.props.name
      this.settingsMessage.data.description = this.props.description
      this.settingsMessage.data.colorSpace = this.props.colorSpace
      this.settingsMessage.data.visionSimulationMode =
        this.props.visionSimulationMode
      this.settingsMessage.data.textColorsTheme = this.props.textColorsTheme
      this.settingsMessage.data.algorithmVersion = target.dataset
        .value as AlgorithmVersionConfiguration

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
          this.props.algorithmVersion ?? algorithmVersion
      }

      this.props.onChangeSettings({
        textColorsTheme: this.settingsMessage.data.textColorsTheme,
        onGoingStep: 'settings changed',
      })

      if (e.type === 'focusout' && this.props.service === 'EDIT') {
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
      } else if (this.props.service === 'EDIT')
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
          this.props.algorithmVersion ?? algorithmVersion
      }

      this.props.onChangeSettings({
        textColorsTheme: this.settingsMessage.data.textColorsTheme,
        onGoingStep: 'settings changed',
      })

      if (e.type === 'focusout' && this.props.service === 'EDIT') {
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
      } else if (this.props.service === 'EDIT')
        this.dispatch.textColorsTheme.on.status = true
    }

    const updatePaletteDeepSync = () =>
      parent.postMessage(
        {
          pluginMessage: {
            type: 'SET_ITEMS',
            items: [
              {
                key: 'can_deep_sync_palette',
                value: target.checked,
              },
            ],
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
      UPDATE_ALGORITHM_VERSION: () => updateAlgorithmVersion(),
      UPDATE_TEXT_LIGHT_COLOR: () => updateTextLightColor(),
      UPDATE_TEXT_DARK_COLOR: () => updateTextDarkColor(),
      UPDATE_PALETTE_DEEP_SYNC: () => updatePaletteDeepSync(),
      UPDATE_VARIABLES_DEEP_SYNC: () => updateVariablesDeepSync(),
      UPDATE_STYLES_DEEP_SYNC: () => updateStylesDeepSync(),
      DEFAULT: () => null,
    }

    return actions[feature ?? 'DEFAULT']?.()
  }

  // Templates
  Palette = () => {
    return (
      <>
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
            isLast={this.props.service === 'CREATE'}
            onChangeSettings={this.settingsHandler}
          />
        </Feature>
      </>
    )
  }

  Preferences = () => {
    return (
      <Feature
        isActive={Settings.features(
          this.props.planStatus
        ).SETTINGS_SYNC.isActive()}
      >
        <SyncPreferences
          {...this.props}
          onChangeSettings={this.settingsHandler}
        />
      </Feature>
    )
  }

  render() {
    return (
      <>
        {this.contexts.length > 1 && (
          <Bar
            leftPartSlot={
              <Tabs
                tabs={this.contexts}
                active={this.state.context ?? ''}
                action={this.navHandler}
              />
            }
            border={['BOTTOM']}
            isOnlyText={true}
          />
        )}
        <div className="controls__control">
          <div className="control__block control__block--no-padding">
            {this.state.context === 'SETTINGS_PALETTE' && <this.Palette />}
            {this.state.context === 'SETTINGS_PREFERENCES' && (
              <this.Preferences />
            )}
          </div>
          {this.props.service === 'CREATE' ? (
            <Actions
              {...this.props}
              service="CREATE"
            />
          ) : (
            <Actions
              {...this.props}
              service="EDIT"
            />
          )}
        </div>
      </>
    )
  }
}
