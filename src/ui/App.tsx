import { Consent, ConsentConfiguration } from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import 'figma-plugin-ds/dist/figma-plugin-ds.css'
import { Component } from 'preact/compat'
import React from 'react'

import checkConnectionStatus from '../bridges/checks/checkConnectionStatus'
import { supabase } from '../bridges/publication/authentication'
import { locals } from '../content/locals'
import {
  EditorType,
  HighlightDigest,
  Language,
  NamingConvention,
  PlanStatus,
  PriorityContext,
  Service,
  TrialStatus,
  Easing,
} from '../types/app'
import {
  AlgorithmVersionConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  CreatorConfiguration,
  DatesConfiguration,
  ExportConfiguration,
  ExtractOfPaletteConfiguration,
  PresetConfiguration,
  PublicationConfiguration,
  ScaleConfiguration,
  SourceColorConfiguration,
  ThemeConfiguration,
  UserConfiguration,
  ViewConfiguration,
  VisionSimulationModeConfiguration,
} from '../types/configurations'
import { ActionsList, TextColorsThemeHexModel } from '../types/models'
import { UserSession } from '../types/user'
import features, {
  announcementsWorkerUrl,
  trialTime,
  userConsentVersion,
} from '../config'
import {
  trackEditorEvent,
  trackExportEvent,
  trackPurchaseEvent,
  trackTrialEnablementEvent,
  trackUserConsentEvent,
} from '../utils/eventsTracker'
import { defaultPreset, palette, presets } from '../utils/palettePackage'
import { userConsent } from '../utils/userConsent'
import Feature from './components/Feature'
import PriorityContainer from './modules/PriorityContainer'
import Shortcuts from './modules/Shortcuts'
import CreatePalette from './services/CreatePalette'
import EditPalette from './services/EditPalette'
import TransferPalette from './services/TransferPalette'
import './stylesheets/app-components.css'
import './stylesheets/app.css'
import doLightnessScale from '../utils/doLightnessScale'

export interface AppStates {
  service: Service
  sourceColors: Array<SourceColorConfiguration>
  id: string
  name: string
  description: string
  preset: PresetConfiguration
  namingConvention: NamingConvention
  distributionEasing: Easing
  scale: ScaleConfiguration
  colors: Array<ColorConfiguration>
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  themes: Array<ThemeConfiguration>
  view: ViewConfiguration
  textColorsTheme: TextColorsThemeHexModel
  algorithmVersion: AlgorithmVersionConfiguration
  screenshot: Uint8Array | null
  dates: DatesConfiguration
  export: ExportConfiguration
  palettesList: Array<ExtractOfPaletteConfiguration>
  editorType: EditorType
  planStatus: PlanStatus
  trialStatus: TrialStatus
  trialRemainingTime: number
  publicationStatus: PublicationConfiguration
  creatorIdentity: CreatorConfiguration
  userIdentity: UserConfiguration
  userSession: UserSession
  userConsent: Array<ConsentConfiguration>
  priorityContainerContext: PriorityContext
  lang: Language
  mustUserConsent: boolean
  highlight: HighlightDigest
  isLoaded: boolean
  onGoingStep: string
}

let isPaletteSelected = false

export default class App extends Component<Record<string, never>, AppStates> {
  static features = (planStatus: PlanStatus) => ({
    CREATE: new FeatureStatus({
      features: features,
      featureName: 'CREATE',
      planStatus: planStatus,
    }),
    EDIT: new FeatureStatus({
      features: features,
      featureName: 'EDIT',
      planStatus: planStatus,
    }),
    TRANSFER: new FeatureStatus({
      features: features,
      featureName: 'TRANSFER',
      planStatus: planStatus,
    }),
    CONSENT: new FeatureStatus({
      features: features,
      featureName: 'CONSENT',
      planStatus: planStatus,
    }),
    SHORTCUTS: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS',
      planStatus: planStatus,
    }),
  })

  constructor(props: Record<string, never>) {
    super(props)
    this.state = {
      service: 'CREATE',
      sourceColors: [],
      id: '',
      name: '',
      description: '',
      preset:
        presets.find((preset) => preset.id === 'MATERIAL') ?? defaultPreset,
      namingConvention: 'ONES',
      distributionEasing: 'LINEAR',
      scale: {},
      colors: [],
      colorSpace: 'LCH',
      visionSimulationMode: 'NONE',
      themes: [],
      view: 'PALETTE_WITH_PROPERTIES',
      textColorsTheme: {
        lightColor: '#FFFFFF',
        darkColor: '#000000',
      },
      algorithmVersion: 'v2',
      screenshot: null,
      dates: {
        createdAt: '',
        updatedAt: '',
        publishedAt: '',
      },
      export: {
        format: 'JSON',
        context: 'TOKENS_GLOBAL',
        label: '',
        colorSpace: 'RGB',
        mimeType: 'application/json',
        data: '',
      },
      palettesList: [],
      editorType: 'figma',
      planStatus: 'UNPAID',
      trialStatus: 'UNUSED',
      trialRemainingTime: trialTime,
      publicationStatus: {
        isPublished: false,
        isShared: false,
      },
      creatorIdentity: {
        creatorFullName: '',
        creatorAvatar: '',
        creatorId: '',
      },
      priorityContainerContext: 'EMPTY',
      lang: 'en-US',
      userSession: {
        connectionStatus: 'UNCONNECTED',
        userFullName: '',
        userAvatar: '',
        userId: undefined,
        accessToken: undefined,
        refreshToken: undefined,
      },
      userConsent: userConsent,
      userIdentity: {
        id: '',
        fullName: '',
        avatar: '',
      },
      mustUserConsent: true,
      highlight: {
        version: '',
        status: 'NO_HIGHLIGHT',
      },
      isLoaded: false,
      onGoingStep: '',
    }
  }

  componentDidMount = async () => {
    setTimeout(() => this.setState({ isLoaded: true }), 1000)
    this.setState({
      scale: doLightnessScale(
        this.state.preset.scale,
        this.state.preset.min,
        this.state.preset.max,
        this.state.preset.isDistributed,
        this.props.distributionEasing
      ),
    })
    fetch(
      `${announcementsWorkerUrl}/?action=get_version&database_id=${process.env.REACT_APP_NOTION_ANNOUNCEMENTS_ID}`
    )
      .then((response) => response.json())
      .then((data) => {
        parent.postMessage(
          {
            pluginMessage: {
              type: 'CHECK_HIGHLIGHT_STATUS',
              version: data.version,
            },
          },
          '*'
        )
        this.setState({
          highlight: {
            version: data.version,
            status: 'NO_HIGHLIGHT',
          },
        })
      })
      .catch((error) => console.error(error))
    supabase.auth.onAuthStateChange((event, session) => {
      const actions: ActionsList = {
        SIGNED_IN: () => {
          this.setState({
            userSession: {
              connectionStatus: 'CONNECTED',
              userFullName: session?.user.user_metadata.full_name,
              userAvatar: session?.user.user_metadata.avatar_url,
              userId: session?.user.id,
              accessToken: session?.access_token,
              refreshToken: session?.refresh_token,
            },
          })
          parent.postMessage(
            {
              pluginMessage: {
                type: 'SEND_MESSAGE',
                message: locals[this.state.lang].user.welcomeMessage.replace(
                  '$[]',
                  session?.user.user_metadata.full_name
                ),
              },
            },
            '*'
          )
        },
        TOKEN_REFRESHED: () => {
          this.setState({
            userSession: {
              connectionStatus: 'CONNECTED',
              userFullName: session?.user.user_metadata.full_name,
              userAvatar: session?.user.user_metadata.avatar_url,
              userId: session?.user.id,
              accessToken: session?.access_token,
              refreshToken: session?.refresh_token,
            },
          })
          parent.postMessage(
            {
              pluginMessage: {
                type: 'SET_ITEMS',
                items: [
                  {
                    key: 'supabase_access_token',
                    value: session?.access_token,
                  },
                  {
                    key: 'supabase_refresh_token',
                    value: session?.refresh_token,
                  },
                ],
              },
              pluginId: '1063959496693642315',
            },
            'https://www.figma.com'
          )
        },
      }
      // console.log(event, session)
      return actions[event]?.()
    })
    onmessage = (e: MessageEvent) => {
      try {
        const checkUserAuthentication = async () => {
          await checkConnectionStatus(
            e.data.pluginMessage.data.accessToken,
            e.data.pluginMessage.data.refreshToken
          )
          this.setState({
            userIdentity: {
              id: e.data.pluginMessage.id,
              fullName: e.data.pluginMessage.data.fullName,
              avatar: e.data.pluginMessage.data.avatar,
            },
          })
        }

        const checkUserConsent = () =>
          this.setState({
            mustUserConsent: e.data.pluginMessage.mustUserConsent,
            userConsent: e.data.pluginMessage.userConsent,
          })

        const checkEditorType = () => {
          this.setState({ editorType: e.data.pluginMessage.data })
          setTimeout(
            () =>
              trackEditorEvent(
                e.data.pluginMessage.id,
                this.state.userConsent.find(
                  (consent) => consent.id === 'mixpanel'
                )?.isConsented ?? false,
                {
                  editor: e.data.pluginMessage.data,
                }
              ),
            1000
          )
        }

        const handleHighlight = () => {
          this.setState({
            priorityContainerContext:
              e.data.pluginMessage.data !== 'DISPLAY_HIGHLIGHT_DIALOG'
                ? 'EMPTY'
                : 'HIGHLIGHT',
            highlight: {
              version: this.state.highlight.version,
              status: e.data.pluginMessage.data,
            },
          })
        }

        const checkPlanStatus = () =>
          this.setState({
            planStatus: e.data.pluginMessage.data.planStatus,
            trialStatus: e.data.pluginMessage.data.trialStatus,
            trialRemainingTime: e.data.pluginMessage.data.trialRemainingTime,
          })

        const updateWhileEmptySelection = () => {
          if (isPaletteSelected) {
            const preset =
              presets.find((preset) => preset.id === 'MATERIAL') ??
              defaultPreset
            const scale = doLightnessScale(
              preset.scale,
              preset.min,
              preset.max,
              preset.isDistributed,
              this.props.distributionEasing
            )

            this.setState({
              id: '',
              name: '',
              description: '',
              preset: preset,
              scale: scale,
              colorSpace: 'LCH',
              visionSimulationMode: 'NONE',
              view: 'PALETTE_WITH_PROPERTIES',
              textColorsTheme: {
                lightColor: '#FFFFFF',
                darkColor: '#000000',
              },
              algorithmVersion: 'v2',
              screenshot: null,
              dates: {
                createdAt: '',
                updatedAt: '',
                publishedAt: '',
              },
              publicationStatus: {
                isPublished: false,
                isShared: false,
              },
              creatorIdentity: {
                creatorFullName: '',
                creatorAvatar: '',
                creatorId: '',
              },
              priorityContainerContext: (() => {
                if (this.state.priorityContainerContext === 'PUBLICATION')
                  return 'EMPTY'
                else return this.state.priorityContainerContext
              })(),
              onGoingStep: 'selection empty',
            })
            palette.name = ''
            palette.description = ''
            palette.preset = defaultPreset
            palette.scale = scale
            palette.colorSpace = 'LCH'
            palette.visionSimulationMode = 'NONE'
            palette.view = 'PALETTE_WITH_PROPERTIES'
            palette.textColorsTheme = {
              lightColor: '#FFFFFF',
              darkColor: '#000000',
            }
          }
          this.setState({
            service: 'CREATE',
            sourceColors: this.state.sourceColors.filter(
              (sourceColor: SourceColorConfiguration) =>
                sourceColor.source !== 'CANVAS'
            ),
            onGoingStep: 'selection empty',
          })

          isPaletteSelected = false
        }

        const updateWhileColorSelected = () => {
          if (isPaletteSelected) {
            const preset =
              presets.find((preset) => preset.id === 'MATERIAL') ??
              defaultPreset
            const scale = doLightnessScale(
              preset.scale,
              preset.min,
              preset.max,
              preset.isDistributed,
              this.props.distributionEasing
            )

            this.setState({
              id: '',
              name: '',
              description: '',
              preset:
                presets.find((preset) => preset.id === 'MATERIAL') ??
                defaultPreset,
              scale: scale,
              colorSpace: 'LCH',
              visionSimulationMode: 'NONE',
              view: 'PALETTE_WITH_PROPERTIES',
              textColorsTheme: {
                lightColor: '#FFFFFF',
                darkColor: '#000000',
              },
              algorithmVersion: 'v2',
              screenshot: null,
              dates: {
                createdAt: '',
                updatedAt: '',
                publishedAt: '',
              },
              publicationStatus: {
                isPublished: false,
                isShared: false,
              },
              creatorIdentity: {
                creatorFullName: '',
                creatorAvatar: '',
                creatorId: '',
              },
              priorityContainerContext: (() => {
                if (this.state.priorityContainerContext === 'PUBLICATION')
                  return 'EMPTY'
                else return this.state.priorityContainerContext
              })(),
            })
            palette.name = ''
            palette.description = ''
            palette.preset =
              presets.find((preset) => preset.id === 'MATERIAL') ??
              defaultPreset
            palette.scale = scale
            palette.colorSpace = 'LCH'
            palette.visionSimulationMode = 'NONE'
            palette.view = 'PALETTE_WITH_PROPERTIES'
            palette.textColorsTheme = {
              lightColor: '#FFFFFF',
              darkColor: '#000000',
            }
          }
          this.setState({
            service: 'CREATE',
            sourceColors: this.state.sourceColors
              .filter(
                (sourceColor: SourceColorConfiguration) =>
                  sourceColor.source !== 'CANVAS'
              )
              .concat(e.data.pluginMessage.data.selection),
            onGoingStep: 'colors selected',
          })
          isPaletteSelected = false
        }

        const updateWhilePaletteSelected = () => {
          isPaletteSelected = true
          palette.preset = e.data.pluginMessage.data.preset
          parent.postMessage(
            {
              pluginMessage: {
                type: 'EXPORT_PALETTE',
                export: this.state.export.context,
                colorSpace: this.state.export.colorSpace,
              },
            },
            '*'
          )
          parent.postMessage(
            {
              pluginMessage: {
                type: 'UPDATE_SCREENSHOT',
              },
            },
            '*'
          )
          this.setState({
            service:
              e.data.pluginMessage.data.editorType !== 'dev'
                ? 'EDIT'
                : 'TRANSFER',
            sourceColors: [],
            id: e.data.pluginMessage.data.id,
            name: e.data.pluginMessage.data.name,
            description: e.data.pluginMessage.data.description,
            preset: e.data.pluginMessage.data.preset,
            scale: e.data.pluginMessage.data.scale,
            colors: e.data.pluginMessage.data.colors,
            colorSpace: e.data.pluginMessage.data.colorSpace,
            visionSimulationMode:
              e.data.pluginMessage.data.visionSimulationMode,
            themes: e.data.pluginMessage.data.themes,
            view: e.data.pluginMessage.data.view,
            textColorsTheme: e.data.pluginMessage.data.textColorsTheme,
            algorithmVersion: e.data.pluginMessage.data.algorithmVersion,
            screenshot: e.data.pluginMessage.data.screenshot,
            dates: {
              createdAt: e.data.pluginMessage.data.createdAt,
              updatedAt: e.data.pluginMessage.data.updatedAt,
              publishedAt: e.data.pluginMessage.data.publishedAt,
            },
            publicationStatus: {
              isPublished: e.data.pluginMessage.data.isPublished,
              isShared: e.data.pluginMessage.data.isShared,
            },
            creatorIdentity: {
              creatorFullName: e.data.pluginMessage.data.creatorFullName,
              creatorAvatar: e.data.pluginMessage.data.creatorAvatar,
              creatorId: e.data.pluginMessage.data.creatorId,
            },
            onGoingStep: 'palette selected',
          })
        }

        const exportPaletteToJson = () => {
          this.setState({
            export: {
              format: 'JSON',
              context: e.data.pluginMessage.context,
              label: `${locals[this.state.lang].actions.export} ${
                locals[this.state.lang].export.tokens.label
              }`,
              colorSpace: 'RGB',
              mimeType: 'application/json',
              data: e.data.pluginMessage.data,
            },
            onGoingStep: 'export previewed',
          })
          if (e.data.pluginMessage.context !== 'TOKENS_GLOBAL')
            trackExportEvent(
              e.data.pluginMessage.id,
              this.state.userConsent.find(
                (consent) => consent.id === 'mixpanel'
              )?.isConsented ?? false,
              {
                feature: e.data.pluginMessage.context,
              }
            )
        }

        const exportPaletteToCss = () => {
          this.setState({
            export: {
              format: 'CSS',
              colorSpace: e.data.pluginMessage.colorSpace,
              context: e.data.pluginMessage.context,
              label: `${locals[this.state.lang].actions.export} ${
                locals[this.state.lang].export.css.customProperties
              }`,
              mimeType: 'text/css',
              data: e.data.pluginMessage.data,
            },
            onGoingStep: 'export previewed',
          })
          trackExportEvent(
            e.data.pluginMessage.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: e.data.pluginMessage.context,
              colorSpace: e.data.pluginMessage.colorSpace,
            }
          )
        }

        const exportPaletteToTaiwind = () => {
          this.setState({
            export: {
              format: 'TAILWIND',
              context: e.data.pluginMessage.context,
              label: `${locals[this.state.lang].actions.export} ${
                locals[this.state.lang].export.tailwind.config
              }`,
              colorSpace: 'HEX',
              mimeType: 'text/javascript',
              data: `/** @type {import('tailwindcss').Config} */\nmodule.exports = ${JSON.stringify(
                e.data.pluginMessage.data,
                null,
                '  '
              )}`,
            },
            onGoingStep: 'export previewed',
          })
          trackExportEvent(
            e.data.pluginMessage.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: e.data.pluginMessage.context,
            }
          )
        }

        const exportPaletteToSwiftUI = () => {
          this.setState({
            export: {
              format: 'SWIFT',
              context: e.data.pluginMessage.context,
              label: `${locals[this.state.lang].actions.export} ${
                locals[this.state.lang].export.apple.swiftui
              }`,
              colorSpace: 'HEX',
              mimeType: 'text/swift',
              data: e.data.pluginMessage.data,
            },
            onGoingStep: 'export previewed',
          })
          trackExportEvent(
            e.data.pluginMessage.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: e.data.pluginMessage.context,
            }
          )
        }

        const exportPaletteToUIKit = () => {
          this.setState({
            export: {
              format: 'SWIFT',
              context: e.data.pluginMessage.context,
              label: `${locals[this.state.lang].actions.export} ${
                locals[this.state.lang].export.apple.uikit
              }`,
              colorSpace: 'HEX',
              mimeType: 'text/swift',
              data: e.data.pluginMessage.data,
            },
            onGoingStep: 'export previewed',
          })
          trackExportEvent(
            e.data.pluginMessage.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: e.data.pluginMessage.context,
            }
          )
        }

        const exportPaletteToKt = () => {
          this.setState({
            export: {
              format: 'KT',
              context: e.data.pluginMessage.context,
              label: `${locals[this.state.lang].actions.export} ${
                locals[this.state.lang].export.android.compose
              }`,
              colorSpace: 'HEX',
              mimeType: 'text/x-kotlin',
              data: e.data.pluginMessage.data,
            },
            onGoingStep: 'export previewed',
          })
          trackExportEvent(
            e.data.pluginMessage.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: e.data.pluginMessage.context,
            }
          )
        }

        const exportPaletteToXml = () => {
          this.setState({
            export: {
              format: 'XML',
              context: e.data.pluginMessage.context,
              label: `${locals[this.state.lang].actions.export} ${
                locals[this.state.lang].export.android.resources
              }`,
              colorSpace: 'HEX',
              mimeType: 'text/xml',
              data: e.data.pluginMessage.data,
            },
            onGoingStep: 'export previewed',
          })
          trackExportEvent(
            e.data.pluginMessage.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: e.data.pluginMessage.context,
            }
          )
        }

        const exportPaletteToCsv = () => {
          this.setState({
            export: {
              format: 'CSV',
              context: e.data.pluginMessage.context,
              label: `${locals[this.state.lang].actions.export} ${
                locals[this.state.lang].export.csv.spreadsheet
              }`,
              colorSpace: 'HEX',
              mimeType: 'text/csv',
              data: e.data.pluginMessage.data,
            },
            onGoingStep: 'export previewed',
          })
          trackExportEvent(
            e.data.pluginMessage.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: e.data.pluginMessage.context,
            }
          )
        }

        const exposePalettes = (data: Array<ExtractOfPaletteConfiguration>) =>
          this.setState({
            palettesList: data,
          })

        const updateScreenshot = (bytes: Uint8Array) =>
          this.setState({
            screenshot: bytes,
          })

        const updatePaletteDate = (date: Date) =>
          this.setState({
            dates: {
              createdAt: this.state.dates['createdAt'],
              updatedAt: date,
              publishedAt: this.state.dates['publishedAt'],
            },
          })

        const getProPlan = () => {
          this.setState({
            planStatus: e.data.pluginMessage.data,
            priorityContainerContext: 'WELCOME_TO_PRO',
          })
          trackPurchaseEvent(
            e.data.pluginMessage.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false
          )
        }

        const enableTrial = () => {
          this.setState({
            planStatus: 'PAID',
            trialStatus: 'PENDING',
            priorityContainerContext: 'WELCOME_TO_TRIAL',
          })
          trackTrialEnablementEvent(
            e.data.pluginMessage.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              date: e.data.pluginMessage.date,
              trialTime: e.data.pluginMessage.trialTime,
            }
          )
        }

        const signOut = (data: UserSession) =>
          this.setState({
            userSession: data,
          })

        const actions: ActionsList = {
          CHECK_USER_AUTHENTICATION: () => checkUserAuthentication(),
          CHECK_USER_CONSENT: () => checkUserConsent(),
          CHECK_EDITOR_TYPE: () => checkEditorType(),
          PUSH_HIGHLIGHT_STATUS: () => handleHighlight(),
          CHECK_PLAN_STATUS: () => checkPlanStatus(),
          EMPTY_SELECTION: () => updateWhileEmptySelection(),
          COLOR_SELECTED: () => updateWhileColorSelected(),
          PALETTE_SELECTED: () => updateWhilePaletteSelected(),
          EXPORT_PALETTE_JSON: () => exportPaletteToJson(),
          EXPORT_PALETTE_CSS: () => exportPaletteToCss(),
          EXPORT_PALETTE_TAILWIND: () => exportPaletteToTaiwind(),
          EXPORT_PALETTE_SWIFTUI: () => exportPaletteToSwiftUI(),
          EXPORT_PALETTE_UIKIT: () => exportPaletteToUIKit(),
          EXPORT_PALETTE_KT: () => exportPaletteToKt(),
          EXPORT_PALETTE_XML: () => exportPaletteToXml(),
          EXPORT_PALETTE_CSV: () => exportPaletteToCsv(),
          EXPOSE_PALETTES: () => exposePalettes(e.data.pluginMessage?.data),
          UPDATE_SCREENSHOT: () => updateScreenshot(e.data.pluginMessage?.data),
          UPDATE_PALETTE_DATE: () =>
            updatePaletteDate(e.data.pluginMessage?.data),
          GET_PRO_PLAN: () => getProPlan(),
          ENABLE_TRIAL: () => enableTrial(),
          SIGN_OUT: () => signOut(e.data.pluginMessage?.data),
          DEFAULT: () => null,
        }

        return actions[e.data.pluginMessage?.type ?? 'DEFAULT']?.()
      } catch (error) {
        console.error(error)
      }
    }
  }

  // Handlers
  userConsentHandler = (e: Array<ConsentConfiguration>) => {
    this.setState({
      userConsent: e,
      mustUserConsent: false,
    })
    parent.postMessage(
      {
        pluginMessage: {
          type: 'SET_ITEMS',
          items: [
            {
              key: 'mixpanel_user_consent',
              value: e.find((consent) => consent.id === 'mixpanel')
                ?.isConsented,
            },
            {
              key: 'user_consent_version',
              value: userConsentVersion,
            },
          ],
        },
        pluginId: '1063959496693642315',
      },
      'https://www.figma.com'
    )
    parent.postMessage(
      {
        pluginMessage: {
          type: 'CHECK_USER_CONSENT',
        },
      },
      '*'
    )
    trackUserConsentEvent(e)
  }

  // Render
  render() {
    if (this.state.isLoaded)
      return (
        <main className="ui">
          <Feature
            isActive={
              App.features(this.props.planStatus).CREATE.isActive() &&
              this.state.editorType !== 'dev' &&
              this.state.service === 'CREATE'
            }
          >
            <CreatePalette
              {...this.state}
              onChangeColorsFromImport={(e) =>
                this.setState({ ...this.state, ...e })
              }
              onChangeScale={(e) => this.setState({ ...this.state, ...e })}
              onChangePreset={(e) => this.setState({ ...this.state, ...e })}
              onCustomPreset={(e) => this.setState({ ...this.state, ...e })}
              onChangeSettings={(e) => this.setState({ ...this.state, ...e })}
              onConfigureExternalSourceColors={(e) =>
                this.setState({ ...this.state, ...e })
              }
            />
          </Feature>
          <Feature
            isActive={
              App.features(this.props.planStatus).EDIT.isActive() &&
              this.state.editorType !== 'dev' &&
              this.state.service === 'EDIT'
            }
          >
            <EditPalette
              {...this.state}
              onChangeScale={(e) => this.setState({ ...this.state, ...e })}
              onChangeStop={(e) => this.setState({ ...this.state, ...e })}
              onChangeColors={(e) => this.setState({ ...this.state, ...e })}
              onChangeThemes={(e) => this.setState({ ...this.state, ...e })}
              onChangeSettings={(e) => this.setState({ ...this.state, ...e })}
              onPublishPalette={() =>
                this.setState({ priorityContainerContext: 'PUBLICATION' })
              }
            />
          </Feature>
          <Feature
            isActive={
              App.features(this.props.planStatus).TRANSFER.isActive() &&
              this.state.editorType === 'dev'
            }
          >
            <TransferPalette {...this.state} />
          </Feature>
          <Feature isActive={this.state.priorityContainerContext !== 'EMPTY'}>
            <PriorityContainer
              context={this.state.priorityContainerContext}
              rawData={this.state}
              {...this.state}
              onChangePublication={(e) =>
                this.setState({ ...this.state, ...e })
              }
              onClose={() =>
                this.setState({
                  priorityContainerContext: 'EMPTY',
                  highlight: {
                    version: this.state.highlight.version,
                    status: 'NO_HIGHLIGHT',
                  },
                })
              }
            />
          </Feature>
          <Feature
            isActive={
              this.state.mustUserConsent &&
              App.features(this.props.planStatus).CONSENT.isActive()
            }
          >
            <Consent
              welcomeMessage={locals[this.state.lang].user.cookies.welcome}
              vendorsMessage={locals[this.state.lang].user.cookies.vendors}
              privacyPolicy={{
                label: locals[this.state.lang].user.cookies.privacyPolicy,
                action: () =>
                  parent.postMessage(
                    {
                      pluginMessage: {
                        type: 'OPEN_IN_BROWSER',
                        url: 'https://uicp.link/privacy',
                      },
                    },
                    '*'
                  ),
              }}
              moreDetailsLabel={locals[this.state.lang].user.cookies.customize}
              lessDetailsLabel={locals[this.state.lang].user.cookies.back}
              consentActions={{
                consent: {
                  label: locals[this.state.lang].user.cookies.consent,
                  action: this.userConsentHandler,
                },
                deny: {
                  label: locals[this.state.lang].user.cookies.deny,
                  action: this.userConsentHandler,
                },
                save: {
                  label: locals[this.state.lang].user.cookies.save,
                  action: this.userConsentHandler,
                },
                close: {
                  action: () => this.setState({ mustUserConsent: false }),
                },
              }}
              validVendor={{
                name: locals[this.state.lang].vendors.functional.name,
                id: 'functional',
                icon: '',
                description:
                  locals[this.state.lang].vendors.functional.description,
                isConsented: true,
              }}
              vendorsList={this.state.userConsent}
            />
          </Feature>
          <Feature
            isActive={App.features(this.props.planStatus).SHORTCUTS.isActive()}
          >
            <Shortcuts
              {...this.state}
              onReOpenHighlight={() =>
                this.setState({ priorityContainerContext: 'HIGHLIGHT' })
              }
              onReOpenAbout={() =>
                this.setState({ priorityContainerContext: 'ABOUT' })
              }
              onReOpenReport={() =>
                this.setState({ priorityContainerContext: 'REPORT' })
              }
              onGetProPlan={() => {
                if (this.state.trialStatus === 'EXPIRED')
                  parent.postMessage(
                    { pluginMessage: { type: 'GET_PRO_PLAN' } },
                    '*'
                  )
                else this.setState({ priorityContainerContext: 'TRY' })
              }}
              onUpdateConsent={() => this.setState({ mustUserConsent: true })}
            />
          </Feature>
        </main>
      )
  }
}
