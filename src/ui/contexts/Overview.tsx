import {
  Accordion,
  ColorItem,
  ConsentConfiguration,
  FormItem,
  Input,
  Message,
  SectionTitle,
} from '@a_ng_d/figmug-ui'
import chroma from 'chroma-js'
import React from 'react'
import { PureComponent } from 'preact/compat'
import { uid } from 'uid'

import { locals } from '../../content/locals'
import { ImportUrl, Language, PlanStatus, ThirdParty } from '../../types/app'
import {
  SourceColorConfiguration,
  UserConfiguration,
} from '../../types/configurations'
import features from '../../utils/config'
import { trackImportEvent } from '../../utils/eventsTracker'
import isBlocked from '../../utils/isBlocked'
import Feature from '../components/Feature'

interface OverviewProps {
  sourceColors: Array<SourceColorConfiguration>
  userIdentity: UserConfiguration
  userConsent: Array<ConsentConfiguration>
  planStatus: PlanStatus
  lang: Language
  onChangeColorsFromImport: (
    onChangeColorsFromImport: Array<SourceColorConfiguration>,
    source: ThirdParty
  ) => void
  onChangeContexts: () => void
}

interface OverviewStates {
  coolorsUrl: ImportUrl
  realtimeColorsUrl: ImportUrl
  isCoolorsImportOpen: boolean
  isRealtimeColorsImportOpen: boolean
  isColourLoversImportOpen: boolean
}

export default class Overview extends PureComponent<OverviewProps, OverviewStates> {
  constructor(props: OverviewProps) {
    super(props)
    this.state = {
      coolorsUrl: {
        value: '' as string,
        state: 'DEFAULT' as 'DEFAULT' | 'ERROR',
        canBeSubmitted: false,
        helper: undefined,
      },
      isCoolorsImportOpen:
        this.props.sourceColors.filter((color) => color.source === 'COOLORS')
          .length > 0,
      realtimeColorsUrl: {
        value: '' as string,
        state: 'DEFAULT' as 'DEFAULT' | 'ERROR',
        canBeSubmitted: false,
        helper: undefined,
      },
      isRealtimeColorsImportOpen:
        this.props.sourceColors.filter(
          (color) => color.source === 'REALTIME_COLORS'
        ).length > 0,
      isColourLoversImportOpen:
        this.props.sourceColors.filter(
          (color) => color.source === 'COLOUR_LOVERS'
        ).length > 0,
    }
  }

  // Lifecycle
  componentWillUnmount(): void {
    this.setState({
      coolorsUrl: {
        value: '',
        state: 'DEFAULT',
        canBeSubmitted: false,
        helper: undefined,
      },
      realtimeColorsUrl: {
        value: '',
        state: 'DEFAULT',
        canBeSubmitted: false,
        helper: undefined,
      },
    })
  }

  // Handlers
  isTypingCoolorsUrlHandler = (e: Event) =>
    this.setState((state) => ({
      coolorsUrl: {
        value: (e.target as HTMLInputElement).value,
        state: !(e.target as HTMLInputElement).value.includes(
          'https://coolors.co'
        )
          ? 'DEFAULT'
          : state.coolorsUrl.state,
        canBeSubmitted: (e.target as HTMLInputElement).value.includes(
          'https://coolors.co'
        )
          ? true
          : false,
        helper: !(e.target as HTMLInputElement).value.includes(
          'https://coolors.co'
        )
          ? {
              type: 'INFO',
              message: locals[this.props.lang].source.coolors.url.infoMessage,
            }
          : state.coolorsUrl.helper,
      },
    }))

  isTypingRealtimeColorsUrlHandler = (e: Event) =>
    this.setState((state) => ({
      realtimeColorsUrl: {
        value: (e.target as HTMLInputElement).value,
        state: !(e.target as HTMLInputElement).value.includes(
          'https://www.realtimecolors.com'
        )
          ? 'DEFAULT'
          : state.realtimeColorsUrl.state,
        canBeSubmitted: (e.target as HTMLInputElement).value.includes(
          'https://www.realtimecolors.com'
        )
          ? true
          : false,
        helper: !(e.target as HTMLInputElement).value.includes(
          'https://www.realtimecolors.com'
        )
          ? {
              type: 'INFO',
              message:
                locals[this.props.lang].source.realtimeColors.url.infoMessage,
            }
          : state.realtimeColorsUrl.helper,
      },
    }))

  importColorsFromCoolorsHandler = () => {
    const url: string = this.state.coolorsUrl.value,
      hexs = url.match(/([0-9a-fA-F]{6}-)+[0-9a-fA-F]{6}/)

    if (hexs !== null) {
      this.props.onChangeColorsFromImport(
        hexs[0].split('-').map((hex) => {
          const gl = chroma(hex).gl()
          return {
            name: hex,
            rgb: {
              r: gl[0],
              g: gl[1],
              b: gl[2],
            },
            source: 'COOLORS',
            id: uid(),
            isRemovable: false,
          }
        }),
        'COOLORS'
      )
      this.setState({
        coolorsUrl: {
          value: '',
          state: 'DEFAULT',
          canBeSubmitted: false,
          helper: undefined,
        },
      })
      trackImportEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'IMPORT_COOLORS',
        }
      )
    } else
      this.setState({
        coolorsUrl: {
          value: this.state.coolorsUrl.value,
          state: 'ERROR',
          canBeSubmitted: this.state.coolorsUrl.canBeSubmitted,
          helper: {
            type: 'ERROR',
            message: locals[this.props.lang].source.coolors.url.errorMessage,
          },
        },
      })
  }

  importColorsFromRealtimeColorsHandler = () => {
    const url: string = this.state.realtimeColorsUrl.value,
      hexs = url.match(/([0-9a-fA-F]{6}-)+[0-9a-fA-F]{6}/)

    if (hexs !== null) {
      this.props.onChangeColorsFromImport(
        hexs[0].split('-').map((hex) => {
          const gl = chroma(hex).gl()
          return {
            name: hex,
            rgb: {
              r: gl[0],
              g: gl[1],
              b: gl[2],
            },
            source: 'REALTIME_COLORS',
            id: uid(),
            isRemovable: false,
          }
        }),
        'REALTIME_COLORS'
      )
      this.setState({
        realtimeColorsUrl: {
          value: '',
          state: 'DEFAULT',
          canBeSubmitted: false,
          helper: undefined,
        },
      })
      trackImportEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'IMPORT_REALTIME_COLORS',
        }
      )
    } else
      this.setState({
        realtimeColorsUrl: {
          value: this.state.realtimeColorsUrl.value,
          state: 'ERROR',
          canBeSubmitted: this.state.realtimeColorsUrl.canBeSubmitted,
          helper: {
            type: 'ERROR',
            message:
              locals[this.props.lang].source.realtimeColors.url.errorMessage,
          },
        },
      })
  }

  // Templates
  SelectedColors = () => {
    return (
      <>
        <div className="section-controls">
          <div className="section-controls__left-part">
            <SectionTitle
              label={locals[this.props.lang].source.canvas.title}
              indicator={
                this.props.sourceColors.filter(
                  (sourceColor) => sourceColor.source === 'CANVAS'
                ).length
              }
            />
          </div>
          <div className="section-controls__right-part"></div>
        </div>
        {this.props.sourceColors.filter(
          (sourceColor) => sourceColor.source === 'CANVAS'
        ).length > 0 ? (
          <ul className="list">
            {this.props.sourceColors
              .filter((sourceColor) => sourceColor.source === 'CANVAS')
              .map((sourceColor) => {
                return (
                  <ColorItem
                    key={sourceColor.id}
                    name={sourceColor.name}
                    hex={chroma(
                      sourceColor.rgb.r * 255,
                      sourceColor.rgb.g * 255,
                      sourceColor.rgb.b * 255
                    )
                      .hex()
                      .toUpperCase()}
                    id={sourceColor.id}
                    canBeRemoved={sourceColor.isRemovable}
                  />
                )
              })}
          </ul>
        ) : (
          <Message
            icon="info"
            messages={[locals[this.props.lang].source.canvas.tip]}
          />
        )}
      </>
    )
  }

  CoolorsColors = () => {
    return (
      <>
        <Accordion
          label={locals[this.props.lang].source.coolors.title}
          indicator={this.props.sourceColors
            .filter((sourceColor) => sourceColor.source === 'COOLORS')
            .length.toString()}
          helper={locals[this.props.lang].source.coolors.helper}
          isExpanded={this.state.isCoolorsImportOpen}
          isBlocked={isBlocked('SOURCE_COOLORS', this.props.planStatus)}
          isNew={
            features.find((feature) => feature.name === 'SOURCE_COOLORS')?.isNew
          }
          onAdd={() => {
            this.setState({ isCoolorsImportOpen: true })
          }}
          onEmpty={() => {
            this.props.onChangeColorsFromImport([], 'COOLORS')
            this.setState({
              isCoolorsImportOpen: false,
              coolorsUrl: {
                value: '',
                state: 'DEFAULT',
                canBeSubmitted: false,
                helper: undefined,
              },
            })
          }}
        >
          <div className="settings__item">
            <FormItem
              id="coolors-palette-url"
              helper={this.state.coolorsUrl.helper}
            >
              <Input
                type="TEXT"
                state={this.state.coolorsUrl.state}
                placeholder={
                  locals[this.props.lang].source.coolors.url.placeholder
                }
                value={this.state.coolorsUrl.value}
                isAutoFocus={true}
                onChange={this.isTypingCoolorsUrlHandler}
                onConfirm={() => {
                  if (this.state.coolorsUrl.canBeSubmitted) {
                    this.importColorsFromCoolorsHandler()
                  }
                }}
                onBlur={() => {
                  if (this.state.coolorsUrl.canBeSubmitted) {
                    this.importColorsFromCoolorsHandler()
                  }
                }}
              />
            </FormItem>
          </div>
          <ul className="list">
            {this.props.sourceColors
              .filter((sourceColor) => sourceColor.source === 'COOLORS')
              .map((sourceColor) => {
                return (
                  <ColorItem
                    key={sourceColor.id}
                    name={sourceColor.name}
                    hex={chroma(
                      sourceColor.rgb.r * 255,
                      sourceColor.rgb.g * 255,
                      sourceColor.rgb.b * 255
                    )
                      .hex()
                      .toUpperCase()}
                    id={sourceColor.id}
                  />
                )
              })}
          </ul>
        </Accordion>
      </>
    )
  }

  RealtimeColorsColors = () => {
    return (
      <>
        <Accordion
          label={locals[this.props.lang].source.realtimeColors.title}
          indicator={this.props.sourceColors
            .filter((sourceColor) => sourceColor.source === 'REALTIME_COLORS')
            .length.toString()}
          helper={locals[this.props.lang].source.realtimeColors.helper}
          isExpanded={this.state.isRealtimeColorsImportOpen}
          isBlocked={isBlocked('SOURCE_REALTIME_COLORS', this.props.planStatus)}
          isNew={
            features.find(
              (feature) => feature.name === 'SOURCE_REALTIME_COLORS'
            )?.isNew
          }
          onAdd={() => {
            this.setState({ isRealtimeColorsImportOpen: true })
          }}
          onEmpty={() => {
            this.props.onChangeColorsFromImport([], 'REALTIME_COLORS')
            this.setState({
              isRealtimeColorsImportOpen: false,
              realtimeColorsUrl: {
                value: '',
                state: 'DEFAULT',
                canBeSubmitted: false,
                helper: undefined,
              },
            })
          }}
        >
          <div className="settings__item">
            <FormItem
              id="realtime-colors-url"
              helper={this.state.realtimeColorsUrl.helper}
            >
              <Input
                type="TEXT"
                state={this.state.realtimeColorsUrl.state}
                placeholder={
                  locals[this.props.lang].source.realtimeColors.url.placeholder
                }
                value={this.state.realtimeColorsUrl.value}
                isAutoFocus={true}
                onChange={this.isTypingRealtimeColorsUrlHandler}
                onConfirm={() => {
                  if (this.state.realtimeColorsUrl.canBeSubmitted) {
                    this.importColorsFromRealtimeColorsHandler()
                  }
                }}
                onBlur={() => {
                  if (this.state.realtimeColorsUrl.canBeSubmitted) {
                    this.importColorsFromRealtimeColorsHandler()
                  }
                }}
              />
            </FormItem>
          </div>
          <ul className="list">
            {this.props.sourceColors
              .filter((sourceColor) => sourceColor.source === 'REALTIME_COLORS')
              .map((sourceColor) => {
                return (
                  <ColorItem
                    key={sourceColor.id}
                    name={sourceColor.name}
                    hex={chroma(
                      sourceColor.rgb.r * 255,
                      sourceColor.rgb.g * 255,
                      sourceColor.rgb.b * 255
                    )
                      .hex()
                      .toUpperCase()}
                    id={sourceColor.id}
                  />
                )
              })}
          </ul>
        </Accordion>
      </>
    )
  }

  ColourLoversColors = () => {
    return (
      <>
        <Accordion
          label={locals[this.props.lang].source.colourLovers.title}
          indicator={this.props.sourceColors
            .filter((sourceColor) => sourceColor.source === 'COLOUR_LOVERS')
            .length.toString()}
          icon="adjust"
          helper={locals[this.props.lang].source.colourLovers.helper}
          isExpanded={this.state.isColourLoversImportOpen}
          isBlocked={isBlocked('SOURCE_EXPLORE', this.props.planStatus)}
          isNew={
            features.find((feature) => feature.name === 'SOURCE_EXPLORE')?.isNew
          }
          onAdd={this.props.onChangeContexts}
          onEmpty={() => {
            this.props.onChangeColorsFromImport([], 'COLOUR_LOVERS')
            this.setState({
              isColourLoversImportOpen: false,
            })
          }}
        >
          <ul className="list">
            {this.props.sourceColors
              .filter((sourceColor) => sourceColor.source === 'COLOUR_LOVERS')
              .map((sourceColor) => {
                return (
                  <ColorItem
                    key={sourceColor.id}
                    name={sourceColor.name}
                    hex={chroma(
                      sourceColor.rgb.r * 255,
                      sourceColor.rgb.g * 255,
                      sourceColor.rgb.b * 255
                    )
                      .hex()
                      .toUpperCase()}
                    id={sourceColor.id}
                  />
                )
              })}
          </ul>
        </Accordion>
      </>
    )
  }

  // Render
  render() {
    return (
      <div className="controls__control controls__control--horizontal">
        <div className="control__block control__block--list">
          <Feature
            isActive={
              features.find((feature) => feature.name === 'SOURCE_CANVAS')
                ?.isActive
            }
          >
            <this.SelectedColors />
          </Feature>
        </div>
        <div className="control__block control__block--no-padding">
          <Feature
            isActive={
              features.find((feature) => feature.name === 'SOURCE_COOLORS')
                ?.isActive
            }
          >
            <this.CoolorsColors />
          </Feature>
          <Feature
            isActive={
              features.find(
                (feature) => feature.name === 'SOURCE_REALTIME_COLORS'
              )?.isActive
            }
          >
            <this.RealtimeColorsColors />
          </Feature>
          <Feature
            isActive={
              features.find(
                (feature) => feature.name === 'SOURCE_COLOUR_LOVERS'
              )?.isActive
            }
          >
            <this.ColourLoversColors />
          </Feature>
        </div>
      </div>
    )
  }
}
