import type { ConsentConfiguration, DropdownOption } from '@a_ng_d/figmug-ui'
import { Bar, Dropdown, FormItem, Tabs } from '@a_ng_d/figmug-ui'
import { Case, FeatureStatus } from '@a_ng_d/figmug-utils'
import FileSaver from 'file-saver'
import JSZip from 'jszip'
import { PureComponent } from 'preact/compat'
import React from 'react'

import features from '../../config'
import { locals } from '../../content/locals'
import { $palette } from '../../stores/palette'
import { $canPaletteDeepSync } from '../../stores/preferences'
import {
  Context,
  ContextItem,
  EditorType,
  Language,
  PlanStatus,
  PriorityContext,
} from '../../types/app'
import {
  AlgorithmVersionConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  ExportConfiguration,
  LockedSourceColorsConfiguration,
  PresetConfiguration,
  ScaleConfiguration,
  ShiftConfiguration,
  ThemeConfiguration,
  UserConfiguration,
  ViewConfiguration,
  VisionSimulationModeConfiguration,
} from '../../types/configurations'
import { SourceColorEvent } from '../../types/events'
import { ColorsMessage, ThemesMessage } from '../../types/messages'
import {
  ActionsList,
  DispatchProcess,
  TextColorsThemeHexModel,
} from '../../types/models'
import doLightnessScale from '../../utils/doLightnessScale'
import {
  trackActionEvent,
  trackSourceColorsManagementEvent,
} from '../../utils/eventsTracker'
import { setContexts } from '../../utils/setContexts'
import type { AppStates } from '../App'
import Feature from '../components/Feature'
import Colors from '../contexts/Colors'
import Export from '../contexts/Export'
import Scale from '../contexts/Scale'
import Settings from '../contexts/Settings'
import Themes from '../contexts/Themes'
import Dispatcher from '../modules/Dispatcher'
import Preview from '../modules/Preview'
import Actions from '../modules/Actions'

interface EditPaletteProps {
  name: string
  description: string
  preset: PresetConfiguration
  scale: ScaleConfiguration
  shift: ShiftConfiguration
  areSourceColorsLocked: LockedSourceColorsConfiguration
  colors: Array<ColorConfiguration>
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  themes: Array<ThemeConfiguration>
  view: ViewConfiguration
  algorithmVersion: AlgorithmVersionConfiguration
  textColorsTheme: TextColorsThemeHexModel
  export: ExportConfiguration
  userIdentity: UserConfiguration
  userConsent: Array<ConsentConfiguration>
  planStatus: PlanStatus
  editorType: EditorType
  lang: Language
  onChangeScale: React.Dispatch<Partial<AppStates>>
  onChangeStop?: React.Dispatch<Partial<AppStates>>
  onChangeDistributionEasing?: React.Dispatch<Partial<AppStates>>
  onChangeColors: React.Dispatch<Partial<AppStates>>
  onChangeThemes: React.Dispatch<Partial<AppStates>>
  onChangeSettings: React.Dispatch<Partial<AppStates>>
  onPublishPalette: () => void
  onLockSourceColors: React.Dispatch<Partial<AppStates>>
  onGetProPlan: (context: { priorityContainerContext: PriorityContext }) => void
}

interface EditPaletteStates {
  context: Context | ''
  selectedElement: {
    id: string
    position: number | null
  }
  isPrimaryLoading: boolean
  canPaletteDeepSync: boolean
}

export default class EditPalette extends PureComponent<
  EditPaletteProps,
  EditPaletteStates
> {
  private colorsMessage: ColorsMessage
  private themesMessage: ThemesMessage
  private dispatch: { [key: string]: DispatchProcess }
  private contexts: Array<ContextItem>
  private themesRef: React.RefObject<Themes>
  private unsubscribe: (() => void) | null = null
  private palette: typeof $palette

  static features = (planStatus: PlanStatus) => ({
    THEMES: new FeatureStatus({
      features: features,
      featureName: 'THEMES',
      planStatus: planStatus,
    }),
    PREVIEW: new FeatureStatus({
      features: features,
      featureName: 'PREVIEW_WCAG',
      planStatus: planStatus,
    }),
  })

  constructor(props: EditPaletteProps) {
    super(props)
    this.palette = $palette
    this.themesMessage = {
      type: 'UPDATE_THEMES',
      data: [],
      isEditedInRealTime: false,
    }
    this.colorsMessage = {
      type: 'UPDATE_COLORS',
      data: [],
      isEditedInRealTime: false,
    }
    this.contexts = setContexts(
      ['SCALE', 'COLORS', 'THEMES', 'EXPORT', 'SETTINGS'],
      props.planStatus
    )
    this.state = {
      context: this.contexts[0] !== undefined ? this.contexts[0].id : '',
      selectedElement: {
        id: '',
        position: null,
      },
      isPrimaryLoading: false,
      canPaletteDeepSync: false,
    }
    this.dispatch = {
      colors: new Dispatcher(
        () => parent.postMessage({ pluginMessage: this.colorsMessage }, '*'),
        500
      ) as DispatchProcess,
    }
    this.themesRef = React.createRef()
  }

  // Lifecycle
  componentDidMount = () => {
    this.unsubscribe = $canPaletteDeepSync.subscribe((value) => {
      this.setState({ canPaletteDeepSync: value })
    })
    window.addEventListener('message', this.handleMessage)
  }

  componentWillUnmount = () => {
    if (this.unsubscribe) this.unsubscribe()
    window.removeEventListener('message', this.handleMessage)
  }

  // Handlers
  handleMessage = (e: MessageEvent) => {
    const actions: ActionsList = {
      STOP_LOADER: () =>
        this.setState({
          isPrimaryLoading: false,
        }),
      DEFAULT: () => null,
    }

    return actions[e.data.pluginMessage?.type ?? 'DEFAULT']?.()
  }

  navHandler = (e: Event) =>
    this.setState({
      context: (e.target as HTMLElement).dataset.feature as Context,
    })

  switchThemeHandler = (e: Event) => {
    this.themesMessage.data = this.props.themes.map((theme) => {
      if ((e.target as HTMLElement).dataset.value === theme.id)
        theme.isEnabled = true
      else theme.isEnabled = false

      return theme
    })
    parent.postMessage({ pluginMessage: this.themesMessage }, '*')
    this.props.onChangeThemes({
      scale:
        this.themesMessage.data.find((theme) => theme.isEnabled)?.scale ?? {},
      themes: this.themesMessage.data,
      onGoingStep: 'themes changed',
    })
  }

  slideHandler = () =>
    this.props.onChangeScale({
      scale: this.palette.get().scale,
      themes: this.props.themes.map((theme: ThemeConfiguration) => {
        if (theme.isEnabled) theme.scale = this.palette.get().scale
        return theme
      }),
      onGoingStep: 'scale changed',
    })

  customSlideHandler = () =>
    this.props.onChangeStop?.({
      preset:
        Object.keys(this.palette.get().preset).length === 0
          ? this.props.preset
          : this.palette.get().preset,
      scale: this.palette.get().scale,
      themes: this.props.themes.map((theme: ThemeConfiguration) => {
        if (theme.isEnabled) theme.scale = this.palette.get().scale
        else
          theme.scale = doLightnessScale(
            Object.keys(this.palette.get().scale).map((stop) => {
              return parseFloat(stop.replace('lightness-', ''))
            }),
            theme.scale[
              Object.keys(theme.scale)[Object.keys(theme.scale).length - 1]
            ],
            theme.scale[Object.keys(theme.scale)[0]]
          )
        return theme
      }),
      onGoingStep: 'stops changed',
    })

  shiftHandler = (feature?: string, state?: string, value?: number) => {
    this.colorsMessage.isEditedInRealTime = false

    const onReleaseStop = () => {
      setData()
      this.dispatch.colors.on.status = false

      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')

      trackSourceColorsManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: feature as SourceColorEvent['feature'],
        }
      )
    }

    const onChangeStop = () => {
      setData()
      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
    }

    const onTypeStopValue = () => {
      setData()
      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
    }

    const onUpdatingStop = () => {
      setData()
      if (this.state.canPaletteDeepSync) {
        this.colorsMessage.isEditedInRealTime = true
        this.dispatch.colors.on.status = true
      } 
    }

    const setData = () => {
      const shift: ShiftConfiguration = {
        chroma:
          feature === 'SHIFT_CHROMA' ? (value ?? 100) : this.props.shift.chroma,
      }

      this.palette.setKey('shift', shift)
      this.colorsMessage.data = this.props.colors.map((item) => {
        if (feature === 'SHIFT_CHROMA' && !item.chroma.isLocked)
          item.chroma.shift = value ?? this.props.shift.chroma
        return item
      })

      this.props.onChangeColors({
        shift: shift,
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })
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

  // Direct actions
  onSyncStyles = () => {
    this.setState({
      selectedElement: {
        id: '',
        position: null,
      },
      isPrimaryLoading: true,
    })

    parent.postMessage({ pluginMessage: { type: 'SYNC_LOCAL_STYLES' } }, '*')

    trackActionEvent(
      this.props.userIdentity.id,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'SYNC_STYLES',
      }
    )
  }

  onSyncVariables = () => {
    this.setState({
      selectedElement: {
        id: '',
        position: null,
      },
      isPrimaryLoading: true,
    })

    parent.postMessage({ pluginMessage: { type: 'SYNC_LOCAL_VARIABLES' } }, '*')

    trackActionEvent(
      this.props.userIdentity.id,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'SYNC_VARIABLES',
      }
    )
  }

  onExport = () => {
    const blob = new Blob([this.props.export.data], {
      type: this.props.export.mimeType,
    })
    if (this.props.export.format === 'CSV') {
      const zip = new JSZip()
      this.props.export.data.forEach(
        (theme: {
          name: string
          type: string
          colors: Array<{ name: string; csv: string }>
        }) => {
          if (theme.type !== 'default theme') {
            const folder = zip.folder(theme.name) ?? zip
            theme.colors.forEach((color) => {
              folder.file(
                `${new Case(color.name).doSnakeCase()}.csv`,
                color.csv
              )
            })
          } else
            theme.colors.forEach((color) => {
              zip.file(`${new Case(color.name).doSnakeCase()}.csv`, color.csv)
            })
        }
      )
      zip
        .generateAsync({ type: 'blob' })
        .then((content) =>
          FileSaver.saveAs(
            content,
            this.props.name === ''
              ? new Case(locals[this.props.lang].name).doSnakeCase()
              : new Case(this.props.name).doSnakeCase()
          )
        )
        .catch(() => locals[this.props.lang].error.generic)
    } else if (this.props.export.format === 'TAILWIND')
      FileSaver.saveAs(blob, 'tailwind.config.js')
    else if (this.props.export.format === 'SWIFT')
      FileSaver.saveAs(
        blob,
        `${
          this.props.name === ''
            ? new Case(locals[this.props.lang].name).doSnakeCase()
            : new Case(this.props.name).doSnakeCase()
        }.swift`
      )
    else if (this.props.export.format === 'KT')
      FileSaver.saveAs(
        blob,
        `${
          this.props.name === ''
            ? new Case(locals[this.props.lang].name).doSnakeCase()
            : new Case(this.props.name).doSnakeCase()
        }.kt`
      )
    else
      FileSaver.saveAs(
        blob,
        this.props.name === ''
          ? new Case(locals[this.props.lang].name).doSnakeCase()
          : new Case(this.props.name).doSnakeCase()
      )
  }

  setThemes = (): Array<DropdownOption> => {
    const themes = this.workingThemes().map((theme) => {
      return {
        label: theme.name,
        value: theme.id,
        feature: 'SWITCH_THEME',
        type: 'OPTION',
        action: (e: Event) => this.switchThemeHandler(e),
      } as DropdownOption
    })
    const actions: Array<DropdownOption> = [
      {
        type: 'SEPARATOR',
      },
      {
        label: 'Create a color theme',
        feature: 'ADD_THEME',
        type: 'OPTION',
        isActive: EditPalette.features(this.props.planStatus).THEMES.isActive(),
        isBlocked: EditPalette.features(
          this.props.planStatus
        ).THEMES.isBlocked(),
        isNew: EditPalette.features(this.props.planStatus).THEMES.isNew(),
        action: () => {
          this.setState({ context: 'THEMES' })
          setTimeout(() => this.themesRef.current?.onAddTheme(), 1)
        },
      },
    ]

    return themes.concat(actions)
  }

  workingThemes = () => {
    if (this.props.themes.length > 1)
      return this.props.themes.filter((theme) => theme.type === 'custom theme')
    else
      return this.props.themes.filter((theme) => theme.type === 'default theme')
  }

  // Render
  render() {
    let fragment

    switch (this.state.context) {
      case 'SCALE': {
        fragment = (
          <Scale
            {...this.props}
            hasPreset={false}
            onChangeScale={this.slideHandler}
            onChangeStop={this.customSlideHandler}
            onChangeShift={this.shiftHandler}
          />
        )
        break
      }
      case 'COLORS': {
        fragment = <Colors {...this.props} />
        break
      }
      case 'THEMES': {
        fragment = (
          <Themes
            {...this.props}
            ref={this.themesRef}
          />
        )
        break
      }
      case 'EXPORT': {
        fragment = (
          <Export
            exportPreview={
              this.props.export.format === 'CSV'
                ? this.props.export.data[0].colors[0].csv
                : this.props.export.data
            }
            planStatus={this.props.planStatus}
            exportType={this.props.export.label}
            lang={this.props.lang}
            onExportPalette={this.onExport}
          />
        )
        break
      }
      case 'SETTINGS': {
        fragment = (
          <Settings
            {...this.props}
            service="EDIT"
          />
        )
        break
      }
    }
    return (
      <>
        <Bar
          leftPartSlot={
            <Tabs
              tabs={this.contexts}
              active={this.state.context ?? ''}
              action={this.navHandler}
            />
          }
          rightPartSlot={
            <Feature
              isActive={EditPalette.features(
                this.props.planStatus
              ).THEMES.isActive()}
            >
              <FormItem
                id="switch-theme"
                label={locals[this.props.lang].themes.switchTheme.label}
                shouldFill={false}
              >
                <Dropdown
                  id="switch-theme"
                  options={this.setThemes()}
                  selected={
                    this.props.themes.find((theme) => theme.isEnabled)?.id
                  }
                  alignment="RIGHT"
                  pin="TOP"
                />
              </FormItem>
            </Feature>
          }
          border={['BOTTOM']}
          isOnlyText={true}
        />
        <section className="controller">
          <div className="controls">{fragment}</div>
        </section>
        <Feature isActive={this.state.context !== 'EXPORT'}>
          <Actions
            {...this.props}
            {...this.state}
            service="EDIT"
            onSyncLocalStyles={this.onSyncStyles}
            onSyncLocalVariables={this.onSyncVariables}
            onPublishPalette={this.props.onPublishPalette}
          />
        </Feature>
        <Feature
          isActive={
            EditPalette.features(this.props.planStatus).PREVIEW.isActive() &&
            this.state.context !== 'EXPORT'
          }
        >
          <Preview
            {...this.props}
            service="EDIT"
          />
        </Feature>
      </>
    )
  }
}
