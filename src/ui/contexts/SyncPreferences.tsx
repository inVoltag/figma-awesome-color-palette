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
import {
  $canPaletteDeepSync,
  $canVariablesDeepSync,
  $canStylesDeepSync,
} from '../../stores/preferences'

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
  canPaletteDeepSync: boolean
  canVariablesDeepSync: boolean
  canStylesDeepSync: boolean
}

export default class SyncPreferences extends PureComponent<
  SyncPreferencesProps,
  SyncPreferencesStates
> {
  private unsubscribePalette: (() => void) | undefined
  private unsubscribeVariables: (() => void) | undefined
  private unsubscribeStyles: (() => void) | undefined

  static features = (planStatus: PlanStatus) => ({
    SETTINGS_SYNC_DEEP_PALETTE: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_SYNC_DEEP_PALETTE',
      planStatus: planStatus,
    }),
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
      canPaletteDeepSync: false,
      canVariablesDeepSync: false,
      canStylesDeepSync: false,
    }
  }

  // Lifecycle
  componentDidMount() {
    this.unsubscribePalette = $canPaletteDeepSync.subscribe((value) => {
      this.setState({ canPaletteDeepSync: value })
    })
    this.unsubscribeVariables = $canVariablesDeepSync.subscribe((value) => {
      this.setState({ canVariablesDeepSync: value })
    })
    this.unsubscribeStyles = $canStylesDeepSync.subscribe((value) => {
      this.setState({ canStylesDeepSync: value })
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
  PaletteDeepSync = () => {
    return (
      <Feature
        isActive={SyncPreferences.features(
          this.props.planStatus
        ).SETTINGS_SYNC_DEEP_PALETTE.isActive()}
      >
        <Select
          id="update-palette-deep-sync"
          type="SWITCH_BUTTON"
          name="update-palette-deep-sync"
          label={
            locals[this.props.lang].settings.preferences.sync.palette.label
          }
          isChecked={this.state.canPaletteDeepSync}
          isBlocked={SyncPreferences.features(
            this.props.planStatus
          ).SETTINGS_SYNC_DEEP_PALETTE.isBlocked()}
          isNew={SyncPreferences.features(
            this.props.planStatus
          ).SETTINGS_SYNC_DEEP_PALETTE.isNew()}
          feature="UPDATE_PALETTE_DEEP_SYNC"
          onChange={(e) => {
            $canPaletteDeepSync.set(!this.state.canPaletteDeepSync)
            this.props.onChangeSettings(e)
          }}
        />
      </Feature>
    )
  }

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
          isChecked={this.state.canVariablesDeepSync}
          isBlocked={SyncPreferences.features(
            this.props.planStatus
          ).SETTINGS_SYNC_DEEP_VARIABLES.isBlocked()}
          isNew={SyncPreferences.features(
            this.props.planStatus
          ).SETTINGS_SYNC_DEEP_VARIABLES.isNew()}
          feature="UPDATE_VARIABLES_DEEP_SYNC"
          onChange={(e) => {
            $canVariablesDeepSync.set(!this.state.canVariablesDeepSync)
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
          isChecked={this.state.canStylesDeepSync}
          isBlocked={SyncPreferences.features(
            this.props.planStatus
          ).SETTINGS_SYNC_DEEP_STYLES.isBlocked()}
          isNew={SyncPreferences.features(
            this.props.planStatus
          ).SETTINGS_SYNC_DEEP_STYLES.isNew()}
          feature="UPDATE_STYLES_DEEP_SYNC"
          onChange={(e) => {
            $canStylesDeepSync.set(!this.state.canStylesDeepSync)
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
            node: <this.PaletteDeepSync />,
          },
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
