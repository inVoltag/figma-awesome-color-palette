import FileSaver from 'file-saver'
import JSZip from 'jszip'
import { PureComponent } from 'preact/compat'
import React from 'react'

import { Case } from '@a_ng_d/figmug-utils'
import { locals } from '../../content/locals'
import { EditorType, Language, PlanStatus, Service } from '../../types/app'
import {
  ColorConfiguration,
  ExportConfiguration,
  ThemeConfiguration,
} from '../../types/configurations'
import Export from '../contexts/Export'
import InternalPalettes from '../contexts/InternalPalettes'
import { Button, SemanticMessage } from '@a_ng_d/figmug-ui'
import Feature from '../components/Feature'
import { vsCodeFigmaPluginUrl } from '../../config'
import { $isVsCodeMessageDisplayed } from '../../stores/preferences'

interface TransferPaletteProps {
  name: string
  colors: Array<ColorConfiguration>
  themes: Array<ThemeConfiguration>
  export: ExportConfiguration
  service: Service
  planStatus: PlanStatus
  editorType: EditorType
  lang: Language
}

interface TransferPaletteStates {
  isVsCodeMessageDisplayed: boolean
}

export default class TransferPalette extends PureComponent<
  TransferPaletteProps,
  TransferPaletteStates
> {
  private unsubscribe: (() => void) | undefined

  constructor(props: TransferPaletteProps) {
    super(props)
    this.state = {
      isVsCodeMessageDisplayed: true,
    }
  }

  // Lifecycle
  componentDidMount() {
    this.unsubscribe = $isVsCodeMessageDisplayed.subscribe((value) => {
      this.setState({ isVsCodeMessageDisplayed: value })
    })
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe()
  }

  // Direct actions
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

  // Render
  render() {
    return (
      <>
        <section className="controller">
          <div className="controls">
            <Feature
              isActive={
                this.props.editorType !== 'dev_vscode' &&
                $isVsCodeMessageDisplayed.get()
              }
            >
              <div
                style={{
                  padding: '0 var(--size-xsmall)',
                }}
              >
                <SemanticMessage
                  type="INFO"
                  message={
                    locals[this.props.lang].palettes.devMode.vscode.message
                  }
                  actionsSlot={
                    <>
                      <Button
                        type="secondary"
                        label={
                          locals[this.props.lang].palettes.devMode.vscode.cta
                        }
                        action={() =>
                          parent.postMessage(
                            {
                              pluginMessage: {
                                type: 'OPEN_IN_BROWSER',
                                url: vsCodeFigmaPluginUrl,
                              },
                            },
                            '*'
                          )
                        }
                      />
                      {}
                      <Button
                        type="icon"
                        icon="close"
                        action={() => {
                          $isVsCodeMessageDisplayed.set(false)
                          parent.postMessage(
                            {
                              pluginMessage: {
                                type: 'SET_ITEMS',
                                items: [
                                  {
                                    key: 'is_vs_code_displayed',
                                    value: false,
                                  },
                                ],
                              },
                            },
                            '*'
                          )
                        }}
                      />
                    </>
                  }
                />
              </div>
            </Feature>
            {this.props.service === 'CREATE' &&
            this.props.editorType === 'dev' ? (
              <InternalPalettes {...this.props} />
            ) : (
              <Export
                {...this.props}
                exportPreview={
                  this.props.export.format === 'CSV'
                    ? this.props.export.data[0].colors[0].csv
                    : this.props.export.data
                }
                exportType={this.props.export.label}
                onExportPalette={this.onExport}
              />
            )}
          </div>
        </section>
      </>
    )
  }
}
