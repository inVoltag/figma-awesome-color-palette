import { doSnakeCase } from '@a-ng-d/figmug.modules.do-snake-case'
import type { ConsentConfiguration, DropdownOption } from '@a_ng_d/figmug-ui'
import { Bar, Dropdown, FormItem, Tabs } from '@a_ng_d/figmug-ui'
import FileSaver from 'file-saver'
import JSZip from 'jszip'
import React from 'react'

import { locals } from '../../content/locals'
import { ContextItem, EditorType, Language, PlanStatus } from '../../types/app'
import {
  AlgorithmVersionConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  ExportConfiguration,
  PresetConfiguration,
  ScaleConfiguration,
  ThemeConfiguration,
  ViewConfiguration,
  VisionSimulationModeConfiguration,
} from '../../types/configurations'
import { ThemesMessage } from '../../types/messages'
import { TextColorsThemeHexModel } from '../../types/models'
import { Identity } from '../../types/user'
import features from '../../utils/config'
import doLightnessScale from '../../utils/doLightnessScale'
import { trackActionEvent } from '../../utils/eventsTracker'
import isBlocked from '../../utils/isBlocked'
import { palette } from '../../utils/palettePackage'
import { setContexts } from '../../utils/setContexts'
import type { AppStates } from '../App'
import Feature from '../components/Feature'
import Colors from '../contexts/Colors'
import Export from '../contexts/Export'
import Scale from '../contexts/Scale'
import Settings from '../contexts/Settings'
import Themes from '../contexts/Themes'

interface EditPaletteProps {
  name: string
  description: string
  preset: PresetConfiguration
  scale: ScaleConfiguration
  colors: Array<ColorConfiguration>
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  themes: Array<ThemeConfiguration>
  view: ViewConfiguration
  textColorsTheme: TextColorsThemeHexModel
  algorithmVersion: AlgorithmVersionConfiguration
  export: ExportConfiguration
  identity: Identity
  userConsent: Array<ConsentConfiguration>
  planStatus: PlanStatus
  editorType: EditorType
  lang: Language
  figmaUserId: string
  onChangeScale: React.Dispatch<Partial<AppStates>>
  onChangeStop?: React.Dispatch<Partial<AppStates>>
  onChangeColors: React.Dispatch<Partial<AppStates>>
  onChangeThemes: React.Dispatch<Partial<AppStates>>
  onChangeSettings: React.Dispatch<Partial<AppStates>>
  onPublishPalette: () => void
}

interface EditPaletteStates {
  context: string | undefined
  selectedElement: {
    id: string
    position: number | null
  }
}

export default class EditPalette extends React.Component<
  EditPaletteProps,
  EditPaletteStates
> {
  themesMessage: ThemesMessage
  contexts: Array<ContextItem>
  themesRef: React.RefObject<Themes>

  constructor(props: EditPaletteProps) {
    super(props)
    this.themesMessage = {
      type: 'UPDATE_THEMES',
      data: [],
      isEditedInRealTime: false,
    }
    this.contexts = setContexts([
      'SCALE',
      'COLORS',
      'THEMES',
      'EXPORT',
      'SETTINGS',
    ])
    this.state = {
      context: this.contexts[0] !== undefined ? this.contexts[0].id : '',
      selectedElement: {
        id: '',
        position: null,
      },
    }
    this.themesRef = React.createRef()
  }

  // Handlers
  navHandler = (e: React.SyntheticEvent) =>
    this.setState({
      context: (e.target as HTMLElement).dataset.feature,
    })

  switchThemeHandler = (
    e: React.MouseEvent<HTMLLIElement, MouseEvent> | React.KeyboardEvent
  ) => {
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
      scale: palette.scale,
      themes: this.props.themes.map((theme: ThemeConfiguration) => {
        if (theme.isEnabled) theme.scale = palette.scale
        return theme
      }),
      onGoingStep: 'scale changed',
    })

  customSlideHandler = () =>
    this.props.onChangeStop?.({
      preset:
        Object.keys(palette.preset).length === 0
          ? this.props.preset
          : palette.preset,
      scale: palette.scale,
      themes: this.props.themes.map((theme: ThemeConfiguration) => {
        if (theme.isEnabled) theme.scale = palette.scale
        else
          theme.scale = doLightnessScale(
            Object.keys(palette.scale).map((stop) => {
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

  // Direct actions
  onSyncStyles = () => {
    parent.postMessage({ pluginMessage: { type: 'SYNC_LOCAL_STYLES' } }, '*')
    this.setState({
      selectedElement: {
        id: '',
        position: null,
      },
    })
    trackActionEvent(
      this.props.figmaUserId,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'SYNC_STYLES',
      }
    )
  }

  onSyncVariables = () => {
    parent.postMessage({ pluginMessage: { type: 'SYNC_LOCAL_VARIABLES' } }, '*')
    this.setState({
      selectedElement: {
        id: '',
        position: null,
      },
    })
    trackActionEvent(
      this.props.figmaUserId,
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
              folder.file(`${doSnakeCase(color.name)}.csv`, color.csv)
            })
          } else
            theme.colors.forEach((color) => {
              zip.file(`${doSnakeCase(color.name)}.csv`, color.csv)
            })
        }
      )
      zip
        .generateAsync({ type: 'blob' })
        .then((content) =>
          FileSaver.saveAs(
            content,
            this.props.name === ''
              ? doSnakeCase(locals[this.props.lang].name)
              : doSnakeCase(this.props.name)
          )
        )
        .catch(() => locals[this.props.lang].error.generic)
    } else if (this.props.export.format === 'TAILWIND') {
      FileSaver.saveAs(blob, 'tailwind.config.js')
    } else if (this.props.export.format === 'SWIFT') {
      FileSaver.saveAs(
        blob,
        `${
          this.props.name === ''
            ? doSnakeCase(locals[this.props.lang].name)
            : doSnakeCase(this.props.name)
        }.swift`
      )
    } else if (this.props.export.format === 'KT') {
      FileSaver.saveAs(
        blob,
        `${
          this.props.name === ''
            ? doSnakeCase(locals[this.props.lang].name)
            : doSnakeCase(this.props.name)
        }.kt`
      )
    } else {
      FileSaver.saveAs(
        blob,
        this.props.name === ''
          ? doSnakeCase(locals[this.props.lang].name)
          : doSnakeCase(this.props.name)
      )
    }
  }

  setThemes = (): Array<DropdownOption> => {
    const themes = this.workingThemes().map((theme) => {
      return {
        label: theme.name,
        value: theme.id,
        feature: 'SWITCH_THEME',
        position: 0,
        type: 'OPTION',
        isActive: true,
        isBlocked: false,
        children: [],
        action: (
          e: React.MouseEvent<HTMLLIElement, MouseEvent> | React.KeyboardEvent
        ) => this.switchThemeHandler(e),
      } as DropdownOption
    })
    const actions: Array<DropdownOption> = [
      {
        label: null,
        value: null,
        feature: null,
        position: themes.length,
        type: 'SEPARATOR',
        isActive: true,
        isBlocked: false,
        children: [],
        action: () => null,
      },
      {
        label: 'Create a color theme',
        value: null,
        feature: 'ADD_THEME',
        position: 0,
        type: 'OPTION',
        isActive: features.find((feature) => feature.name === 'THEMES')
          ?.isActive,
        isBlocked: isBlocked('THEMES', this.props.planStatus),
        isNew: features.find((feature) => feature.name === 'THEMES')?.isNew,
        children: [],
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
            onSyncLocalStyles={this.onSyncStyles}
            onSyncLocalVariables={this.onSyncVariables}
          />
        )
        break
      }
      case 'COLORS': {
        fragment = (
          <Colors
            {...this.props}
            onSyncLocalStyles={this.onSyncStyles}
            onSyncLocalVariables={this.onSyncVariables}
          />
        )
        break
      }
      case 'THEMES': {
        fragment = (
          <Themes
            {...this.props}
            ref={this.themesRef}
            onSyncLocalStyles={this.onSyncStyles}
            onSyncLocalVariables={this.onSyncVariables}
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
            context="LOCAL_STYLES"
            {...this.props}
            onSyncLocalStyles={this.onSyncStyles}
            onSyncLocalVariables={this.onSyncVariables}
          />
        )
        break
      }
    }
    return (
      <>
        <Bar
          leftPart={
            <Tabs
              tabs={this.contexts}
              active={this.state.context ?? ''}
              action={this.navHandler}
            />
          }
          rightPart={
            <Feature
              isActive={
                features.find((feature) => feature.name === 'THEMES')?.isActive
              }
            >
              <FormItem
                id="themes"
                label={locals[this.props.lang].themes.switchTheme.label}
                shouldFill={false}
              >
                <Dropdown
                  id="themes"
                  options={this.setThemes()}
                  selected={
                    this.props.themes.find((theme) => theme.isEnabled)?.id ??
                    'NULL'
                  }
                  parentClassName="ui"
                  alignment="RIGHT"
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
      </>
    )
  }
}
