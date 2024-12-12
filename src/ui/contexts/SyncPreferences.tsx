import {
  Section,
  SectionTitle,
  Select,
  SemanticMessage,
  SimpleItem,
} from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'

import features from '../../config'
import { locals } from '../../content/locals'
import { Language, PlanStatus } from '../../types/app'
import Feature from '../components/Feature'

interface SyncPreferencesProps {
  isLast?: boolean
  planStatus: PlanStatus
  lang: Language
  onChangeSettings: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
}

interface SyncPreferencesStates {
  areVariablesDeepSync: boolean
  areStylesDeepSync: boolean
}

export default class SyncPreferences extends PureComponent<
  SyncPreferencesProps,
  SyncPreferencesStates
> {
  static features = (planStatus: PlanStatus) => ({
    SETTINGS_SYNC_DEEP_VARIABLES: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_SYNC_DEEP_VARIABLES',
      planStatus: planStatus,
    }),
    SETTINGS_SYNC_DEEP_STYLES: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_SYNC_DEEP_STYLES',
      planStatus: planStatus,
    }),
  })

  static defaultProps = {
    isLast: false,
  }

  constructor(props: SyncPreferencesProps) {
    super(props)
    this.state = {
      areVariablesDeepSync: false,
      areStylesDeepSync: false,
    }
  }

  // Lifecycle
  componentDidMount() {
    this.unsubscribePalette = $isPaletteDeepSync.subscribe((value) => {
      this.setState({ isPaletteDeepSync: value })
      console.log('PaletteDeepSync', value)
    })
    this.unsubscribeVariables = $areVariablesDeepSync.subscribe((value) => {
      this.setState({ areVariablesDeepSync: value })
    })
    this.unsubscribeStyles = $areStylesDeepSync.subscribe((value) => {
      this.setState({ areStylesDeepSync: value })
    })
  }

  componentWillUnmount() {
    if (this.unsubscribePalette) {
      this.unsubscribePalette()
    }
    if (this.unsubscribeVariables) {
      this.unsubscribeVariables()
    }
    if (this.unsubscribeStyles) {
      this.unsubscribeStyles()
    }
  }

  // Templates
  VariablesDeepSync = () => {
    return (
      <Feature
        isActive={SyncPreferences.features(
          this.props.planStatus
        ).SETTINGS_SYNC_DEEP_VARIABLES.isActive()}
      >
        <Select
          id="update-variables-deep-sync"
          type="SWITCH_BUTTON"
          name="update-variables-deep-sync"
          label={
            locals[this.props.lang].settings.preferences.sync.variables.label
          }
          isChecked={this.state.areVariablesDeepSync}
          isBlocked={SyncPreferences.features(
            this.props.planStatus
          ).SETTINGS_SYNC_DEEP_VARIABLES.isBlocked()}
          isNew={SyncPreferences.features(
            this.props.planStatus
          ).SETTINGS_SYNC_DEEP_VARIABLES.isNew()}
          feature="UPDATE_VARIABLES_DEEP_SYNC"
          onChange={(e) => {
            $areVariablesDeepSync.set(!this.state.areVariablesDeepSync)
            this.props.onChangeSettings(e)
          }}
        />
      </Feature>
    )
  }

  StylesDeepSync = () => {
    return (
      <Feature
        isActive={SyncPreferences.features(
          this.props.planStatus
        ).SETTINGS_SYNC_DEEP_STYLES.isActive()}
      >
        <Select
          id="update-styles-deep-sync"
          type="SWITCH_BUTTON"
          name="update-styles-deep-sync"
          label={locals[this.props.lang].settings.preferences.sync.styles.label}
          isChecked={this.state.areStylesDeepSync}
          isBlocked={SyncPreferences.features(
            this.props.planStatus
          ).SETTINGS_SYNC_DEEP_STYLES.isBlocked()}
          isNew={SyncPreferences.features(
            this.props.planStatus
          ).SETTINGS_SYNC_DEEP_STYLES.isNew()}
          feature="UPDATE_STYLES_DEEP_SYNC"
          onChange={(e) => {
            $areStylesDeepSync.set(!this.state.areStylesDeepSync)
            this.props.onChangeSettings(e)
          }}
        />
      </Feature>
    )
  }

  render() {
    return (
      <Section
        title={
          <SimpleItem
            leftPartSlot={
              <SectionTitle
                label={locals[this.props.lang].settings.preferences.sync.title}
              />
            }
            isListItem={false}
          />
        }
        body={[
          {
            node: (
              <SemanticMessage
                type="INFO"
                message={
                  locals[this.props.lang].settings.preferences.sync.message
                }
              />
            ),
          },
          {
            node: <this.VariablesDeepSync />,
          },
          {
            node: <this.StylesDeepSync />,
          },
        ]}
        border={this.props.isLast ? ['BOTTOM'] : undefined}
      />
    )
  }
}
