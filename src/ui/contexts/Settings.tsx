import {
  ConsentConfiguration,
  Dropdown,
  FormItem,
  HexModel,
  Input,
  Message,
  SectionTitle,
  Select,
} from '@a_ng_d/figmug-ui'
import React from 'react'

import { locals } from '../../content/locals'
import { EditorType, Language, PlanStatus } from '../../types/app'
import {
  AlgorithmVersionConfiguration,
  ColorSpaceConfiguration,
  SourceColorConfiguration,
  ViewConfiguration,
  VisionSimulationModeConfiguration,
} from '../../types/configurations'
import { SettingsMessage } from '../../types/messages'
import {
  ActionsList,
  DispatchProcess,
  TextColorsThemeHexModel,
} from '../../types/models'
import { Identity } from '../../types/user'
import features from '../../utils/config'
import { trackSettingsManagementEvent } from '../../utils/eventsTracker'
import isBlocked from '../../utils/isBlocked'
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
  identity?: Identity
  userConsent: Array<ConsentConfiguration>
  planStatus: PlanStatus
  editorType?: EditorType
  lang: Language
  figmaUserId: string
  onChangeSettings: React.Dispatch<Partial<AppStates>>
  onCreatePalette?: () => void
  onSyncLocalStyles?: () => void
  onSyncLocalVariables?: () => void
  onPublishPalette?: () => void
}

export default class Settings extends React.Component<SettingsProps> {
  settingsMessage: SettingsMessage
  dispatch: { [key: string]: DispatchProcess }

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
  settingsHandler = (e: any) => {
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
        (e.type === 'blur' || e.key === 'Enter') &&
        this.props.context === 'LOCAL_STYLES'
      ) {
        parent.postMessage({ pluginMessage: this.settingsMessage }, '*')
        trackSettingsManagementEvent(
          this.props.figmaUserId,
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

      if (e.type === 'blur' && this.props.context === 'LOCAL_STYLES') {
        parent.postMessage({ pluginMessage: this.settingsMessage }, '*')
        trackSettingsManagementEvent(
          this.props.figmaUserId,
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
            this.props.figmaUserId,
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
          this.props.figmaUserId,
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
          this.props.figmaUserId,
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
        this.props.figmaUserId,
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

      if (e.type === 'blur' && this.props.context === 'LOCAL_STYLES') {
        this.dispatch.textColorsTheme.on.status = false
        parent.postMessage({ pluginMessage: this.settingsMessage }, '*')
        trackSettingsManagementEvent(
          this.props.figmaUserId,
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

      if (e.type === 'blur' && this.props.context === 'LOCAL_STYLES') {
        this.dispatch.textColorsTheme.on.status = false
        parent.postMessage({ pluginMessage: this.settingsMessage }, '*')
        trackSettingsManagementEvent(
          this.props.figmaUserId,
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
      CHANGE_TEXT_LIGHT_COLOR: () => updateTextLightColor(),
      CHANGE_TEXT_DARK_COLOR: () => updateTextDarkColor(),
      NULL: () => null,
    }

    return actions[feature ?? 'NULL']?.()
  }

  // Templates
  Name = () => {
    return (
      <Feature
        isActive={
          features.find((feature) => feature.name === 'SETTINGS_PALETTE_NAME')
            ?.isActive
        }
      >
        <div className="settings__item">
          <FormItem
            label={locals[this.props.lang].settings.global.name.label}
            id="update-palette-name"
            isBlocked={isBlocked(
              'SETTINGS_PALETTE_NAME',
              this.props.planStatus
            )}
          >
            <Input
              id="update-palette-name"
              type="TEXT"
              placeholder={locals[this.props.lang].name}
              value={this.props.name !== '' ? this.props.name : ''}
              charactersLimit={64}
              isBlocked={isBlocked(
                'SETTINGS_PALETTE_NAME',
                this.props.planStatus
              )}
              feature="RENAME_PALETTE"
              onChange={
                isBlocked('SETTINGS_PALETTE_NAME', this.props.planStatus)
                  ? () => null
                  : this.settingsHandler
              }
              onFocus={
                isBlocked('SETTINGS_PALETTE_NAME', this.props.planStatus)
                  ? () => null
                  : this.settingsHandler
              }
              onBlur={
                isBlocked('SETTINGS_PALETTE_NAME', this.props.planStatus)
                  ? () => null
                  : this.settingsHandler
              }
              onConfirm={
                isBlocked('SETTINGS_PALETTE_NAME', this.props.planStatus)
                  ? () => null
                  : this.settingsHandler
              }
            />
          </FormItem>
        </div>
      </Feature>
    )
  }

  Description = () => {
    return (
      <Feature
        isActive={
          features.find(
            (feature) => feature.name === 'SETTINGS_PALETTE_DESCRIPTION'
          )?.isActive
        }
      >
        <div className="settings__item">
          <FormItem
            label={locals[this.props.lang].settings.global.description.label}
            id="update-palette-description"
            isBlocked={isBlocked(
              'SETTINGS_PALETTE_DESCRIPTION',
              this.props.planStatus
            )}
          >
            <Input
              id="update-palette-description"
              type="LONG_TEXT"
              placeholder={
                locals[this.props.lang].global.description.placeholder
              }
              value={this.props.description}
              isBlocked={isBlocked(
                'SETTINGS_PALETTE_DESCRIPTION',
                this.props.planStatus
              )}
              feature="UPDATE_DESCRIPTION"
              isGrowing={true}
              onFocus={
                isBlocked('SETTINGS_PALETTE_DESCRIPTION', this.props.planStatus)
                  ? () => null
                  : this.settingsHandler
              }
              onBlur={
                isBlocked('SETTINGS_PALETTE_DESCRIPTION', this.props.planStatus)
                  ? () => null
                  : this.settingsHandler
              }
              onConfirm={
                isBlocked('SETTINGS_PALETTE_DESCRIPTION', this.props.planStatus)
                  ? () => null
                  : this.settingsHandler
              }
            />
          </FormItem>
        </div>
      </Feature>
    )
  }

  View = () => {
    return (
      <Feature
        isActive={
          features.find((feature) => feature.name === 'VIEWS')?.isActive
        }
      >
        <div className="settings__item">
          <FormItem
            id="change-view"
            label={locals[this.props.lang].settings.global.views.label}
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
                  isActive: features.find(
                    (feature) =>
                      feature.name === 'VIEWS_PALETTE_WITH_PROPERTIES'
                  )?.isActive,
                  isBlocked: isBlocked(
                    'VIEWS_PALETTE_WITH_PROPERTIES',
                    this.props.planStatus
                  ),
                  isNew: features.find(
                    (feature) =>
                      feature.name === 'VIEWS_PALETTE_WITH_PROPERTIES'
                  )?.isNew,
                  children: [],
                  action: this.settingsHandler,
                },
                {
                  label: locals[this.props.lang].settings.global.views.simple,
                  value: 'PALETTE',
                  feature: 'UPDATE_VIEW',
                  position: 1,
                  type: 'OPTION',
                  isActive: features.find(
                    (feature) => feature.name === 'VIEWS_PALETTE'
                  )?.isActive,
                  isBlocked: isBlocked('VIEWS_PALETTE', this.props.planStatus),
                  isNew: features.find(
                    (feature) => feature.name === 'VIEWS_PALETTE'
                  )?.isNew,
                  children: [],
                  action: this.settingsHandler,
                },
                {
                  label: locals[this.props.lang].settings.global.views.sheet,
                  value: 'SHEET',
                  feature: 'UPDATE_VIEW',
                  position: 2,
                  type: 'OPTION',
                  isActive: features.find(
                    (feature) => feature.name === 'VIEWS_SHEET'
                  )?.isActive,
                  isBlocked: isBlocked('VIEWS_SHEET', this.props.planStatus),
                  isNew: features.find(
                    (feature) => feature.name === 'VIEWS_SHEET'
                  )?.isNew,
                  children: [],
                  action: this.settingsHandler,
                },
              ]}
              selected={this.props.view}
              isNew={
                features.find((feature) => feature.name === 'VIEWS')?.isNew
              }
            />
          </FormItem>
        </div>
      </Feature>
    )
  }

  ColorSpace = () => {
    return (
      <Feature
        isActive={
          features.find((feature) => feature.name === 'SETTINGS_COLOR_SPACE')
            ?.isActive
        }
      >
        <div className="settings__item">
          <FormItem
            id="change-color-space"
            label={locals[this.props.lang].settings.color.colorSpace.label}
          >
            <Dropdown
              id="color-spaces"
              options={[
                {
                  label: locals[this.props.lang].settings.color.colorSpace.lch,
                  value: 'LCH',
                  feature: 'UPDATE_COLOR_SPACE',
                  position: 0,
                  type: 'OPTION',
                  isActive: features.find(
                    (feature) => feature.name === 'SETTINGS_COLOR_SPACE_LCH'
                  )?.isActive,
                  isBlocked: isBlocked(
                    'SETTINGS_COLOR_SPACE_LCH',
                    this.props.planStatus
                  ),
                  isNew: features.find(
                    (feature) => feature.name === 'SETTINGS_COLOR_SPACE_LCH'
                  )?.isNew,
                  children: [],
                  action: this.settingsHandler,
                },
                {
                  label:
                    locals[this.props.lang].settings.color.colorSpace.oklch,
                  value: 'OKLCH',
                  feature: 'UPDATE_COLOR_SPACE',
                  position: 1,
                  type: 'OPTION',
                  isActive: features.find(
                    (feature) => feature.name === 'SETTINGS_COLOR_SPACE_OKLCH'
                  )?.isActive,
                  isBlocked: isBlocked(
                    'SETTINGS_COLOR_SPACE_OKLCH',
                    this.props.planStatus
                  ),
                  isNew: features.find(
                    (feature) => feature.name === 'SETTINGS_COLOR_SPACE_OKLCH'
                  )?.isNew,
                  children: [],
                  action: this.settingsHandler,
                },
                {
                  label: locals[this.props.lang].settings.color.colorSpace.lab,
                  value: 'LAB',
                  feature: 'UPDATE_COLOR_SPACE',
                  position: 2,
                  type: 'OPTION',
                  isActive: features.find(
                    (feature) => feature.name === 'SETTINGS_COLOR_SPACE_LAB'
                  )?.isActive,
                  isBlocked: isBlocked(
                    'SETTINGS_COLOR_SPACE_LAB',
                    this.props.planStatus
                  ),
                  isNew: features.find(
                    (feature) => feature.name === 'SETTINGS_COLOR_SPACE_LAB'
                  )?.isNew,
                  children: [],
                  action: this.settingsHandler,
                },
                {
                  label:
                    locals[this.props.lang].settings.color.colorSpace.oklab,
                  value: 'OKLAB',
                  feature: 'UPDATE_COLOR_SPACE',
                  position: 3,
                  type: 'OPTION',
                  isActive: features.find(
                    (feature) => feature.name === 'SETTINGS_COLOR_SPACE_OKLAB'
                  )?.isActive,
                  isBlocked: isBlocked(
                    'SETTINGS_COLOR_SPACE_OKLAB',
                    this.props.planStatus
                  ),
                  isNew: features.find(
                    (feature) => feature.name === 'SETTINGS_COLOR_SPACE_OKLAB'
                  )?.isNew,
                  children: [],
                  action: this.settingsHandler,
                },
                {
                  label: locals[this.props.lang].settings.color.colorSpace.hsl,
                  value: 'HSL',
                  feature: 'UPDATE_COLOR_SPACE',
                  position: 4,
                  type: 'OPTION',
                  isActive: features.find(
                    (feature) => feature.name === 'SETTINGS_COLOR_SPACE_HSL'
                  )?.isActive,
                  isBlocked: isBlocked(
                    'SETTINGS_COLOR_SPACE_HSL',
                    this.props.planStatus
                  ),
                  isNew: features.find(
                    (feature) => feature.name === 'SETTINGS_COLOR_SPACE_HSL'
                  )?.isNew,
                  children: [],
                  action: this.settingsHandler,
                },
                {
                  label:
                    locals[this.props.lang].settings.color.colorSpace.hsluv,
                  value: 'HSLUV',
                  feature: 'UPDATE_COLOR_SPACE',
                  position: 5,
                  type: 'OPTION',
                  isActive: features.find(
                    (feature) => feature.name === 'SETTINGS_COLOR_SPACE_HSLUV'
                  )?.isActive,
                  isBlocked: isBlocked(
                    'SETTINGS_COLOR_SPACE_HSLUV',
                    this.props.planStatus
                  ),
                  isNew: features.find(
                    (feature) => feature.name === 'SETTINGS_COLOR_SPACE_HSLUV'
                  )?.isNew,
                  children: [],
                  action: this.settingsHandler,
                },
              ]}
              selected={this.props.colorSpace}
              isNew={
                features.find(
                  (feature) => feature.name === 'SETTINGS_COLOR_SPACE'
                )?.isNew
              }
            />
          </FormItem>
          {this.props.colorSpace === 'HSL' ? (
            <Message
              icon="warning"
              messages={[locals[this.props.lang].warning.hslColorSpace]}
              isBlocked={isBlocked(
                'SETTINGS_COLOR_SPACE',
                this.props.planStatus
              )}
            />
          ) : null}
        </div>
      </Feature>
    )
  }

  VisionSimulationMode = () => {
    return (
      <Feature
        isActive={
          features.find(
            (feature) => feature.name === 'SETTINGS_VISION_SIMULATION_MODE'
          )?.isActive
        }
      >
        <div className="settings__item">
          <FormItem
            id="change-color-blind-mode"
            label={
              locals[this.props.lang].settings.color.visionSimulationMode.label
            }
          >
            <Dropdown
              id="color-blind-modes"
              options={[
                {
                  label:
                    locals[this.props.lang].settings.color.visionSimulationMode
                      .none,
                  value: 'NONE',
                  feature: 'UPDATE_COLOR_BLIND_MODE',
                  position: 0,
                  type: 'OPTION',
                  isActive: features.find(
                    (feature) =>
                      feature.name === 'SETTINGS_VISION_SIMULATION_MODE_NONE'
                  )?.isActive,
                  isBlocked: isBlocked(
                    'SETTINGS_VISION_SIMULATION_MODE_NONE',
                    this.props.planStatus
                  ),
                  children: [],
                  action: this.settingsHandler,
                },
                {
                  label: null,
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
                  label:
                    locals[this.props.lang].settings.color.visionSimulationMode
                      .colorBlind,
                  value: null,
                  feature: null,
                  position: 2,
                  type: 'TITLE',
                  isActive: true,
                  isBlocked: false,
                  children: [],
                  action: () => null,
                },
                {
                  label:
                    locals[this.props.lang].settings.color.visionSimulationMode
                      .protanomaly,
                  value: 'PROTANOMALY',
                  feature: 'UPDATE_COLOR_BLIND_MODE',
                  position: 3,
                  type: 'OPTION',
                  isActive: features.find(
                    (feature) =>
                      feature.name ===
                      'SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY'
                  )?.isActive,
                  isBlocked: isBlocked(
                    'SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY',
                    this.props.planStatus
                  ),
                  isNew: features.find(
                    (feature) =>
                      feature.name ===
                      'SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY'
                  )?.isNew,
                  children: [],
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
                  isActive: features.find(
                    (feature) =>
                      feature.name ===
                      'SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA'
                  )?.isActive,
                  isBlocked: isBlocked(
                    'SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA',
                    this.props.planStatus
                  ),
                  isNew: features.find(
                    (feature) =>
                      feature.name ===
                      'SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA'
                  )?.isNew,
                  children: [],
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
                  isActive: features.find(
                    (feature) =>
                      feature.name ===
                      'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY'
                  )?.isActive,
                  isBlocked: isBlocked(
                    'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY',
                    this.props.planStatus
                  ),
                  isNew: features.find(
                    (feature) =>
                      feature.name ===
                      'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY'
                  )?.isNew,
                  children: [],
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
                  isActive: features.find(
                    (feature) =>
                      feature.name ===
                      'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA'
                  )?.isActive,
                  isBlocked: isBlocked(
                    'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA',
                    this.props.planStatus
                  ),
                  isNew: features.find(
                    (feature) =>
                      feature.name ===
                      'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA'
                  )?.isNew,
                  children: [],
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
                  isActive: features.find(
                    (feature) =>
                      feature.name ===
                      'SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY'
                  )?.isActive,
                  isBlocked: isBlocked(
                    'SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY',
                    this.props.planStatus
                  ),
                  isNew: features.find(
                    (feature) =>
                      feature.name ===
                      'SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY'
                  )?.isNew,
                  children: [],
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
                  isActive: features.find(
                    (feature) =>
                      feature.name ===
                      'SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA'
                  )?.isActive,
                  isBlocked: isBlocked(
                    'SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA',
                    this.props.planStatus
                  ),
                  isNew: features.find(
                    (feature) =>
                      feature.name ===
                      'SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA'
                  )?.isNew,
                  children: [],
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
                  isActive: features.find(
                    (feature) =>
                      feature.name ===
                      'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY'
                  )?.isActive,
                  isBlocked: isBlocked(
                    'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY',
                    this.props.planStatus
                  ),
                  isNew: features.find(
                    (feature) =>
                      feature.name ===
                      'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY'
                  )?.isNew,
                  children: [],
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
                  isActive: features.find(
                    (feature) =>
                      feature.name ===
                      'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA'
                  )?.isActive,
                  isBlocked: isBlocked(
                    'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA',
                    this.props.planStatus
                  ),
                  isNew: features.find(
                    (feature) =>
                      feature.name ===
                      'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA'
                  )?.isNew,
                  children: [],
                  action: this.settingsHandler,
                },
              ]}
              selected={this.props.visionSimulationMode}
              isNew={
                features.find(
                  (feature) =>
                    feature.name === 'SETTINGS_VISION_SIMULATION_MODE'
                )?.isNew
              }
            />
          </FormItem>
        </div>
      </Feature>
    )
  }

  NewAlgorithm = () => {
    return (
      <Feature
        isActive={
          features.find((feature) => feature.name === 'SETTINGS_NEW_ALGORITHM')
            ?.isActive
        }
      >
        <div className="settings__item">
          <Select
            id="update-algorithm"
            type="SWITCH_BUTTON"
            name="algorythm"
            label={locals[this.props.lang].settings.color.newAlgorithm.label}
            isChecked={this.props.algorithmVersion === 'v2' ? true : false}
            isBlocked={isBlocked(
              'SETTINGS_NEW_ALGORITHM',
              this.props.planStatus
            )}
            isNew={
              features.find(
                (feature) => feature.name === 'SETTINGS_NEW_ALGORITHM'
              )?.isNew
            }
            feature="UPDATE_ALGORITHM_VERSION"
            onChange={
              isBlocked('SETTINGS_NEW_ALGORITHM', this.props.planStatus)
                ? () => null
                : this.settingsHandler
            }
          />
          <Message
            icon="info"
            messages={[
              locals[this.props.lang].settings.color.newAlgorithm.description,
            ]}
            isBlocked={isBlocked(
              'SETTINGS_NEW_ALGORITHM',
              this.props.planStatus
            )}
          />
        </div>
      </Feature>
    )
  }

  TextColorsTheme = () => {
    return (
      <Feature
        isActive={
          features.find(
            (feature) => feature.name === 'SETTINGS_TEXT_COLORS_THEME'
          )?.isActive
        }
      >
        <div className="settings__item">
          <FormItem
            label={
              locals[this.props.lang].settings.contrast.textColors
                .textLightColor
            }
            id="change-text-light-color"
            isBlocked={isBlocked(
              'SETTINGS_TEXT_COLORS_THEME',
              this.props.planStatus
            )}
          >
            <Input
              id="change-text-light-color"
              type="COLOR"
              value={this.props.textColorsTheme?.lightColor ?? '#FFFFFF'}
              isBlocked={isBlocked(
                'SETTINGS_TEXT_COLORS_THEME',
                this.props.planStatus
              )}
              isDisabled={isBlocked(
                'SETTINGS_TEXT_COLORS_THEME',
                this.props.planStatus
              )}
              isNew={
                features.find(
                  (feature) => feature.name === 'SETTINGS_TEXT_COLORS_THEME'
                )?.isNew
              }
              feature="CHANGE_TEXT_LIGHT_COLOR"
              onChange={
                isBlocked('SETTINGS_TEXT_COLORS_THEME', this.props.planStatus)
                  ? () => null
                  : this.settingsHandler
              }
              onFocus={
                isBlocked('SETTINGS_TEXT_COLORS_THEME', this.props.planStatus)
                  ? () => null
                  : this.settingsHandler
              }
              onBlur={
                isBlocked('SETTINGS_TEXT_COLORS_THEME', this.props.planStatus)
                  ? () => null
                  : this.settingsHandler
              }
            />
          </FormItem>
          <FormItem
            label={
              locals[this.props.lang].settings.contrast.textColors.textDarkColor
            }
            id="change-text-dark-color"
            isBlocked={isBlocked(
              'SETTINGS_TEXT_COLORS_THEME',
              this.props.planStatus
            )}
          >
            <Input
              id="change-text-dark-color"
              type="COLOR"
              value={this.props.textColorsTheme?.darkColor ?? '#OOOOOO'}
              isBlocked={isBlocked(
                'SETTINGS_TEXT_COLORS_THEME',
                this.props.planStatus
              )}
              isDisabled={isBlocked(
                'SETTINGS_TEXT_COLORS_THEME',
                this.props.planStatus
              )}
              isNew={
                features.find(
                  (feature) => feature.name === 'SETTINGS_TEXT_COLORS_THEME'
                )?.isNew
              }
              feature="CHANGE_TEXT_DARK_COLOR"
              onChange={
                isBlocked('SETTINGS_TEXT_COLORS_THEME', this.props.planStatus)
                  ? () => null
                  : this.settingsHandler
              }
              onFocus={
                isBlocked('SETTINGS_TEXT_COLORS_THEME', this.props.planStatus)
                  ? () => null
                  : this.settingsHandler
              }
              onBlur={
                isBlocked('SETTINGS_TEXT_COLORS_THEME', this.props.planStatus)
                  ? () => null
                  : this.settingsHandler
              }
            />
          </FormItem>
          <Message
            icon="info"
            messages={[
              locals[this.props.lang].settings.contrast.textColors
                .textThemeColorsDescription,
            ]}
            isBlocked={isBlocked(
              'SETTINGS_NEW_ALGORITHM',
              this.props.planStatus
            )}
          />
        </div>
      </Feature>
    )
  }

  Global = () => {
    return (
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
    )
  }

  ColorManagement = () => {
    return (
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
    )
  }

  ContrastManagement = () => {
    return (
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
              isActive={
                features.find((feature) => feature.name === 'PREVIEW')?.isActive
              }
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
