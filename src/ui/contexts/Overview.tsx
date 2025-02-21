import {
  Accordion,
  Button,
  ColorItem,
  ConsentConfiguration,
  FormItem,
  Input,
  Layout,
  List,
  Message,
  SectionTitle,
  SemanticMessage,
  SimpleItem,
} from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import chroma from 'chroma-js'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { uid } from 'uid'

import features from '../../config'
import { locals } from '../../content/locals'
import {
  ImportUrl,
  Language,
  PlanStatus,
  PriorityContext,
  ThirdParty,
} from '../../types/app'
import {
  SourceColorConfiguration,
  UserConfiguration,
} from '../../types/configurations'
import { trackImportEvent } from '../../utils/eventsTracker'
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
  onGetProPlan: (context: { priorityContainerContext: PriorityContext }) => void
}

interface OverviewStates {
  coolorsUrl: ImportUrl
  realtimeColorsUrl: ImportUrl
  isCoolorsImportOpen: boolean
  isRealtimeColorsImportOpen: boolean
  isColourLoversImportOpen: boolean
}

export default class Overview extends PureComponent<
  OverviewProps,
  OverviewStates
> {
  static features = (planStatus: PlanStatus) => ({
    SOURCE: new FeatureStatus({
      features: features,
      featureName: 'SOURCE',
      planStatus: planStatus,
    }),
    SOURCE_CANVAS: new FeatureStatus({
      features: features,
      featureName: 'SOURCE_CANVAS',
      planStatus: planStatus,
    }),
    SOURCE_COOLORS: new FeatureStatus({
      features: features,
      featureName: 'SOURCE_COOLORS',
      planStatus: planStatus,
    }),
    SOURCE_REALTIME_COLORS: new FeatureStatus({
      features: features,
      featureName: 'SOURCE_REALTIME_COLORS',
      planStatus: planStatus,
    }),
    SOURCE_COLOUR_LOVERS: new FeatureStatus({
      features: features,
      featureName: 'SOURCE_COLOUR_LOVERS',
      planStatus: planStatus,
    }),
    SOURCE_EXPLORE: new FeatureStatus({
      features: features,
      featureName: 'SOURCE_EXPLORE',
      planStatus: planStatus,
    }),
  })
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
        <SimpleItem
          id="watch-swatchs"
          leftPartSlot={
            <SectionTitle
              label={locals[this.props.lang].source.canvas.title}
              indicator={
                this.props.sourceColors.filter(
                  (sourceColor) => sourceColor.source === 'CANVAS'
                ).length
              }
            />
          }
        />
        {Overview.features(this.props.planStatus).SOURCE.isReached(
          this.props.sourceColors.length - 1
        ) && (
          <div
            style={{
              padding: 'var(--size-xxxsmall) var(--size-xsmall)',
            }}
          >
            <SemanticMessage
              type="INFO"
              message={locals[
                this.props.lang
              ].info.maxNumberOfSourceColors.replace(
                '$1',
                Overview.features(this.props.planStatus).SOURCE.limit
              )}
              actionsSlot={
                <Button
                  type="secondary"
                  label={locals[this.props.lang].plan.getPro}
                  action={() =>
                    parent.postMessage(
                      { pluginMessage: { type: 'GET_PRO_PLAN' } },
                      '*'
                    )
                  }
                />
              }
            />
          </div>
        )}
        {this.props.sourceColors.filter(
          (sourceColor) => sourceColor.source === 'CANVAS'
        ).length > 0 ? (
          <List>
            {this.props.sourceColors
              .filter((sourceColor) => sourceColor.source === 'CANVAS')
              .sort((a, b) => {
                if (a.name.localeCompare(b.name) > 0) return 1
                else if (a.name.localeCompare(b.name) < 0) return -1
                else return 0
              })
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
          </List>
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
          isBlocked={Overview.features(
            this.props.planStatus
          ).SOURCE_COOLORS.isBlocked()}
          isNew={Overview.features(
            this.props.planStatus
          ).SOURCE_COOLORS.isNew()}
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
          <div style={{ padding: '0 var(--size-xsmall)' }}>
            <FormItem
              id="update-coolors-url"
              helper={this.state.coolorsUrl.helper}
            >
              <Input
                id="update-coolors-url"
                type="TEXT"
                state={this.state.coolorsUrl.state}
                placeholder={
                  locals[this.props.lang].source.coolors.url.placeholder
                }
                value={this.state.coolorsUrl.value}
                isAutoFocus={true}
                onChange={this.isTypingCoolorsUrlHandler}
                onBlur={() => {
                  if (this.state.coolorsUrl.canBeSubmitted)
                    this.importColorsFromCoolorsHandler()
                }}
              />
            </FormItem>
          </div>
          <List>
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
          </List>
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
          isBlocked={Overview.features(
            this.props.planStatus
          ).SOURCE_REALTIME_COLORS.isBlocked()}
          isNew={Overview.features(
            this.props.planStatus
          ).SOURCE_REALTIME_COLORS.isNew()}
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
          <div style={{ padding: '0 var(--size-xsmall)' }}>
            <FormItem
              id="update-realtime-colors-url"
              helper={this.state.realtimeColorsUrl.helper}
            >
              <Input
                id="update-realtime-colors-url"
                type="TEXT"
                state={this.state.realtimeColorsUrl.state}
                placeholder={
                  locals[this.props.lang].source.realtimeColors.url.placeholder
                }
                value={this.state.realtimeColorsUrl.value}
                isAutoFocus={true}
                onChange={this.isTypingRealtimeColorsUrlHandler}
                onBlur={() => {
                  if (this.state.realtimeColorsUrl.canBeSubmitted)
                    this.importColorsFromRealtimeColorsHandler()
                }}
              />
            </FormItem>
          </div>
          <List>
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
          </List>
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
          isBlocked={Overview.features(
            this.props.planStatus
          ).SOURCE_EXPLORE.isBlocked()}
          isNew={Overview.features(
            this.props.planStatus
          ).SOURCE_EXPLORE.isNew()}
          onAdd={this.props.onChangeContexts}
          onEmpty={() => {
            this.props.onChangeColorsFromImport([], 'COLOUR_LOVERS')
            this.setState({
              isColourLoversImportOpen: false,
            })
          }}
        >
          <List>
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
          </List>
        </Accordion>
      </>
    )
  }

  // Render
  render() {
    return (
      <Layout
        id="overview"
        column={[
          {
            node: (
              <Feature
                isActive={Overview.features(
                  this.props.planStatus
                ).SOURCE_CANVAS.isActive()}
              >
                <this.SelectedColors />
              </Feature>
            ),
            typeModifier: 'LIST',
          },
          {
            node: (
              <>
                <Feature
                  isActive={Overview.features(
                    this.props.planStatus
                  ).SOURCE_COOLORS.isActive()}
                >
                  <this.CoolorsColors />
                </Feature>
                <Feature
                  isActive={Overview.features(
                    this.props.planStatus
                  ).SOURCE_REALTIME_COLORS.isActive()}
                >
                  <this.RealtimeColorsColors />
                </Feature>
                <Feature
                  isActive={Overview.features(
                    this.props.planStatus
                  ).SOURCE_COLOUR_LOVERS.isActive()}
                >
                  <this.ColourLoversColors />
                </Feature>
              </>
            ),
            typeModifier: 'BLANK',
          },
        ]}
        isFullHeight
      />
    )
  }
}
