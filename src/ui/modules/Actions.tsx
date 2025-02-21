import {
  Bar,
  Button,
  DropdownOption,
  Icon,
  Input,
  layouts,
  Menu,
  texts,
  Tooltip,
} from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'

import { UserSession } from 'src/types/user'
import features from '../../config'
import { locals } from '../../content/locals'
import { $palette } from '../../stores/palette'
import { EditorType, Language, PlanStatus, Service } from '../../types/app'
import {
  CreatorConfiguration,
  SourceColorConfiguration,
} from '../../types/configurations'
import { AppStates } from '../App'
import Feature from '../components/Feature'

interface ActionsProps {
  service: Service
  sourceColors: Array<SourceColorConfiguration> | []
  name?: string
  creatorIdentity?: CreatorConfiguration
  userSession?: UserSession
  exportType?: string
  planStatus: PlanStatus
  editorType?: EditorType
  lang: Language
  isPrimaryLoading?: boolean
  isSecondaryLoading?: boolean
  onCreatePalette?: React.MouseEventHandler<HTMLButtonElement> &
    React.KeyboardEventHandler<HTMLButtonElement>
  onSyncLocalStyles?: (
    e: React.MouseEvent<HTMLLIElement> | React.KeyboardEvent<HTMLLIElement>
  ) => void
  onSyncLocalVariables?: (
    e: React.MouseEvent<HTMLLIElement> | React.KeyboardEvent<HTMLLIElement>
  ) => void
  onPublishPalette?: (
    e: React.MouseEvent<Element> | React.KeyboardEvent<Element>
  ) => void
  onExportPalette?: React.MouseEventHandler<HTMLButtonElement> &
    React.KeyboardEventHandler<HTMLButtonElement>
  onChangeSettings?: React.Dispatch<Partial<AppStates>>
}

interface ActionsStates {
  isTooltipVisible: boolean
}

export default class Actions extends PureComponent<
  ActionsProps,
  ActionsStates
> {
  private palette: typeof $palette

  static defaultProps = {
    sourceColors: [],
  }

  static features = (planStatus: PlanStatus) => ({
    GET_PRO_PLAN: new FeatureStatus({
      features: features,
      featureName: 'GET_PRO_PLAN',
      planStatus: planStatus,
    }),
    SOURCE: new FeatureStatus({
      features: features,
      featureName: 'SOURCE',
      planStatus: planStatus,
    }),
    CREATE_PALETTE: new FeatureStatus({
      features: features,
      featureName: 'CREATE_PALETTE',
      planStatus: planStatus,
    }),
    SYNC_LOCAL_STYLES: new FeatureStatus({
      features: features,
      featureName: 'SYNC_LOCAL_STYLES',
      planStatus: planStatus,
    }),
    SYNC_LOCAL_VARIABLES: new FeatureStatus({
      features: features,
      featureName: 'SYNC_LOCAL_VARIABLES',
      planStatus: planStatus,
    }),
    PUBLISH_PALETTE: new FeatureStatus({
      features: features,
      featureName: 'PUBLISH_PALETTE',
      planStatus: planStatus,
    }),
    SETTINGS_NAME: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_NAME',
      planStatus: planStatus,
    }),
  })

  constructor(props: ActionsProps) {
    super(props)
    this.palette = $palette
    this.state = {
      isTooltipVisible: false,
    }
  }

  // Handlers
  nameHandler = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    this.palette.setKey('name', e.currentTarget.value)
    if (this.props.onChangeSettings)
      this.props.onChangeSettings({
        name: e.currentTarget.value,
      })
  }

  // Direct Actions
  publicationAction = (): Partial<DropdownOption> => {
    if (this.props.userSession?.connectionStatus === 'UNCONNECTED')
      return {
        label: locals[this.props.lang].actions.publishOrSyncPalette,
        value: 'PALETTE_PUBLICATION',
        feature: 'PUBLISH_SYNC_PALETTE',
      }
    else if (
      this.props.userSession?.userId === this.props.creatorIdentity?.creatorId
    )
      return {
        label: locals[this.props.lang].actions.publishPalette,
        value: 'PALETTE_PUBLICATION',
        feature: 'PUBLISH_PALETTE',
      }
    else if (
      this.props.userSession?.userId !==
        this.props.creatorIdentity?.creatorId &&
      this.props.creatorIdentity?.creatorId !== ''
    )
      return {
        label: locals[this.props.lang].actions.syncPalette,
        value: 'PALETTE_PUBLICATION',
        feature: 'SYNC_PALETTE',
      }
    else
      return {
        label: locals[this.props.lang].actions.publishPalette,
        value: 'PALETTE_PUBLICATION',
        feature: 'PUBLISH_PALETTE',
      }
  }

  publicationLabel = (): string => {
    if (this.props.userSession?.connectionStatus === 'UNCONNECTED')
      return locals[this.props.lang].actions.publishOrSyncPalette
    else if (
      this.props.userSession?.userId === this.props.creatorIdentity?.creatorId
    )
      return locals[this.props.lang].actions.publishPalette
    else if (
      this.props.userSession?.userId !==
        this.props.creatorIdentity?.creatorId &&
      this.props.creatorIdentity?.creatorId !== ''
    )
      return locals[this.props.lang].actions.syncPalette
    else return locals[this.props.lang].actions.publishPalette
  }

  // Templates
  Create = () => {
    return (
      <Bar
        leftPartSlot={
          <div className={layouts['snackbar--medium']}>
            <Input
              id="update-palette-name"
              type="TEXT"
              placeholder={locals[this.props.lang].name}
              value={this.props.name !== '' ? this.props.name : ''}
              charactersLimit={64}
              isBlocked={Actions.features(
                this.props.planStatus
              ).SETTINGS_NAME.isBlocked()}
              isNew={Actions.features(
                this.props.planStatus
              ).SETTINGS_NAME.isNew()}
              feature="RENAME_PALETTE"
              onChange={this.nameHandler}
              onFocus={this.nameHandler}
              onBlur={this.nameHandler}
            />
            <span
              className={`type ${texts['type']} ${texts['type--secondary']}`}
            >
              ・
            </span>
            <div className={`type ${texts.type}`}>
              {this.props.sourceColors.length > 1
                ? locals[
                    this.props.lang
                  ].actions.sourceColorsNumber.several.replace(
                    '$1',
                    this.props.sourceColors.length
                  )
                : locals[
                    this.props.lang
                  ].actions.sourceColorsNumber.single.replace(
                    '$1',
                    this.props.sourceColors.length
                  )}
            </div>
            {Actions.features(this.props.planStatus).SOURCE.isReached(
              this.props.sourceColors.length - 1
            ) && (
              <div
                style={{
                  position: 'relative',
                }}
                onMouseEnter={() =>
                  this.setState({
                    isTooltipVisible: true,
                  })
                }
                onMouseLeave={() =>
                  this.setState({
                    isTooltipVisible: false,
                  })
                }
              >
                <Icon
                  type="PICTO"
                  iconName="warning"
                />
                {this.state.isTooltipVisible && (
                  <Tooltip>
                    {locals[
                      this.props.lang
                    ].info.maxNumberOfSourceColors.replace(
                      '$1',
                      Actions.features(this.props.planStatus).SOURCE.limit
                    )}
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        }
        rightPartSlot={
          <Feature
            isActive={Actions.features(
              this.props.planStatus
            ).CREATE_PALETTE.isActive()}
          >
            <Button
              type="primary"
              label={locals[this.props.lang].actions.createPalette}
              feature="CREATE_PALETTE"
              isDisabled={this.props.sourceColors.length === 0}
              isBlocked={Actions.features(
                this.props.planStatus
              ).SOURCE.isReached(this.props.sourceColors.length - 1)}
              isLoading={this.props.isPrimaryLoading}
              action={this.props.onCreatePalette}
            />
          </Feature>
        }
        border={['TOP']}
        padding="var(--size-xxsmall) var(--size-xsmall)"
      />
    )
  }

  Deploy = () => {
    return (
      <Bar
        rightPartSlot={
          this.props.editorType === 'figma' ? (
            <div className={layouts['snackbar--medium']}>
              <Feature
                isActive={Actions.features(
                  this.props.planStatus ?? 'UNPAID'
                ).PUBLISH_PALETTE.isActive()}
              >
                <Button
                  type="secondary"
                  label={this.publicationLabel()}
                  feature="PUBLISH_PALETTE"
                  isBlocked={Actions.features(
                    this.props.planStatus ?? 'UNPAID'
                  ).PUBLISH_PALETTE.isBlocked()}
                  isNew={Actions.features(
                    this.props.planStatus ?? 'UNPAID'
                  ).PUBLISH_PALETTE.isNew()}
                  action={this.props.onPublishPalette}
                />
              </Feature>
              <Menu
                id="local-styles-variables"
                label={locals[this.props.lang].actions.sync}
                type="PRIMARY"
                options={[
                  {
                    label: locals[this.props.lang].actions.createLocalStyles,
                    value: 'EDIT',
                    feature: 'SYNC_LOCAL_STYLES',
                    type: 'OPTION',
                    isActive: Actions.features(
                      this.props.planStatus ?? 'UNPAID'
                    ).SYNC_LOCAL_STYLES.isActive(),
                    isBlocked: Actions.features(
                      this.props.planStatus ?? 'UNPAID'
                    ).SYNC_LOCAL_STYLES.isBlocked(),
                    isNew: Actions.features(
                      this.props.planStatus ?? 'UNPAID'
                    ).SYNC_LOCAL_STYLES.isNew(),
                    action: (e) => this.props.onSyncLocalStyles?.(e),
                  },
                  {
                    label: locals[this.props.lang].actions.createLocalVariables,
                    value: 'LOCAL_VARIABLES',
                    feature: 'SYNC_LOCAL_VARIABLES',
                    type: 'OPTION',
                    isActive: Actions.features(
                      this.props.planStatus ?? 'UNPAID'
                    ).SYNC_LOCAL_VARIABLES.isActive(),
                    isBlocked: Actions.features(
                      this.props.planStatus ?? 'UNPAID'
                    ).SYNC_LOCAL_VARIABLES.isBlocked(),
                    isNew: Actions.features(
                      this.props.planStatus ?? 'UNPAID'
                    ).SYNC_LOCAL_VARIABLES.isNew(),
                    action: (e) => this.props.onSyncLocalVariables?.(e),
                  },
                ]}
                alignment="TOP_RIGHT"
                state={this.props.isPrimaryLoading ? 'LOADING' : 'DEFAULT'}
              />
            </div>
          ) : (
            <Feature
              isActive={Actions.features(
                this.props.planStatus ?? 'UNPAID'
              ).PUBLISH_PALETTE.isActive()}
            >
              <Button
                type="primary"
                label={this.publicationLabel()}
                feature="PUBLISH_PALETTE"
                isBlocked={Actions.features(
                  this.props.planStatus ?? 'UNPAID'
                ).PUBLISH_PALETTE.isBlocked()}
                isNew={Actions.features(
                  this.props.planStatus ?? 'UNPAID'
                ).PUBLISH_PALETTE.isNew()}
                action={this.props.onPublishPalette}
              />
            </Feature>
          )
        }
        border={['TOP']}
        padding="var(--size-xxsmall) var(--size-xsmall)"
      />
    )
  }

  Export = () => {
    return (
      <Bar
        rightPartSlot={
          <Button
            type="primary"
            label={this.props.exportType}
            feature="EXPORT_PALETTE"
            action={this.props.onExportPalette}
          >
            <a></a>
          </Button>
        }
        border={['TOP']}
        padding="var(--size-xxsmall) var(--size-xsmall)"
      />
    )
  }

  // Render
  render() {
    return (
      <>
        {this.props.service === 'CREATE' && <this.Create />}
        {this.props.service === 'EDIT' && <this.Deploy />}
        {this.props.service === 'TRANSFER' && <this.Export />}
      </>
    )
  }
}
