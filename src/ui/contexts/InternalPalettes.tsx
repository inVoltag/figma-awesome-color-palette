import {
  ActionsItem,
  Button,
  List,
  SemanticMessage,
  texts,
} from '@a_ng_d/figmug-ui'
import { PureComponent } from 'preact/compat'
import React from 'react'

import { locals } from '../../content/locals'
import { EditorType, Language } from '../../types/app'
import { ExtractOfPaletteConfiguration } from '../../types/configurations'
import { ActionsList } from '../../types/models'
import getPaletteMeta from '../../utils/setPaletteMeta'

interface InternalPalettesProps {
  editorType: EditorType
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

  // Direct Actions
  getImageSrc = (screenshot: Uint8Array | null) => {
    if (screenshot !== null) {
      const blob = new Blob([screenshot], {
        type: 'image/png',
      })
      return URL.createObjectURL(blob)
    } else return ''
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
      <List
        isLoading={this.state.paletteListsStatus === 'LOADING'}
        isMessage={this.state.paletteListsStatus === 'EMPTY'}
      >
        {this.state.paletteListsStatus === 'LOADED' && (
          <>
            {this.props.editorType === 'dev' && (
              <div
                className={`${texts.type} ${texts['type--secondary']} type rich-list__title`}
                style={{ padding: '0 var(--size-small)' }}
              >
                {locals[this.props.lang].palettes.devMode.title}
              </div>
            )}
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
                subdescription={getPaletteMeta(palette.colors, palette.themes)}
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
          <SemanticMessage
            type="NEUTRAL"
            message={`${locals[this.props.lang].warning.noPaletteOnCurrrentPage}${this.props.editorType === 'dev' ? ' ' + locals[this.props.lang].warning.noPaletteOnCurrentPageOnDevMode : ''}`}
          />
        )}
      </List>
    )
  }

  // Render
  render() {
    return (
      <div className="controls__control">
        <div
          id="internal"
          className="control__block control__block--list"
        >
          <this.InternalPalettesList />
        </div>
      </div>
    )
  }
}
