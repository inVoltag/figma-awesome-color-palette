import { Bar, ConsentConfiguration, Tabs } from '@a_ng_d/figmug-ui'
import React from 'react'

import {
  ContextItem,
  EditorType,
  FilterOptions,
  Language,
  PlanStatus,
  ThirdParty,
} from '../../types/app'
import { SourceColorConfiguration } from '../../types/configurations'
import { ColourLovers } from '../../types/data'
import features from '../../utils/config'
import { setContexts } from '../../utils/setContexts'
import Feature from '../components/Feature'
import Actions from '../modules/Actions'
import Preview from '../modules/Preview'
import Explore from './Explore'
import Overview from './Overview'

interface SourceProps {
  sourceColors: Array<SourceColorConfiguration>
  userConsent: Array<ConsentConfiguration>
  planStatus: PlanStatus
  editorType?: EditorType
  lang: Language
  figmaUserId: string
  onChangeColorsFromImport: (
    onChangeColorsFromImport: Array<SourceColorConfiguration>,
    source: ThirdParty
  ) => void
  onCreatePalette: () => void
}

interface SourceStates {
  context: string | undefined
  colourLoversPaletteList: Array<ColourLovers>
  activeFilters: Array<FilterOptions>
}

export default class Source extends React.Component<SourceProps, SourceStates> {
  contexts: Array<ContextItem>

  constructor(props: SourceProps) {
    super(props)
    this.contexts = setContexts(['SOURCE_OVERVIEW', 'SOURCE_EXPLORE'])
    this.state = {
      context: this.contexts[0] !== undefined ? this.contexts[0].id : '',
      colourLoversPaletteList: [],
      activeFilters: ['ANY'],
    }
  }

  // Handlers
  navHandler = (e: React.SyntheticEvent) =>
    this.setState({
      context: (e.target as HTMLElement).dataset.feature,
    })

  // Render
  render() {
    let fragment

    switch (this.state.context) {
      case 'SOURCE_OVERVIEW': {
        fragment = (
          <Overview
            {...this.props}
            onChangeContexts={() =>
              this.setState({ context: 'SOURCE_EXPLORE' })
            }
          />
        )
        break
      }
      case 'SOURCE_EXPLORE': {
        fragment = (
          <Explore
            {...this.props}
            activeFilters={this.state.activeFilters}
            colourLoversPaletteList={this.state.colourLoversPaletteList}
            onChangeContexts={() =>
              this.setState({ context: 'SOURCE_OVERVIEW' })
            }
            onLoadColourLoversPalettesList={(e, shouldBeEmpty) =>
              this.setState({
                colourLoversPaletteList: !shouldBeEmpty
                  ? this.state.colourLoversPaletteList.concat(e)
                  : [],
              })
            }
            onChangeFilters={(e) => this.setState({ activeFilters: e })}
          />
        )
        break
      }
    }

    return (
      <>
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
        {fragment}
        <Actions
          context="CREATE"
          {...this.props}
          onCreatePalette={
            this.props.sourceColors.length > 0
              ? this.props.onCreatePalette
              : () => null
          }
        />
        <Feature
          isActive={
            features.find((feature) => feature.name === 'PREVIEW')?.isActive
          }
        >
          <Preview sourceColors={this.props.sourceColors} />
        </Feature>
      </>
    )
  }
}
