import { Bar, ConsentConfiguration, HexModel, Tabs } from '@a_ng_d/figmug-ui'
import { PureComponent } from 'preact/compat'
import React from 'react'

import {
  ExtractOfPaletteConfiguration,
  UserConfiguration,
} from 'src/types/configurations'
import {
  Context,
  ContextItem,
  FetchStatus,
  Language,
  PlanStatus,
} from '../../types/app'
import { ExternalPalettes } from '../../types/data'
import { UserSession } from '../../types/user'
import { setContexts } from '../../utils/setContexts'
import CommunityPalettes from './CommunityPalettes'
import SelfPalettes from './SelfPalettes'
import InternalPalettes from './InternalPalettes'

interface PalettesProps {
  userIdentity: UserConfiguration
  userSession: UserSession
  userConsent: Array<ConsentConfiguration>
  palettesList: Array<ExtractOfPaletteConfiguration>
  planStatus: PlanStatus
  lang: Language
  onConfigureExternalSourceColors: (
    name: string,
    colors: Array<HexModel>
  ) => void
}

interface PalettesStates {
  context: Context | ''
  selfPalettesListStatus: FetchStatus
  communityPalettesListStatus: FetchStatus
  selfCurrentPage: number
  communityCurrentPage: number
  seftPalettesSearchQuery: string
  communityPalettesSearchQuery: string
  selfPalettesList: Array<ExternalPalettes>
  communityPalettesList: Array<ExternalPalettes>
}

export default class Palettes extends PureComponent<
  PalettesProps,
  PalettesStates
> {
  private contexts: Array<ContextItem>

  constructor(props: PalettesProps) {
    super(props)
    this.contexts = setContexts(
      ['PALETTES_PAGE', 'PALETTES_SELF', 'PALETTES_COMMUNITY'],
      props.planStatus
    )
    this.state = {
      context: this.contexts[0] !== undefined ? this.contexts[0].id : '',
      selfPalettesListStatus: 'UNLOADED',
      communityPalettesListStatus: 'UNLOADED',
      selfCurrentPage: 1,
      communityCurrentPage: 1,
      selfPalettesList: [],
      communityPalettesList: [],
      seftPalettesSearchQuery: '',
      communityPalettesSearchQuery: '',
    }
  }

  // Lifecycle
  componentDidUpdate = (prevProps: Readonly<PalettesProps>): void => {
    if (
      prevProps.userSession.connectionStatus !==
        this.props.userSession.connectionStatus &&
      this.state.selfPalettesList.length === 0
    )
      this.setState({
        selfPalettesListStatus: 'LOADING',
      })
  }

  // Handlers
  navHandler = (e: Event) =>
    this.setState({
      context: (e.target as HTMLElement).dataset.feature as Context,
    })

  // Render
  render() {
    let fragment

    switch (this.state.context) {
      case 'PALETTES_PAGE': {
        fragment = <InternalPalettes {...this.props} />
        break
      }
      case 'PALETTES_SELF': {
        fragment = (
          <SelfPalettes
            {...this.props}
            context={this.state.context}
            currentPage={this.state.selfCurrentPage}
            searchQuery={this.state.seftPalettesSearchQuery}
            status={
              this.props.userSession.connectionStatus === 'CONNECTED'
                ? this.state.selfPalettesListStatus
                : 'SIGN_IN_FIRST'
            }
            palettesList={this.state.selfPalettesList}
            onChangeStatus={(status) =>
              this.setState({ selfPalettesListStatus: status })
            }
            onChangeCurrentPage={(page) =>
              this.setState({ selfCurrentPage: page })
            }
            onChangeSearchQuery={(query) =>
              this.setState({ seftPalettesSearchQuery: query })
            }
            onLoadPalettesList={(palettesList) =>
              this.setState({ selfPalettesList: palettesList })
            }
          />
        )
        break
      }
      case 'PALETTES_COMMUNITY': {
        fragment = (
          <CommunityPalettes
            {...this.props}
            context={this.state.context}
            currentPage={this.state.communityCurrentPage}
            searchQuery={this.state.communityPalettesSearchQuery}
            status={this.state.communityPalettesListStatus}
            palettesList={this.state.communityPalettesList}
            onChangeStatus={(status) =>
              this.setState({ communityPalettesListStatus: status })
            }
            onChangeCurrentPage={(page) =>
              this.setState({ communityCurrentPage: page })
            }
            onChangeSearchQuery={(query) =>
              this.setState({ communityPalettesSearchQuery: query })
            }
            onLoadPalettesList={(palettesList) =>
              this.setState({ communityPalettesList: palettesList })
            }
          />
        )
        break
      }
    }
    return (
      <div className="controls__control">
        <Bar
          leftPartSlot={
            <Tabs
              tabs={this.contexts}
              active={this.state.context ?? ''}
              action={this.navHandler}
            />
          }
          border={['BOTTOM']}
          isOnlyText={true}
        />
        <div className="control__block control__block--no-padding">
          {fragment}
        </div>
      </div>
    )
  }
}
