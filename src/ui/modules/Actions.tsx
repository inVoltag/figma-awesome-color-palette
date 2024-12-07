import { Button, DropdownOption, Menu, texts } from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'

import { UserSession } from 'src/types/user'
import { locals } from '../../content/locals'
import { EditorType, Language, PlanStatus } from '../../types/app'
import {
  CreatorConfiguration,
  SourceColorConfiguration,
} from '../../types/configurations'
import features from '../../config'
import Feature from '../components/Feature'

interface ActionsProps {
  context: string
  sourceColors: Array<SourceColorConfiguration> | []
  creatorIdentity?: CreatorConfiguration
  userSession?: UserSession
  exportType?: string
  planStatus?: PlanStatus
  editorType?: EditorType
  lang: Language
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
}

export default class Actions extends PureComponent<ActionsProps> {
  static defaultProps = {
    sourceColors: [],
  }

  static features = (planStatus: PlanStatus) => ({
    GET_PRO_PLAN: new FeatureStatus({
      features: features,
      featureName: 'GET_PRO_PLAN',
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
  })

  // Direct actions
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
      <div className="actions">
        <div className="actions__right">
          <Feature
            isActive={Actions.features(
              this.props.planStatus ?? 'UNPAID'
            ).CREATE_PALETTE.isActive()}
          >
            <Button
              type="primary"
              label={locals[this.props.lang].actions.createPalette}
              feature="CREATE_PALETTE"
              isDisabled={this.props.sourceColors.length > 0 ? false : true}
              action={this.props.onCreatePalette}
            />
          </Feature>
        </div>
        <div className="actions__left">
          <div className={`type ${texts.type}`}>{`${
            this.props.sourceColors.length
          } ${
            this.props.sourceColors.length > 1
              ? locals[this.props.lang].actions.sourceColorsNumber.several
              : locals[this.props.lang].actions.sourceColorsNumber.single
          }`}</div>
        </div>
      </div>
    )
  }

  Deploy = () => {
    return (
      <div className="actions">
        <div className="actions__right">
          {this.props.editorType === 'figma' ? (
            <Menu
              id="local-styles-variables"
              label={locals[this.props.lang].actions.run}
              type="PRIMARY"
              options={[
                {
                  label: locals[this.props.lang].actions.createLocalStyles,
                  value: 'LOCAL_STYLES',
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
                {
                  type: 'SEPARATOR',
                },
                {
                  ...this.publicationAction(),
                  type: 'OPTION',
                  isActive: Actions.features(
                    this.props.planStatus ?? 'UNPAID'
                  ).PUBLISH_PALETTE.isActive(),
                  isBlocked: Actions.features(
                    this.props.planStatus ?? 'UNPAID'
                  ).PUBLISH_PALETTE.isBlocked(),
                  isNew: Actions.features(
                    this.props.planStatus ?? 'UNPAID'
                  ).PUBLISH_PALETTE.isNew(),
                  action: (e) => this.props.onPublishPalette?.(e),
                } as DropdownOption,
              ]}
              alignment="TOP_RIGHT"
            />
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
          )}
        </div>
        <div className="actions__left"></div>
      </div>
    )
  }

  Export = () => {
    return (
      <div className="actions">
        <div className="buttons">
          <Button
            type="primary"
            label={this.props.exportType}
            feature="EXPORT_PALETTE"
            action={this.props.onExportPalette}
          >
            <a></a>
          </Button>
        </div>
      </div>
    )
  }

  // Render
  render() {
    return (
      <>
        {this.props.context === 'CREATE' ? <this.Create /> : null}
        {this.props.context === 'DEPLOY' ? <this.Deploy /> : null}
        {this.props.context === 'EXPORT' ? <this.Export /> : null}
      </>
    )
  }
}
