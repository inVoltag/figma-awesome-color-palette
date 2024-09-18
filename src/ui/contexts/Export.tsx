import type { DropdownOption } from '@a_ng_d/figmug-ui'
import { Dropdown, Input, Menu, SectionTitle } from '@a_ng_d/figmug-ui'
import React from 'react'

import { locals } from '../../content/locals'
import { Language, PlanStatus } from '../../types/app'
import { ColorSpaceConfiguration } from '../../types/configurations'
import { ActionsList } from '../../types/models'
import features from '../../utils/config'
import isBlocked from '../../utils/isBlocked'
import Actions from '../modules/Actions'

interface ExportProps {
  exportPreview: string
  planStatus: PlanStatus
  exportType: string
  lang: Language
  onExportPalette: () => void
}

interface ExportStates {
  format:
    | 'EXPORT_TOKENS_GLOBAL'
    | 'EXPORT_TOKENS_AMZN_STYLE_DICTIONARY'
    | 'EXPORT_TOKENS_TOKENS_STUDIO'
    | 'EXPORT_CSS'
    | 'EXPORT_TAILWIND'
    | 'EXPORT_APPLE_SWIFTUI'
    | 'EXPORT_APPLE_UIKIT'
    | 'EXPORT_ANDROID_COMPOSE'
    | 'EXPORT_ANDROID_XML'
    | 'EXPORT_CSV'
  colorSpace: {
    selected: ColorSpaceConfiguration
    options: Array<DropdownOption>
  }
}

export default class Export extends React.Component<ExportProps, ExportStates> {
  counter: number

  static defaultProps = {
    exportPreview: '',
  }

  constructor(props: ExportProps) {
    super(props)
    this.counter = 0
    this.state = {
      format: 'EXPORT_TOKENS_GLOBAL',
      colorSpace: {
        selected: 'RGB',
        options: [],
      },
    }
  }

  // Handlers
  exportHandler = (e: React.SyntheticEvent) => {
    const actions: ActionsList = {
      EXPORT_TOKENS_GLOBAL: () => {
        this.setState({
          format: 'EXPORT_TOKENS_GLOBAL',
        })
        parent.postMessage(
          {
            pluginMessage: { type: 'EXPORT_PALETTE', export: 'TOKENS_GLOBAL' },
          },
          '*'
        )
      },
      EXPORT_TOKENS_AMZN_STYLE_DICTIONARY: () => {
        this.setState({
          format: 'EXPORT_TOKENS_AMZN_STYLE_DICTIONARY',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              export: 'TOKENS_AMZN_STYLE_DICTIONARY',
            },
          },
          '*'
        )
      },
      EXPORT_TOKENS_TOKENS_STUDIO: () => {
        this.setState({
          format: 'EXPORT_TOKENS_TOKENS_STUDIO',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              export: 'TOKENS_TOKENS_STUDIO',
            },
          },
          '*'
        )
      },
      EXPORT_CSS: () => {
        this.setState({
          format: 'EXPORT_CSS',
          colorSpace: {
            selected: 'RGB',
            options: [
              {
                label: locals[this.props.lang].export.colorSpace.label,
                value: null,
                feature: null,
                position: 0,
                type: 'TITLE',
                isActive: true,
                isBlocked: false,
                children: [],
                action: () => null,
              },
              {
                label: locals[this.props.lang].export.colorSpace.rgb,
                value: 'EXPORT_CSS_RGB',
                feature: 'SELECT_COLOR_SPACE',
                position: 0,
                type: 'OPTION',
                isActive: features.find(
                  (feature) => feature.name === 'EXPORT_CSS_RGB'
                )?.isActive,
                isBlocked: isBlocked('EXPORT_CSS_RGB', this.props.planStatus),
                isNew: features.find(
                  (feature) => feature.name === 'EXPORT_CSS_RGB'
                )?.isNew,
                children: [],
                action: this.exportHandler,
              },
              {
                label: locals[this.props.lang].export.colorSpace.hex,
                value: 'EXPORT_CSS_HEX',
                feature: 'SELECT_COLOR_SPACE',
                position: 1,
                type: 'OPTION',
                isActive: features.find(
                  (feature) => feature.name === 'EXPORT_CSS_HEX'
                )?.isActive,
                isBlocked: isBlocked('EXPORT_CSS_HEX', this.props.planStatus),
                isNew: features.find(
                  (feature) => feature.name === 'EXPORT_CSS_HEX'
                )?.isNew,
                children: [],
                action: this.exportHandler,
              },
              {
                label: locals[this.props.lang].export.colorSpace.hsl,
                value: 'EXPORT_CSS_HSL',
                feature: 'SELECT_COLOR_SPACE',
                position: 2,
                type: 'OPTION',
                isActive: features.find(
                  (feature) => feature.name === 'EXPORT_CSS_HSL'
                )?.isActive,
                isBlocked: isBlocked('EXPORT_CSS_HSL', this.props.planStatus),
                isNew: features.find(
                  (feature) => feature.name === 'EXPORT_CSS_HSL'
                )?.isNew,
                children: [],
                action: this.exportHandler,
              },
              {
                label: locals[this.props.lang].export.colorSpace.lch,
                value: 'EXPORT_CSS_LCH',
                feature: 'SELECT_COLOR_SPACE',
                position: 3,
                type: 'OPTION',
                isActive: features.find(
                  (feature) => feature.name === 'EXPORT_CSS_LCH'
                )?.isActive,
                isBlocked: isBlocked('EXPORT_CSS_LCH', this.props.planStatus),
                isNew: features.find(
                  (feature) => feature.name === 'EXPORT_CSS_LCH'
                )?.isNew,
                children: [],
                action: this.exportHandler,
              },
              {
                label: locals[this.props.lang].export.colorSpace.p3,
                value: 'EXPORT_CSS_P3',
                feature: 'SELECT_COLOR_SPACE',
                position: 4,
                type: 'OPTION',
                isActive: features.find(
                  (feature) => feature.name === 'EXPORT_CSS_P3'
                )?.isActive,
                isBlocked: isBlocked('EXPORT_CSS_P3', this.props.planStatus),
                isNew: features.find(
                  (feature) => feature.name === 'EXPORT_CSS_P3'
                )?.isNew,
                children: [],
                action: this.exportHandler,
              },
            ],
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              export: 'CSS',
              colorSpace: 'RGB',
            },
          },
          '*'
        )
      },
      EXPORT_CSS_RGB: () => {
        this.setState({
          colorSpace: {
            selected: 'RGB',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              export: 'CSS',
              colorSpace: 'RGB',
            },
          },
          '*'
        )
      },
      EXPORT_CSS_HEX: () => {
        this.setState({
          colorSpace: {
            selected: 'HEX',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              export: 'CSS',
              colorSpace: 'HEX',
            },
          },
          '*'
        )
      },
      EXPORT_CSS_HSL: () => {
        this.setState({
          colorSpace: {
            selected: 'HSL',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              export: 'CSS',
              colorSpace: 'HSL',
            },
          },
          '*'
        )
      },
      EXPORT_CSS_LCH: () => {
        this.setState({
          colorSpace: {
            selected: 'LCH',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              export: 'CSS',
              colorSpace: 'LCH',
            },
          },
          '*'
        )
      },
      EXPORT_CSS_P3: () => {
        this.setState({
          colorSpace: {
            selected: 'P3',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              export: 'CSS',
              colorSpace: 'P3',
            },
          },
          '*'
        )
      },
      EXPORT_TAILWIND: () => {
        this.setState({
          format: 'EXPORT_TAILWIND',
        })
        parent.postMessage(
          { pluginMessage: { type: 'EXPORT_PALETTE', export: 'TAILWIND' } },
          '*'
        )
      },
      EXPORT_APPLE_SWIFTUI: () => {
        this.setState({
          format: 'EXPORT_APPLE_SWIFTUI',
        })
        parent.postMessage(
          {
            pluginMessage: { type: 'EXPORT_PALETTE', export: 'APPLE_SWIFTUI' },
          },
          '*'
        )
      },
      EXPORT_APPLE_UIKIT: () => {
        this.setState({
          format: 'EXPORT_APPLE_UIKIT',
        })
        parent.postMessage(
          { pluginMessage: { type: 'EXPORT_PALETTE', export: 'APPLE_UIKIT' } },
          '*'
        )
      },
      EXPORT_ANDROID_COMPOSE: () => {
        this.setState({
          format: 'EXPORT_ANDROID_COMPOSE',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              export: 'ANDROID_COMPOSE',
            },
          },
          '*'
        )
      },
      EXPORT_ANDROID_XML: () => {
        this.setState({
          format: 'EXPORT_ANDROID_XML',
        })
        parent.postMessage(
          { pluginMessage: { type: 'EXPORT_PALETTE', export: 'ANDROID_XML' } },
          '*'
        )
      },
      EXPORT_CSV: () => {
        this.setState({
          format: 'EXPORT_CSV',
        })
        parent.postMessage(
          { pluginMessage: { type: 'EXPORT_PALETTE', export: 'CSV' } },
          '*'
        )
      },
      NULL: () => null,
    }

    return actions[(e.target as HTMLElement).dataset.value ?? 'NULL']?.()
  }

  // Direct actions
  setFirstPreview = () => {
    this.counter === 0
      ? parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              export: this.state.format.replace('EXPORT_', ''),
            },
          },
          '*'
        )
      : null
    this.counter = 1
  }

  selectPreview = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => e.target.select()

  deSelectPreview = () => window.getSelection()?.removeAllRanges()

  // Render
  render() {
    this.setFirstPreview()
    return (
      <div className="controls__control">
        <div className="control__block">
          <div className="section-controls">
            <div className="section-controls__left-part">
              <SectionTitle
                label={locals[this.props.lang].export.format}
                indicator="10"
              />
            </div>
            <div className="section-controls__right-part">
              <Dropdown
                id="exports-list"
                options={[
                  {
                    label: locals[this.props.lang].export.tokens.label,
                    value: 'TOKENS_GROUP',
                    feature: 'SELECT_EXPORT_FILE',
                    position: 0,
                    type: 'OPTION',
                    isActive: features.find(
                      (feature) => feature.name === 'EXPORT_TOKENS'
                    )?.isActive,
                    isBlocked: isBlocked(
                      'EXPORT_TOKENS',
                      this.props.planStatus
                    ),
                    isNew: features.find(
                      (feature) => feature.name === 'EXPORT_TOKENS'
                    )?.isNew,
                    children: [
                      {
                        label: locals[this.props.lang].export.tokens.global,
                        value: 'EXPORT_TOKENS_GLOBAL',
                        feature: 'SELECT_EXPORT_FILE',
                        position: 0,
                        type: 'OPTION',
                        isActive: features.find(
                          (feature) => feature.name === 'EXPORT_TOKENS_JSON'
                        )?.isActive,
                        isBlocked: isBlocked(
                          'EXPORT_TOKENS_JSON',
                          this.props.planStatus
                        ),
                        isNew: features.find(
                          (feature) => feature.name === 'EXPORT_TOKENS_JSON'
                        )?.isNew,
                        children: [],
                        action: this.exportHandler,
                      },
                      {
                        label:
                          locals[this.props.lang].export.tokens
                            .amznStyleDictionary,
                        value: 'EXPORT_TOKENS_AMZN_STYLE_DICTIONARY',
                        feature: 'SELECT_EXPORT_FILE',
                        position: 0,
                        type: 'OPTION',
                        isActive: features.find(
                          (feature) =>
                            feature.name ===
                            'EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY'
                        )?.isActive,
                        isBlocked: isBlocked(
                          'EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY',
                          this.props.planStatus
                        ),
                        isNew: features.find(
                          (feature) =>
                            feature.name ===
                            'EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY'
                        )?.isNew,
                        children: [],
                        action: this.exportHandler,
                      },
                      {
                        label:
                          locals[this.props.lang].export.tokens.tokensStudio,
                        value: 'EXPORT_TOKENS_TOKENS_STUDIO',
                        feature: 'SELECT_EXPORT_FILE',
                        position: 0,
                        type: 'OPTION',
                        isActive: features.find(
                          (feature) =>
                            feature.name === 'EXPORT_TOKENS_JSON_TOKENS_STUDIO'
                        )?.isActive,
                        isBlocked: isBlocked(
                          'EXPORT_TOKENS_JSON_TOKENS_STUDIO',
                          this.props.planStatus
                        ),
                        isNew: features.find(
                          (feature) =>
                            feature.name === 'EXPORT_TOKENS_JSON_TOKENS_STUDIO'
                        )?.isNew,
                        children: [],
                        action: this.exportHandler,
                      },
                    ],
                    action: () => null,
                  },
                  {
                    label: locals[this.props.lang].export.css.customProperties,
                    value: 'EXPORT_CSS',
                    feature: 'SELECT_EXPORT_FILE',
                    position: 0,
                    type: 'OPTION',
                    isActive: features.find(
                      (feature) => feature.name === 'EXPORT_CSS'
                    )?.isActive,
                    isBlocked: isBlocked('EXPORT_CSS', this.props.planStatus),
                    isNew: features.find(
                      (feature) => feature.name === 'EXPORT_CSS'
                    )?.isNew,
                    children: [],
                    action: this.exportHandler,
                  },
                  {
                    label: locals[this.props.lang].export.tailwind.config,
                    value: 'EXPORT_TAILWIND',
                    feature: 'SELECT_EXPORT_FILE',
                    position: 0,
                    type: 'OPTION',
                    isActive: features.find(
                      (feature) => feature.name === 'EXPORT_TAILWIND'
                    )?.isActive,
                    isBlocked: isBlocked(
                      'EXPORT_TAILWIND',
                      this.props.planStatus
                    ),
                    isNew: features.find(
                      (feature) => feature.name === 'EXPORT_TAILWIND'
                    )?.isNew,
                    children: [],
                    action: this.exportHandler,
                  },
                  {
                    label: locals[this.props.lang].export.apple.label,
                    value: 'APPLE_GROUP',
                    feature: 'SELECT_EXPORT_FILE',
                    position: 0,
                    type: 'OPTION',
                    isActive: features.find(
                      (feature) => feature.name === 'EXPORT_APPLE'
                    )?.isActive,
                    isBlocked: isBlocked('EXPORT_APPLE', this.props.planStatus),
                    isNew: features.find(
                      (feature) => feature.name === 'EXPORT_APPLE'
                    )?.isNew,
                    children: [
                      {
                        label: locals[this.props.lang].export.apple.swiftui,
                        value: 'EXPORT_APPLE_SWIFTUI',
                        feature: 'SELECT_EXPORT_FILE',
                        position: 0,
                        type: 'OPTION',
                        isActive: features.find(
                          (feature) => feature.name === 'EXPORT_APPLE_SWIFTUI'
                        )?.isActive,
                        isBlocked: isBlocked(
                          'EXPORT_APPLE_SWIFTUI',
                          this.props.planStatus
                        ),
                        isNew: features.find(
                          (feature) => feature.name === 'EXPORT_APPLE_SWIFTUI'
                        )?.isNew,
                        children: [],
                        action: this.exportHandler,
                      },
                      {
                        label: locals[this.props.lang].export.apple.uikit,
                        value: 'EXPORT_APPLE_UIKIT',
                        feature: 'SELECT_EXPORT_FILE',
                        position: 0,
                        type: 'OPTION',
                        isActive: features.find(
                          (feature) => feature.name === 'EXPORT_APPLE_UIKIT'
                        )?.isActive,
                        isBlocked: isBlocked(
                          'EXPORT_APPLE_UIKIT',
                          this.props.planStatus
                        ),
                        isNew: features.find(
                          (feature) => feature.name === 'EXPORT_APPLE_UIKIT'
                        )?.isNew,
                        children: [],
                        action: this.exportHandler,
                      },
                    ],
                    action: this.exportHandler,
                  },
                  {
                    label: locals[this.props.lang].export.android.label,
                    value: 'ANDROID_GROUP',
                    feature: 'SELECT_EXPORT_FILE',
                    position: 0,
                    type: 'OPTION',
                    isActive: features.find(
                      (feature) => feature.name === 'EXPORT_ANDROID'
                    )?.isActive,
                    isBlocked: isBlocked(
                      'EXPORT_ANDROID',
                      this.props.planStatus
                    ),
                    isNew: features.find(
                      (feature) => feature.name === 'EXPORT_ANDROID'
                    )?.isNew,
                    children: [
                      {
                        label: locals[this.props.lang].export.android.compose,
                        value: 'EXPORT_ANDROID_COMPOSE',
                        feature: 'SELECT_EXPORT_FILE',
                        position: 0,
                        type: 'OPTION',
                        isActive: features.find(
                          (feature) => feature.name === 'EXPORT_ANDROID_COMPOSE'
                        )?.isActive,
                        isBlocked: isBlocked(
                          'EXPORT_ANDROID_COMPOSE',
                          this.props.planStatus
                        ),
                        isNew: features.find(
                          (feature) => feature.name === 'EXPORT_ANDROID_COMPOSE'
                        )?.isNew,
                        children: [],
                        action: this.exportHandler,
                      },
                      {
                        label: locals[this.props.lang].export.android.resources,
                        value: 'EXPORT_ANDROID_XML',
                        feature: 'SELECT_EXPORT_FILE',
                        position: 0,
                        type: 'OPTION',
                        isActive: features.find(
                          (feature) => feature.name === 'EXPORT_ANDROID_XML'
                        )?.isActive,
                        isBlocked: isBlocked(
                          'EXPORT_ANDROID_XML',
                          this.props.planStatus
                        ),
                        isNew: features.find(
                          (feature) => feature.name === 'EXPORT_ANDROID_XML'
                        )?.isNew,
                        children: [],
                        action: this.exportHandler,
                      },
                    ],
                    action: this.exportHandler,
                  },
                  {
                    label: locals[this.props.lang].export.csv.spreadsheet,
                    value: 'EXPORT_CSV',
                    feature: 'SELECT_EXPORT_FILE',
                    position: 0,
                    type: 'OPTION',
                    isActive: features.find(
                      (feature) => feature.name === 'EXPORT_CSV'
                    )?.isActive,
                    isBlocked: isBlocked('EXPORT_CSV', this.props.planStatus),
                    isNew: features.find(
                      (feature) => feature.name === 'EXPORT_CSV'
                    )?.isNew,
                    children: [],
                    action: this.exportHandler,
                  },
                ]}
                selected={this.state.format ?? ''}
                parentClassName="controls"
                alignment="RIGHT"
              />
              {this.state.format === 'EXPORT_CSS' && (
                <Menu
                  icon="adjust"
                  id="select-color-space"
                  options={this.state.colorSpace.options}
                  selected={`${this.state.format}_${this.state.colorSpace.selected}`}
                  alignment="BOTTOM_RIGHT"
                />
              )}
            </div>
          </div>
          <div className="export-palette__preview">
            <Input
              id="code-snippet-dragging"
              type="CODE"
              value={this.props.exportPreview}
            />
          </div>
        </div>
        <Actions
          context="EXPORT"
          {...this.props}
        />
      </div>
    )
  }
}
