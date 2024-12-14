import {
  ActionsItem,
  Button,
  Icon,
  SemanticMessage,
  texts,
} from '@a_ng_d/figmug-ui'
import { PureComponent } from 'preact/compat'
import React from 'react'

import { locals } from '../../content/locals'
import { Language } from '../../types/app'
import {
  ColorConfiguration,
  ExtractOfPaletteConfiguration,
  ThemeConfiguration,
} from '../../types/configurations'
import { ActionsList } from '../../types/models'

interface InternalPalettesProps {
  lang: Language
}

interface InternalPalettesStates {
  paletteListsStatus: 'LOADING' | 'LOADED' | 'EMPTY'
  paletteLists: Array<ExtractOfPaletteConfiguration>
}

export default class InternalPalettes extends PureComponent<
  InternalPalettesProps,
  InternalPalettesStates
> {
  constructor(props: InternalPalettesProps) {
    super(props)
    this.state = {
      paletteListsStatus: 'LOADING',
      paletteLists: [],
    }
  }

  // Lifecycle
  componentDidMount = () => {
    parent.postMessage({ pluginMessage: { type: 'GET_PALETTES' } }, '*')

    window.addEventListener('message', this.handleMessage)
  }

  componentWillUnmount = () => {
    window.removeEventListener('message', this.handleMessage)
  }

  // Handlers
  handleMessage = (e: MessageEvent) => {
    const actions: ActionsList = {
      EXPOSE_PALETTES: () =>
        this.setState({
          paletteListsStatus:
            e.data.pluginMessage.data.length > 0 ? 'LOADED' : 'EMPTY',
          paletteLists: e.data.pluginMessage.data,
        }),
      LOAD_PALETTES: () => this.setState({ paletteListsStatus: 'LOADING' }),
      DEFAULT: () => null,
    }

    return actions[e.data.pluginMessage?.type ?? 'DEFAULT']?.()
  }

  // Direct actions
  getImageSrc = (screenshot: Uint8Array | null) => {
    if (screenshot !== null) {
      const blob = new Blob([screenshot], {
        type: 'image/png',
      })
      return URL.createObjectURL(blob)
    } else return ''
  }

  getPaletteMeta = (
    colors: Array<ColorConfiguration>,
    themes: Array<ThemeConfiguration>
  ) => {
    const colorsNumber = colors.length,
      themesNumber = themes.filter(
        (theme) => theme.type === 'custom theme'
      ).length

    let colorLabel: string, themeLabel: string

    if (colorsNumber > 1)
      colorLabel = locals[this.props.lang].actions.sourceColorsNumber.several
    else colorLabel = locals[this.props.lang].actions.sourceColorsNumber.single

    if (themesNumber > 1)
      themeLabel = locals[this.props.lang].actions.colorThemesNumber.several
    else themeLabel = locals[this.props.lang].actions.colorThemesNumber.single

    return `${colorsNumber} ${colorLabel}, ${themesNumber} ${themeLabel}`
  }

  onSelectPalette = (id: string) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'JUMP_TO_PALETTE',
          id: id,
        },
      },
      '*'
    )
  }

  // Templates
  InternalPalettesList = () => {
    return (
      <ul
        className={[
          'rich-list',
          this.state.paletteListsStatus === 'LOADING' && 'rich-list--loading',
          this.state.paletteListsStatus === 'EMPTY' && 'rich-list--message',
        ]
          .filter((n) => n)
          .join(' ')}
      >
        {this.state.paletteListsStatus === 'LOADING' && (
          <Icon
            type="PICTO"
            iconName="spinner"
            customClassName="control__block__loader"
          />
        )}
        {this.state.paletteListsStatus === 'LOADED' && (
          <>
            <div
              className={`${texts.type} ${texts['type--secondary']} type rich-list__title`}
              style={{ padding: '0 var(--size-small)' }}
            >
              {locals[this.props.lang].palettes.devMode.title}
            </div>
            {this.state.paletteLists.map((palette, index) => (
              <ActionsItem
                id={palette.id}
                key={`palette-${index}`}
                src={this.getImageSrc(palette.screenshot)}
                name={
                  palette.name === ''
                    ? locals[this.props.lang].name
                    : palette.name
                }
                indicator={
                  palette.devStatus === 'READY_FOR_DEV'
                    ? {
                        label:
                          locals[this.props.lang].palettes.devMode.readyForDev,
                        status: 'ACTIVE',
                      }
                    : undefined
                }
                description={palette.preset}
                subdescription={this.getPaletteMeta(
                  palette.colors,
                  palette.themes
                )}
                actionsSlot={
                  <Button
                    type="icon"
                    icon="target"
                    label={locals[this.props.lang].actions.addToFile}
                    action={() => this.onSelectPalette(palette.id)}
                  />
                }
              />
            ))}
          </>
        )}
        {this.state.paletteListsStatus === 'EMPTY' && (
          <div className="callout--centered">
            <SemanticMessage
              type="NEUTRAL"
              message={locals[this.props.lang].warning.noPaletteOnCurrrentPage}
            />
          </div>
        )}
      </ul>
    )
  }

  // Render
  render() {
    return (
      <div className="controls__control">
        <div className="control__block control__block--list">
          <this.InternalPalettesList />
        </div>
      </div>
    )
  }
}
