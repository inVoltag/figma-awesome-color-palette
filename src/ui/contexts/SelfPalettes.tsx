import {
  ActionsItem,
  Bar,
  Button,
  ConsentConfiguration,
  Input,
  List,
  Menu,
  Message,
  SemanticMessage,
} from '@a_ng_d/figmug-ui'
import { PureComponent } from 'preact/compat'
import React from 'react'

import { signIn, supabase } from '../../bridges/publication/authentication'
import sharePalette from '../../bridges/publication/sharePalette'
import unpublishPalette from '../../bridges/publication/unpublishPalette'
import { pageSize, palettesDbTableName } from '../../config'
import { locals } from '../../content/locals'
import { Context, FetchStatus, Language, PlanStatus } from '../../types/app'
import {
  ColorConfiguration,
  MetaConfiguration,
  PaletteConfiguration,
  SourceColorConfiguration,
  UserConfiguration,
} from '../../types/configurations'
import { ExternalPalettes } from '../../types/data'
import { ActionsList } from '../../types/models'
import { UserSession } from '../../types/user'
import { trackPublicationEvent } from '../../utils/eventsTracker'
import getPaletteMeta from '../../utils/setPaletteMeta'

interface SelfPalettesProps {
  context: Context
  currentPage: number
  searchQuery: string
  status: FetchStatus
  palettesList: Array<ExternalPalettes>
  userIdentity: UserConfiguration
  userSession: UserSession
  userConsent: Array<ConsentConfiguration>
  planStatus: PlanStatus
  lang: Language
  onChangeStatus: (status: FetchStatus) => void
  onChangeCurrentPage: (page: number) => void
  onChangeSearchQuery: (query: string) => void
  onLoadPalettesList: (palettes: Array<ExternalPalettes>) => void
}

interface SelfPalettesStates {
  isLoadMoreActionLoading: boolean
  isSignInActionLoading: boolean
  isAddToFileActionLoading: Array<boolean>
  isContextActionLoading: Array<boolean>
}

export default class SelfPalettes extends PureComponent<
  SelfPalettesProps,
  SelfPalettesStates
> {
  constructor(props: SelfPalettesProps) {
    super(props)
    this.state = {
      isLoadMoreActionLoading: false,
      isSignInActionLoading: false,
      isAddToFileActionLoading: [],
      isContextActionLoading: [],
    }
  }

  // Lifecycle
  componentDidMount = async () => {
    window.addEventListener('message', this.handleMessage)

    const actions: ActionsList = {
      UNLOADED: () => {
        this.callUICPAgent(1, '')
        this.props.onChangeStatus('LOADING')
      },
      LOADING: () => null,
      COMPLETE: () => null,
      LOADED: () => null,
    }

    return actions[this.props.status]?.()
  }

  componentDidUpdate = (prevProps: Readonly<SelfPalettesProps>): void => {
    if (
      prevProps.userSession.connectionStatus !==
        this.props.userSession.connectionStatus &&
      this.props.palettesList.length === 0
    )
      this.callUICPAgent(1, '')

    if (prevProps.palettesList.length !== this.props.palettesList.length)
      this.setState({
        isAddToFileActionLoading: Array(this.props.palettesList.length).fill(
          false
        ),
        isContextActionLoading: Array(this.props.palettesList.length).fill(
          false
        ),
      })
  }

  componentWillUnmount = () => {
    window.removeEventListener('message', this.handleMessage)
  }

  // Handlers
  handleMessage = (e: MessageEvent) => {
    const actions: ActionsList = {
      STOP_LOADER: () =>
        this.setState({
          isAddToFileActionLoading: Array(this.props.palettesList.length).fill(
            false
          ),
        }),
      DEFAULT: () => null,
    }

    return actions[e.data.pluginMessage?.type ?? 'DEFAULT']?.()
  }

  // Direct Actions
  updateStatus = (
    batch: Array<ExternalPalettes>,
    currentPage: number,
    searchQuery: string
  ) => {
    if (batch.length === 0 && currentPage === 1 && searchQuery === '')
      return 'EMPTY'
    if (batch.length === 0 && currentPage === 1 && searchQuery !== '')
      return 'NO_RESULT'
    else if (batch.length < pageSize) return 'COMPLETE'
    return 'LOADED'
  }

  callUICPAgent = async (currentPage: number, searchQuery: string) => {
    let data, error

    if (searchQuery === '') {
      // eslint-disable-next-line @typescript-eslint/no-extra-semi
      ;({ data, error } = await supabase
        .from(palettesDbTableName)
        .select(
          'palette_id, screenshot, name, preset, colors, themes, creator_avatar, creator_full_name, creator_id, is_shared'
        )
        .eq('creator_id', this.props.userSession.userId)
        .order('published_at', { ascending: false })
        .range(pageSize * (currentPage - 1), pageSize * currentPage - 1))
    } else {
      // eslint-disable-next-line @typescript-eslint/no-extra-semi
      ;({ data, error } = await supabase
        .from(palettesDbTableName)
        .select(
          'palette_id, screenshot, name, preset, colors, themes, creator_avatar, creator_full_name, creator_id, is_shared'
        )
        .eq('creator_id', this.props.userSession.userId)
        .order('published_at', { ascending: false })
        .range(pageSize * (currentPage - 1), pageSize * currentPage - 1)
        .ilike('name', `%${searchQuery}%`))
    }

    if (!error) {
      const batch = this.props.palettesList.concat(
        data as Array<ExternalPalettes>
      )
      this.props.onLoadPalettesList(batch)
      this.props.onChangeStatus(
        this.updateStatus(
          data as Array<ExternalPalettes>,
          currentPage,
          searchQuery
        )
      )
      this.setState({
        isLoadMoreActionLoading: false,
      })
    } else this.props.onChangeStatus('ERROR')
  }

  onSelectPalette = async (id: string) => {
    const { data, error } = await supabase
      .from(palettesDbTableName)
      .select('*')
      .eq('palette_id', id)

    if (!error && data.length > 0)
      try {
        parent.postMessage(
          {
            pluginMessage: {
              type: 'CREATE_PALETTE',
              data: {
                sourceColors: data[0].colors.map(
                  (color: ColorConfiguration) => {
                    return {
                      name: color.name,
                      rgb: color.rgb,
                      source: 'REMOTE',
                      id: color.id,
                      description: color.description,
                      hue: {
                        shift: color.hue.shift,
                        isLocked: color.hue.isLocked,
                      },
                      chroma: {
                        shift: color.chroma.shift,
                        isLocked: color.chroma.isLocked,
                      },
                    }
                  }
                ) as Array<SourceColorConfiguration>,
                palette: {
                  name: data[0].name,
                  description: data[0].description,
                  preset: data[0].preset,
                  scale: data[0].scale,
                  shift: data[0].shift,
                  areSourceColorsLocked: data[0].are_source_colors_locked,
                  colorSpace: data[0].color_space,
                  visionSimulationMode: data[0].vision_simulation_mode,
                  view: data[0].view,
                  textColorsTheme: data[0].text_colors_theme,
                  algorithmVersion: data[0].algorithm_version,
                } as Partial<PaletteConfiguration>,
                themes: data[0].themes,
                isRemote: true,
                paletteMeta: {
                  id: data[0].palette_id,
                  dates: {
                    createdAt: data[0].created_at,
                    updatedAt: data[0].updated_at,
                    publishedAt: data[0].published_at,
                  },
                  publicationStatus: {
                    isPublished: true,
                    isShared: data[0].is_shared,
                  },
                  creatorIdentity: {
                    creatorFullName: data[0].creator_full_name,
                    creatorAvatar: data[0].creator_avatar,
                    creatorId: data[0].creator_id,
                  },
                } as MetaConfiguration,
              },
            },
          },
          '*'
        )

        trackPublicationEvent(
          this.props.userIdentity.id,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature:
              this.props.userSession.userId === data[0].creator_id
                ? 'REUSE_PALETTE'
                : 'ADD_PALETTE',
          }
        )

        return
      } catch {
        throw error
      }
    else throw error
  }

  // Templates
  ExternalPalettesList = () => {
    let fragment

    if (this.props.status === 'LOADED')
      fragment = (
        <Bar
          soloPartSlot={
            <Button
              type="secondary"
              label={locals[this.props.lang].palettes.lazyLoad.loadMore}
              isLoading={this.state.isLoadMoreActionLoading}
              action={() => {
                this.props.onChangeCurrentPage(this.props.currentPage + 1)
                this.callUICPAgent(
                  this.props.currentPage + 1,
                  this.props.searchQuery
                )
                this.setState({
                  isLoadMoreActionLoading: true,
                })
              }}
            />
          }
          padding="var(--size-xxsmall) var(--size-xsmall)"
        />
      )
    else if (this.props.status === 'COMPLETE')
      fragment = (
        <Bar
          soloPartSlot={
            <Message
              icon="check"
              messages={[
                locals[this.props.lang].palettes.lazyLoad.completeList,
              ]}
            />
          }
          padding="var(--size-xxsmall) var(--size-xsmall)"
        />
      )

    return (
      <List
        isLoading={this.props.status === 'LOADING'}
        isMessage={
          this.props.status === 'ERROR' ||
          this.props.status === 'EMPTY' ||
          this.props.status === 'NO_RESULT'
        }
      >
        {this.props.status === 'ERROR' && (
          <SemanticMessage
            type="WARNING"
            message={locals[this.props.lang].error.fetchPalette}
          />
        )}
        {this.props.status === 'EMPTY' && (
          <SemanticMessage
            type="NEUTRAL"
            message={locals[this.props.lang].warning.noSelfPaletteOnRemote}
          />
        )}
        {this.props.status === 'NO_RESULT' && (
          <SemanticMessage
            type="NEUTRAL"
            message={locals[this.props.lang].info.noResult}
          />
        )}
        {(this.props.status === 'LOADED' || this.props.status === 'COMPLETE') &&
          this.props.palettesList.map((palette, index: number) => (
            <ActionsItem
              id={palette.palette_id}
              key={`palette-${index}`}
              src={palette.screenshot}
              name={palette.name}
              description={palette.preset?.name}
              subdescription={getPaletteMeta(
                palette.colors ?? [],
                palette.themes ?? []
              )}
              indicator={
                palette.is_shared
                  ? {
                      status: 'ACTIVE',
                      label: locals[this.props.lang].publication.statusShared,
                    }
                  : undefined
              }
              actionsSlot={
                <>
                  <Menu
                    id="publication-options"
                    icon="ellipses"
                    options={[
                      {
                        label: locals[this.props.lang].publication.unpublish,
                        type: 'OPTION',
                        isActive: true,
                        isBlocked: false,
                        isNew: false,
                        action: async () => {
                          this.setState({
                            isContextActionLoading:
                              this.state.isContextActionLoading.map(
                                (loading, i) => (i === index ? true : loading)
                              ),
                          })
                          unpublishPalette(
                            {
                              id: palette.palette_id,
                              userSession: this.props.userSession,
                            },
                            true
                          )
                            .then(() => {
                              const currentPalettesList =
                                this.props.palettesList.filter(
                                  (pal) => pal.palette_id !== palette.palette_id
                                )

                              parent.postMessage(
                                {
                                  pluginMessage: {
                                    type: 'SEND_MESSAGE',
                                    message:
                                      locals[this.props.lang].success
                                        .nonPublication,
                                  },
                                },
                                '*'
                              )
                              this.props.onLoadPalettesList(currentPalettesList)

                              if (currentPalettesList.length === 0)
                                this.props.onChangeStatus('EMPTY')
                              if (currentPalettesList.length < pageSize)
                                this.props.onChangeCurrentPage(1)

                              trackPublicationEvent(
                                this.props.userIdentity.id,
                                this.props.userConsent.find(
                                  (consent) => consent.id === 'mixpanel'
                                )?.isConsented ?? false,
                                {
                                  feature: 'UNPUBLISH_PALETTE',
                                }
                              )
                            })
                            .finally(() => {
                              this.setState({
                                isContextActionLoading:
                                  this.state.isContextActionLoading.map(
                                    (loading, i) =>
                                      i === index ? false : loading
                                  ),
                              })
                            })
                            .catch(() => {
                              parent.postMessage(
                                {
                                  pluginMessage: {
                                    type: 'SEND_MESSAGE',
                                    message:
                                      locals[this.props.lang].error
                                        .nonPublication,
                                  },
                                },
                                '*'
                              )
                            })
                        },
                      },
                      {
                        label: palette.is_shared
                          ? locals[this.props.lang].publication.unshare
                          : locals[this.props.lang].publication.share,
                        type: 'OPTION',
                        isActive: true,
                        isBlocked: false,
                        isNew: false,
                        action: async () => {
                          this.setState({
                            isContextActionLoading:
                              this.state.isContextActionLoading.map(
                                (loading, i) => (i === index ? true : loading)
                              ),
                          })
                          sharePalette(palette.palette_id, !palette.is_shared)
                            .then(() => {
                              parent.postMessage(
                                {
                                  pluginMessage: {
                                    type: 'SEND_MESSAGE',
                                    message: !palette.is_shared
                                      ? locals[this.props.lang].success.share
                                      : locals[this.props.lang].success.unshare,
                                  },
                                },
                                '*'
                              )

                              const currentPalettesList =
                                this.props.palettesList.map((pal) =>
                                  pal.palette_id === palette.palette_id
                                    ? {
                                        ...pal,
                                        is_shared: !pal.is_shared,
                                      }
                                    : pal
                                )
                              this.props.onLoadPalettesList(currentPalettesList)

                              trackPublicationEvent(
                                this.props.userIdentity.id,
                                this.props.userConsent.find(
                                  (consent) => consent.id === 'mixpanel'
                                )?.isConsented ?? false,
                                {
                                  feature: 'SHARE_PALETTE',
                                }
                              )
                            })
                            .finally(() => {
                              this.setState({
                                isContextActionLoading:
                                  this.state.isContextActionLoading.map(
                                    (loading, i) =>
                                      i === index ? false : loading
                                  ),
                              })
                            })
                            .catch(() => {
                              parent.postMessage(
                                {
                                  pluginMessage: {
                                    type: 'SEND_MESSAGE',
                                    message: !palette.is_shared
                                      ? locals[this.props.lang].error.share
                                      : locals[this.props.lang].error.unshare,
                                  },
                                },
                                '*'
                              )
                            })
                        },
                      },
                    ]}
                    state={
                      this.state.isContextActionLoading[index]
                        ? 'LOADING'
                        : 'DEFAULT'
                    }
                    alignment="BOTTOM_RIGHT"
                  />
                  <Button
                    type="secondary"
                    label={locals[this.props.lang].actions.addToFile}
                    isLoading={this.state.isAddToFileActionLoading[index]}
                    action={() => {
                      this.setState({
                        isAddToFileActionLoading: this.state[
                          'isAddToFileActionLoading'
                        ].map((loading, i) => (i === index ? true : loading)),
                      })

                      this.onSelectPalette(palette.palette_id ?? '').catch(
                        () => {
                          this.setState({
                            isAddToFileActionLoading: Array(
                              this.props.palettesList.length
                            ).fill(false),
                          })

                          parent.postMessage(
                            {
                              pluginMessage: {
                                type: 'SEND_MESSAGE',
                                message:
                                  locals[this.props.lang].error.addToFile,
                              },
                            },
                            '*'
                          )
                        }
                      )
                    }}
                  />
                </>
              }
            />
          ))}
        {fragment}
      </List>
    )
  }

  // Render
  render() {
    let fragment

    if (this.props.status !== 'SIGN_IN_FIRST')
      fragment = <this.ExternalPalettesList />
    else
      fragment = (
        <SemanticMessage
          type="NEUTRAL"
          message={locals[this.props.lang].palettes.signInFirst.message}
          orientation="VERTICAL"
          actionsSlot={
            <Button
              type="primary"
              label={locals[this.props.lang].palettes.signInFirst.signIn}
              isLoading={this.state.isSignInActionLoading}
              action={async () => {
                this.setState({ isSignInActionLoading: true })
                signIn(this.props.userIdentity.id)
                  .finally(() => {
                    this.setState({ isSignInActionLoading: false })
                  })
                  .catch((error) => {
                    parent.postMessage(
                      {
                        pluginMessage: {
                          type: 'SEND_MESSAGE',
                          message:
                            error.message === 'Authentication timeout'
                              ? locals[this.props.lang].error.timeout
                              : locals[this.props.lang].error.authentication,
                        },
                      },
                      '*'
                    )
                  })
              }}
            />
          }
        />
      )

    return (
      <>
        {this.props.status !== 'SIGN_IN_FIRST' &&
          this.props.status !== 'EMPTY' && (
            <Bar
              soloPartSlot={
                <Input
                  type="TEXT"
                  icon={{
                    type: 'PICTO',
                    value: 'search',
                  }}
                  placeholder={locals[this.props.lang].palettes.lazyLoad.search}
                  value={this.props.searchQuery}
                  isClearable
                  isFramed={false}
                  onChange={(e) => {
                    this.props.onChangeSearchQuery(
                      (e.target as HTMLInputElement).value
                    )
                    this.props.onChangeStatus('LOADING')
                    this.props.onChangeCurrentPage(1)
                    this.props.onLoadPalettesList([])
                    this.callUICPAgent(1, (e.target as HTMLInputElement).value)
                  }}
                  onClear={(e) => {
                    this.props.onChangeSearchQuery(e)
                    this.props.onChangeStatus('LOADING')
                    this.props.onChangeCurrentPage(1)
                    this.props.onLoadPalettesList([])
                    this.callUICPAgent(1, e)
                  }}
                />
              }
              border={['BOTTOM']}
              isFullWidth
            />
          )}
        {fragment}
      </>
    )
  }
}
