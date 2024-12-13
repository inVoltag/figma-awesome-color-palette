import {
  ActionsItem,
  Bar,
  Button,
  ConsentConfiguration,
  Dropdown,
  DropdownOption,
  FormItem,
  Icon,
  SemanticMessage,
  texts,
} from '@a_ng_d/figmug-ui'
import chroma from 'chroma-js'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { uid } from 'uid'

import { pageSize } from '../../config'
import { locals } from '../../content/locals'
import {
  FetchStatus,
  FilterOptions,
  Language,
  ThirdParty,
} from '../../types/app'
import {
  SourceColorConfiguration,
  UserConfiguration,
} from '../../types/configurations'
import { ColourLovers } from '../../types/data'
import { trackImportEvent } from '../../utils/eventsTracker'

interface ExploreProps {
  colourLoversPaletteList: Array<ColourLovers>
  activeFilters: Array<FilterOptions>
  userIdentity: UserConfiguration
  userConsent: Array<ConsentConfiguration>
  lang: Language
  onChangeColorsFromImport: (
    onChangeColorsFromImport: Array<SourceColorConfiguration>,
    source: ThirdParty
  ) => void
  onChangeContexts: () => void
  onLoadColourLoversPalettesList: (
    palettes: Array<ColourLovers>,
    shouldBeEmpty: boolean
  ) => void
  onChangeFilters: (filters: Array<FilterOptions>) => void
}

interface ExploreStates {
  colourLoversPalettesListStatus: FetchStatus
  currentPage: number
  isLoadMoreActionLoading: boolean
}

export default class Explore extends PureComponent<
  ExploreProps,
  ExploreStates
> {
  private filters: Array<FilterOptions>

  constructor(props: ExploreProps) {
    super(props)
    ;(this.filters = [
      'ANY',
      'YELLOW',
      'ORANGE',
      'RED',
      'GREEN',
      'VIOLET',
      'BLUE',
    ]),
      (this.state = {
        colourLoversPalettesListStatus: 'LOADING',
        currentPage: 1,
        isLoadMoreActionLoading: false,
      })
  }

  // Lifecycle
  componentDidMount = () => {
    if (this.props.colourLoversPaletteList.length === 0) this.callUICPAgent()
    else {
      this.setState({
        colourLoversPalettesListStatus: 'LOADED',
      })
    }
  }

  componentDidUpdate = (
    prevProps: Readonly<ExploreProps>,
    prevState: Readonly<ExploreStates>
  ): void => {
    if (prevState.currentPage !== this.state.currentPage) {
      this.callUICPAgent()
    }

    if (this.state.colourLoversPalettesListStatus === 'ERROR') {
      return
    }

    if (this.props.activeFilters !== prevProps.activeFilters) {
      this.setState({
        currentPage: 1,
        colourLoversPalettesListStatus: 'LOADING',
      })
      this.props.onLoadColourLoversPalettesList([], true)
      this.callUICPAgent()
    }
  }

  // Direct actions
  callUICPAgent = async () => {
    return fetch(
      'https://corsproxy.io/?' +
        encodeURIComponent(
          `https://www.colourlovers.com/api/palettes?format=json&numResults=${pageSize}&resultOffset=${
            this.state.currentPage - 1
          }&hueOption=${this.props.activeFilters
            .filter((filter) => filter !== 'ANY')
            .map((filter) => filter.toLowerCase())
            .join(',')}`
        ),
      {
        cache: 'no-cache',
        credentials: 'omit',
      }
    )
      .then((response) => {
        if (response.ok) return response.json()
        else throw new Error(locals[this.props.lang].error.badResponse)
      })
      .then((data) => {
        this.setState({
          colourLoversPalettesListStatus:
            data.length === pageSize ? 'LOADED' : 'COMPLETE',
        })
        this.props.onLoadColourLoversPalettesList(data, false)
      })
      .finally(() =>
        this.setState({
          isLoadMoreActionLoading: false,
        })
      )
      .catch(() =>
        this.setState({
          colourLoversPalettesListStatus: 'ERROR',
        })
      )
  }

  setFilters = () => {
    return this.filters.map((filter) => {
      return {
        label:
          locals[this.props.lang].source.colourLovers.filters[
            filter.toLowerCase()
          ],
        value: filter,
        feature: 'EDIT_FILTER',
        type: 'OPTION',
        isActive: true,
        isBlocked: false,
        children: [],
        action: () => this.onAddFilter(filter),
      }
    }) as Array<DropdownOption>
  }

  onAddFilter = (value: FilterOptions) => {
    if (value === 'ANY' || this.props.activeFilters.length === 0)
      this.props.onChangeFilters(
        this.props.activeFilters.filter((filter) => filter === 'ANY')
      )
    else if (this.props.activeFilters.includes(value))
      this.props.onChangeFilters(
        this.props.activeFilters.filter((filter) => filter !== value)
      )
    else this.props.onChangeFilters(this.props.activeFilters.concat(value))
  }

  // Templates
  ExternalSourceColorsList = () => {
    let fragment

    if (
      this.state.colourLoversPalettesListStatus === 'LOADED' ||
      this.state.colourLoversPalettesListStatus === 'COMPLETE'
    ) {
      fragment = (
        <>
          {this.props.colourLoversPaletteList.map((palette, index: number) => (
            <ActionsItem
              id={palette.id?.toString() ?? ''}
              key={`source-colors-${index}`}
              src={palette.imageUrl?.replace('http', 'https')}
              name={palette.title}
              description={`#${palette.rank}`}
              subdescription={`${palette.numVotes} votes, ${palette.numViews} views, ${palette.numComments} comments`}
              user={{
                avatar: undefined,
                name: palette.userName ?? '',
              }}
              actionsSlot={
                <>
                  <Button
                    type="icon"
                    icon="link-connected"
                    action={() =>
                      parent.postMessage(
                        {
                          pluginMessage: {
                            type: 'OPEN_IN_BROWSER',
                            url: palette.url?.replace('http', 'https'),
                          },
                        },
                        '*'
                      )
                    }
                  />
                  <Button
                    type="secondary"
                    label={locals[this.props.lang].actions.addToSource}
                    action={() => {
                      this.props.onChangeContexts()
                      this.props.onChangeColorsFromImport(
                        palette.colors.map((color) => {
                          const gl = chroma(color).gl()
                          return {
                            name: color,
                            rgb: {
                              r: gl[0],
                              g: gl[1],
                              b: gl[2],
                            },
                            id: uid(),
                            source: 'COLOUR_LOVERS',
                            isRemovable: true,
                          }
                        }),
                        'COLOUR_LOVERS'
                      )
                      trackImportEvent(
                        this.props.userIdentity.id,
                        this.props.userConsent.find(
                          (consent) => consent.id === 'mixpanel'
                        )?.isConsented ?? false,
                        {
                          feature: 'IMPORT_COLOUR_LOVERS',
                        }
                      )
                    }}
                  />
                </>
              }
            />
          ))}
          <div className="list-control">
            {this.state.colourLoversPalettesListStatus === 'LOADED' ? (
              <Button
                type="secondary"
                label={locals[this.props.lang].palettes.lazyLoad.loadMore}
                isLoading={this.state.isLoadMoreActionLoading}
                action={() =>
                  this.setState({
                    isLoadMoreActionLoading: true,
                    currentPage: this.state.currentPage + pageSize,
                  })
                }
              />
            ) : (
              <div className={`${texts['type--secondary']} type`}>
                {locals[this.props.lang].palettes.lazyLoad.completeList}
              </div>
            )}
          </div>
        </>
      )
    } else if (this.state.colourLoversPalettesListStatus === 'ERROR')
      fragment = (
        <div className="callout--centered">
          <SemanticMessage
            type="WARNING"
            message={locals[this.props.lang].error.fetchPalette}
          />
        </div>
      )
    else if (this.state.colourLoversPalettesListStatus === 'LOADING')
      fragment = (
        <Icon
          type="PICTO"
          iconName="spinner"
          customClassName="control__block__loader"
        />
      )
    return (
      <ul
        className={[
          'rich-list',
          this.state.colourLoversPalettesListStatus === 'LOADING' &&
            'rich-list--loading',
          this.state.colourLoversPalettesListStatus === 'ERROR' &&
            'rich-list--message',
        ]
          .filter((n) => n)
          .join(' ')}
      >
        {fragment}
      </ul>
    )
  }

  // Render
  render() {
    return (
      <div className="controls__control controls__control--horizontal">
        <div className="controls__control">
          <div className="control__block control__block--no-padding">
            <Bar
              leftPartSlot={
                <FormItem
                  id="explore-filters"
                  label={
                    locals[this.props.lang].source.colourLovers.filters.label
                  }
                >
                  <Dropdown
                    id="explore-filters"
                    options={this.setFilters()}
                    selected={
                      this.props.activeFilters.includes('ANY') &&
                      this.props.activeFilters.length > 1
                        ? this.props.activeFilters
                            .filter((filter) => filter !== 'ANY')
                            .join(', ')
                        : this.props.activeFilters.join(', ')
                    }
                    parentClassName="ui"
                    pin="TOP"
                    isDisabled={
                      this.state.colourLoversPalettesListStatus === 'LOADING' ||
                      this.state.colourLoversPalettesListStatus === 'ERROR'
                    }
                  />
                </FormItem>
              }
              border={['BOTTOM']}
            />
            <this.ExternalSourceColorsList />
          </div>
        </div>
      </div>
    )
  }
}
