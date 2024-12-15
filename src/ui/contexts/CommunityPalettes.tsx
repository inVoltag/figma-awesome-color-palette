import {
  ActionsItem,
  Bar,
  Button,
  ConsentConfiguration,
  Icon,
  Input,
  Message,
  SemanticMessage,
} from '@a_ng_d/figmug-ui'
import { PureComponent } from 'preact/compat'
import React from 'react'

import { supabase } from '../../bridges/publication/authentication'
import { pageSize, palettesDbTableName } from '../../config'
import { locals } from '../../content/locals'
import { Context, FetchStatus, Language, PlanStatus } from '../../types/app'
import {
  ColorConfiguration,
  MetaConfiguration,
  PaletteConfiguration,
  SourceColorConfiguration,
  ThemeConfiguration,
  UserConfiguration,
} from '../../types/configurations'
import { ExternalPalettes } from '../../types/data'
import { ActionsList } from '../../types/models'
import { UserSession } from '../../types/user'
import { trackPublicationEvent } from '../../utils/eventsTracker'

interface CommunityPalettesProps {
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

interface CommunityPalettesStates {
  isLoadMoreActionLoading: boolean
  isSignInLoading: boolean
  isAddToFileActionLoading: Array<boolean>
}

export default class CommunityPalettes extends PureComponent<
  CommunityPalettesProps,
  CommunityPalettesStates
> {
  constructor(props: CommunityPalettesProps) {
    super(props)
    this.state = {
      isLoadMoreActionLoading: false,
      isSignInLoading: false,
      isAddToFileActionLoading: [],
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

  componentDidUpdate = (prevProps: Readonly<CommunityPalettesProps>): void => {
    if (prevProps.palettesList.length !== this.props.palettesList.length)
      this.setState({
        isAddToFileActionLoading: Array(this.props.palettesList.length).fill(
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

  // Direct actions
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
          'palette_id, screenshot, name, preset, colors, themes, creator_avatar, creator_full_name, is_shared'
        )
        .eq('is_shared', true)
        .order('published_at', { ascending: false })
        .range(pageSize * (currentPage - 1), pageSize * currentPage - 1))
    } else {
      // eslint-disable-next-line @typescript-eslint/no-extra-semi
      ;({ data, error } = await supabase
        .from(palettesDbTableName)
        .select(
          'palette_id, screenshot, name, preset, colors, themes, creator_avatar, creator_full_name, is_shared'
        )
        .eq('is_shared', true)
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
                    }
                  }
                ) as Array<SourceColorConfiguration>,
                palette: {
                  name: data[0].name,
                  description: data[0].description,
                  preset: data[0].preset,
                  scale: data[0].scale,
                  shift: data[0].shift,
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
      )
    else if (this.props.status === 'COMPLETE')
      fragment = (
        <Message
          icon="check"
          messages={[locals[this.props.lang].palettes.lazyLoad.completeList]}
        />
      )

    return (
      <ul
        className={[
          'rich-list',
          this.props.status === 'LOADING' && 'rich-list--loading',
          (this.props.status === 'ERROR' ||
            this.props.status === 'EMPTY' ||
            this.props.status === 'NO_RESULT') &&
            'rich-list--message',
        ]
          .filter((n) => n)
          .join(' ')}
      >
        {this.props.status === 'LOADING' && (
          <Icon
            type="PICTO"
            iconName="spinner"
            customClassName="control__block__loader"
          />
        )}
        {this.props.status === 'ERROR' && (
          <div className="callout--centered">
            <SemanticMessage
              type="WARNING"
              message={locals[this.props.lang].error.fetchPalette}
            />
          </div>
        )}
        {this.props.status === 'EMPTY' && (
          <div className="callout--centered">
            <SemanticMessage
              type="NEUTRAL"
              message={
                locals[this.props.lang].warning.noCommunityPaletteOnRemote
              }
            />
          </div>
        )}
        {this.props.status === 'NO_RESULT' && (
          <div className="callout--centered">
            <SemanticMessage
              type="NEUTRAL"
              message={locals[this.props.lang].info.noResult}
            />
          </div>
        )}
        {(this.props.status === 'LOADED' || this.props.status === 'COMPLETE') &&
          this.props.palettesList.map((palette, index: number) => (
            <ActionsItem
              id={palette.palette_id}
              key={`palette-${index}`}
              src={palette.screenshot}
              name={palette.name}
              description={palette.preset?.name}
              subdescription={this.getPaletteMeta(
                palette.colors ?? [],
                palette.themes ?? []
              )}
              user={{
                avatar: palette.creator_avatar ?? '',
                name: palette.creator_full_name ?? '',
              }}
              actionsSlot={
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
                    this.onSelectPalette(palette.palette_id ?? '').catch(() => {
                      parent.postMessage(
                        {
                          pluginMessage: {
                            type: 'SEND_MESSAGE',
                            message: locals[this.props.lang].error.addToFile,
                          },
                        },
                        '*'
                      )
                    })
                  }}
                />
              }
            />
          ))}
        <div className="list-control">{fragment}</div>
      </ul>
    )
  }

  // Render
  render() {
    return (
      <div className="controls__control">
        <div className="control__block control__block--no-padding">
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
                    placeholder={
                      locals[this.props.lang].palettes.lazyLoad.search
                    }
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
                      this.callUICPAgent(
                        1,
                        (e.target as HTMLInputElement).value
                      )
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
              />
            )}
          <this.ExternalPalettesList />
        </div>
      </div>
    )
  }
}
