import { Button, DropdownOption, Menu, texts } from '@a_ng_d/figmug-ui'
import React from 'react'
import { PureComponent } from 'preact/compat'

import { locals } from '../../content/locals'
import { EditorType, Language, PlanStatus } from '../../types/app'
import {
  CreatorConfiguration,
  SourceColorConfiguration,
} from '../../types/configurations'
import features from '../../utils/config'
import isBlocked from '../../utils/isBlocked'
import Feature from '../components/Feature'
import { UserSession } from 'src/types/user'

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
            isActive={
              features.find((feature) => feature.name === 'CREATE_PALETTE')
                ?.isActive
            }
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
                  position: 0,
                  type: 'OPTION',
                  isActive: features.find(
                    (feature) => feature.name === 'SYNC_LOCAL_STYLES'
                  )?.isActive,
                  isBlocked: isBlocked(
                    'SYNC_LOCAL_STYLES',
                    this.props.planStatus ?? 'UNPAID'
                  ),
                  isNew: features.find(
                    (feature) => feature.name === 'SYNC_LOCAL_STYLES'
                  )?.isNew,
                  action: (e) => this.props.onSyncLocalStyles?.(e),
                },
                {
                  label: locals[this.props.lang].actions.createLocalVariables,
                  value: 'LOCAL_VARIABLES',
                  feature: 'SYNC_LOCAL_VARIABLES',
                  position: 0,
                  type: 'OPTION',
                  isActive: features.find(
                    (feature) => feature.name === 'SYNC_LOCAL_VARIABLES'
                  )?.isActive,
                  isBlocked: isBlocked(
                    'SYNC_LOCAL_VARIABLES',
                    this.props.planStatus ?? 'UNPAID'
                  ),
                  isNew: features.find(
                    (feature) => feature.name === 'SYNC_LOCAL_VARIABLES'
                  )?.isNew,
                  action: (e) => this.props.onSyncLocalVariables?.(e),
                },
                {
                  position: 0,
                  type: 'SEPARATOR',
                },
                {
                  ...this.publicationAction(),
                  position: 0,
                  type: 'OPTION',
                  isActive: features.find(
                    (feature) => feature.name === 'PUBLISH_PALETTE'
                  )?.isActive,
                  isBlocked: isBlocked(
                    'PUBLISH_PALETTE',
                    this.props.planStatus ?? 'UNPAID'
                  ),
                  isNew: features.find(
                    (feature) => feature.name === 'PUBLISH_PALETTE'
                  )?.isNew,
                  action: (e) => this.props.onPublishPalette?.(e),
                } as DropdownOption,
              ]}
              alignment="TOP_RIGHT"
            />
          ) : (
            <Feature
              isActive={
                features.find((feature) => feature.name === 'PUBLISH_PALETTE')
                  ?.isActive
              }
            >
              <Button
                type="primary"
                label={this.publicationLabel()}
                feature="PUBLISH_PALETTE"
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
