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
  ExtractOfPaletteConfiguration,
  PresetConfiguration,
  ScaleConfiguration,
  ThemeConfiguration,
  VisionSimulationModeConfiguration,
} from '../../types/configurations'
import { TextColorsThemeHexModel } from '../../types/models'
import DevModePalettes from '../contexts/DevModePalettes'
import Export from '../contexts/Export'

interface TransferPaletteProps {
  name: string
  description: string
  preset: PresetConfiguration
  scale: ScaleConfiguration
  colors: Array<ColorConfiguration>
  colorSpace: string
  visionSimulationMode: VisionSimulationModeConfiguration
  themes: Array<ThemeConfiguration>
  view: string
  textColorsTheme: TextColorsThemeHexModel
  algorithmVersion: string
  export: ExportConfiguration
  palettesList: Array<ExtractOfPaletteConfiguration>
  service: Service
  planStatus: PlanStatus
  editorType: EditorType
  lang: Language
}

export default class TransferPalette extends PureComponent<TransferPaletteProps> {
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
    } else if (this.props.export.format === 'TAILWIND') {
      FileSaver.saveAs(blob, 'tailwind.config.js')
    } else if (this.props.export.format === 'SWIFT') {
      FileSaver.saveAs(
        blob,
        `${
          this.props.name === ''
            ? new Case(locals[this.props.lang].name).doSnakeCase()
            : new Case(this.props.name).doSnakeCase()
        }.swift`
      )
    } else if (this.props.export.format === 'KT') {
      FileSaver.saveAs(
        blob,
        `${
          this.props.name === ''
            ? new Case(locals[this.props.lang].name).doSnakeCase()
            : new Case(this.props.name).doSnakeCase()
        }.kt`
      )
    } else {
      FileSaver.saveAs(
        blob,
        this.props.name === ''
          ? new Case(locals[this.props.lang].name).doSnakeCase()
          : new Case(this.props.name).doSnakeCase()
      )
    }
  }

  // Render
  render() {
    return (
      <>
        <section className="controller">
          <div className="controls">
            {this.props.service === 'CREATE' &&
            this.props.editorType === 'dev' ? (
              <DevModePalettes
                paletteLists={this.props.palettesList}
                lang={this.props.lang}
              />
            ) : (
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
            )}
          </div>
        </section>
      </>
    )
  }
}
