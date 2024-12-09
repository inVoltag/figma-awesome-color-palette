import {
  Dropdown,
  DropdownOption,
  FormItem,
  Section,
  SectionTitle,
  SimpleItem,
} from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'

import { ActionsList } from 'src/types/models'
import features from '../../config'
import { Language, PlanStatus } from '../../types/app'
import Feature from '../components/Feature'

interface SyncSettingsProps {
  name: string
  description: string
  view: string
  planStatus: PlanStatus
  lang: Language
  onChangeSettings: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
}

interface SyncSettingsStates {
  collections: Array<VariableCollection>
  collectionId: string
  areCollectionsReady: boolean
}

export default class SyncSettings extends PureComponent<
  SyncSettingsProps,
  SyncSettingsStates
> {
  static features = (planStatus: PlanStatus) => ({
    SETTINGS_SYNC_VARIABLES_COLLECTIONS: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_SYNC_VARIABLES_COLLECTIONS',
      planStatus: planStatus,
    }),
    SETTINGS_SYNC_VARIABLES_BEVAHIOR: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_SYNC_VARIABLES_BEVAHIOR',
      planStatus: planStatus,
    }),
    SETTINGS_SYNC_STYLES_BEHAVIOR: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_SYNC_STYLES_BEHAVIOR',
      planStatus: planStatus,
    }),
  })

  constructor(props: SyncSettingsProps) {
    super(props)
    this.state = {
      collections: [],
      collectionId: '',
      areCollectionsReady: false,
    }
  }

  componentDidMount = (): void => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'GET_VARIABLES_COLLECTIONS',
        },
      },
      '*'
    )

    window.addEventListener('message', this.handleMessage)
  }

  componentWillUnmount = (): void => {
    window.removeEventListener('message', this.handleMessage)
  }

  // Handlers
  handleMessage = (e: MessageEvent) => {
    const getVariablesCollections = () =>
      this.setState({
        collections: e.data.pluginMessage.data.collections,
        collectionId: e.data.pluginMessage.data.collectionId,
        areCollectionsReady: true,
      })

    const newVariableCollection = () =>
      this.setState((prevState) => ({
        collections: [
          {
            ...e.data.pluginMessage.data,
          },
          ...prevState.collections,
        ],
        collectionId: e.data.pluginMessage.data.id,
      }))

    const actions: ActionsList = {
      GET_VARIABLES_COLLECTIONS: () => getVariablesCollections(),
      NEW_VARIABLE_COLLECTION: () => newVariableCollection(),
      DEFAULT: () => null,
    }

    return actions[e.data.pluginMessage?.type ?? 'DEFAULT']?.()
  }

  collectionsHandler = (): Array<DropdownOption> => {
    let results: Array<DropdownOption> = []
    const matchCollection = this.state.collections.find(
      (collection) => collection.id === this.state.collectionId
    )

    if (this.state.collections.length === 0 || matchCollection === undefined)
      results = [
        ...results,
        {
          label: 'Automatic',
          value: '',
          feature: 'UPDATE_VARIABLES_COLLECTION',
          position: 0,
          type: 'OPTION',
          action: this.props.onChangeSettings,
        },
      ]

    if (this.state.collections.length > 0 && matchCollection === undefined)
      results = [
        ...results,
        {
          type: 'SEPARATOR',
        },
      ]

    if (this.state.collections.length > 0)
      results = [
        ...results,
        ...(this.state.collections.map((collection, index) => {
          return {
            label: collection.name,
            value: collection.id,
            feature: 'UPDATE_VARIABLES_COLLECTION',
            position: index,
            type: 'OPTION',
            action: this.props.onChangeSettings,
          }
        }) as Array<DropdownOption>),
      ]

    return results
  }

  collectionIdHandler = (): string => {
    const matchCollection = this.state.collections.find(
      (collection) => collection.id === this.state.collectionId
    )

    if (this.state.collections.length === 0 || matchCollection === undefined)
      return ''

    if (this.state.collections.length > 0) return matchCollection.id

    return this.state.collectionId
  }

  // Templates
  VariablesCollections = () => {
    if (this.state.areCollectionsReady)
      return (
        <Feature
          isActive={SyncSettings.features(
            this.props.planStatus
          ).SETTINGS_SYNC_VARIABLES_COLLECTIONS.isActive()}
        >
          <div className="settings__item">
            <FormItem
              id="update-variables-collection"
              label={'Variables collections'}
              isBlocked={SyncSettings.features(
                this.props.planStatus
              ).SETTINGS_SYNC_VARIABLES_COLLECTIONS.isBlocked()}
              helper={
                this.state.collections.length === 0
                  ? {
                      type: 'INFO',
                      message: 'No collection found',
                    }
                  : undefined
              }
            >
              <Dropdown
                id="update-variables-collection"
                options={this.collectionsHandler()}
                selected={this.collectionIdHandler()}
                isDisabled={this.state.collections.length === 0}
                isBlocked={SyncSettings.features(
                  this.props.planStatus
                ).SETTINGS_SYNC_VARIABLES_COLLECTIONS.isBlocked()}
                isNew={SyncSettings.features(
                  this.props.planStatus
                ).SETTINGS_SYNC_VARIABLES_COLLECTIONS.isNew()}
              />
            </FormItem>
          </div>
        </Feature>
      )
  }

  render() {
    return (
      <Section
        title={
          <SimpleItem
            leftPartSlot={<SectionTitle label={'Synchronization'} />}
            isListItem={false}
          />
        }
        body={[
          {
            node: <this.VariablesCollections />,
          },
        ]}
        border={undefined}
      />
    )
  }
}
