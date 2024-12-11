import { Bar, ConsentConfiguration, Tabs } from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'

import {
  Context,
  ContextItem,
  EditorType,
  FilterOptions,
  Language,
  PlanStatus,
  ThirdParty,
} from '../../types/app'
import {
  SourceColorConfiguration,
  UserConfiguration,
} from '../../types/configurations'
import { ColourLovers } from '../../types/data'
import features from '../../config'
import { setContexts } from '../../utils/setContexts'
import Feature from '../components/Feature'
import Actions from '../modules/Actions'
import Preview from '../modules/Preview'
import Explore from './Explore'
import Overview from './Overview'
import { palette } from '../../utils/palettePackage'

interface SourceProps {
  sourceColors: Array<SourceColorConfiguration>
  userIdentity: UserConfiguration
  userConsent: Array<ConsentConfiguration>
  planStatus: PlanStatus
  editorType?: EditorType
  lang: Language
  onChangeColorsFromImport: (
    onChangeColorsFromImport: Array<SourceColorConfiguration>,
    source: ThirdParty
  ) => void
  onCreatePalette: () => void
}

interface SourceStates {
  context: Context | ''
  colourLoversPaletteList: Array<ColourLovers>
  activeFilters: Array<FilterOptions>
}

export default class Source extends PureComponent<SourceProps, SourceStates> {
  contexts: Array<ContextItem>

  static features = (planStatus: PlanStatus) => ({
    PREVIEW: new FeatureStatus({
      features: features,
      featureName: 'PREVIEW',
      planStatus: planStatus,
    }),
  })

  constructor(props: SourceProps) {
    super(props)
    this.contexts = setContexts(
      ['SOURCE_OVERVIEW', 'SOURCE_EXPLORE'],
      props.planStatus
    )
    this.state = {
      context: this.contexts[0] !== undefined ? this.contexts[0].id : '',
      colourLoversPaletteList: [],
      activeFilters: ['ANY'],
    }
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
          {...this.props}
          service="CREATE"
          onCreatePalette={
            this.props.sourceColors.length > 0
              ? this.props.onCreatePalette
              : () => null
          }
        />
        <Feature
          isActive={Source.features(this.props.planStatus).PREVIEW.isActive()}
        >
          <Preview
            {...this.props}
            sourceColors={this.props.sourceColors}
            scale={palette.scale}
          />
        </Feature>
      </>
    )
  }
}
