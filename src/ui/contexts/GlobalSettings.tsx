import {
  Dropdown,
  FormItem,
  Input,
  Section,
  SectionTitle,
  SimpleItem,
} from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'

import features from '../../config'
import { locals } from '../../content/locals'
import { Language, PlanStatus } from '../../types/app'
import Feature from '../components/Feature'

interface GlobalSettingsProps {
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

export default class GlobalSettings extends PureComponent<GlobalSettingsProps> {
  static features = (planStatus: PlanStatus) => ({
    SETTINGS_NAME: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_NAME',
      planStatus: planStatus,
    }),
    SETTINGS_DESCRIPTION: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_DESCRIPTION',
      planStatus: planStatus,
    }),
    VIEWS: new FeatureStatus({
      features: features,
      featureName: 'VIEWS',
      planStatus: planStatus,
    }),
    VIEWS_PALETTE_WITH_PROPERTIES: new FeatureStatus({
      features: features,
      featureName: 'VIEWS_PALETTE_WITH_PROPERTIES',
      planStatus: planStatus,
    }),
    VIEWS_PALETTE: new FeatureStatus({
      features: features,
      featureName: 'VIEWS_PALETTE',
      planStatus: planStatus,
    }),
    VIEWS_SHEET: new FeatureStatus({
      features: features,
      featureName: 'VIEWS_SHEET',
      planStatus: planStatus,
    }),
  })

  // Templates
  Name = () => {
    return (
      <Feature
        isActive={GlobalSettings.features(
          this.props.planStatus
        ).SETTINGS_NAME.isActive()}
      >
        <div className="settings__item">
          <FormItem
            label={locals[this.props.lang].settings.global.name.label}
            id="update-palette-name"
            isBlocked={GlobalSettings.features(
              this.props.planStatus
            ).SETTINGS_NAME.isBlocked()}
          >
            <Input
              id="update-palette-name"
              type="TEXT"
              placeholder={locals[this.props.lang].name}
              value={this.props.name !== '' ? this.props.name : ''}
              charactersLimit={64}
              isBlocked={GlobalSettings.features(
                this.props.planStatus
              ).SETTINGS_NAME.isBlocked()}
              isNew={GlobalSettings.features(
                this.props.planStatus
              ).SETTINGS_NAME.isNew()}
              feature="RENAME_PALETTE"
              onChange={this.props.onChangeSettings}
              onFocus={this.props.onChangeSettings}
              onBlur={this.props.onChangeSettings}
              onConfirm={this.props.onChangeSettings}
            />
          </FormItem>
        </div>
      </Feature>
    )
  }

  Description = () => {
    return (
      <Feature
        isActive={GlobalSettings.features(
          this.props.planStatus
        ).SETTINGS_DESCRIPTION.isActive()}
      >
        <div className="settings__item">
          <FormItem
            label={locals[this.props.lang].settings.global.description.label}
            id="update-palette-description"
            isBlocked={GlobalSettings.features(
              this.props.planStatus
            ).SETTINGS_DESCRIPTION.isBlocked()}
          >
            <Input
              id="update-palette-description"
              type="LONG_TEXT"
              placeholder={
                locals[this.props.lang].global.description.placeholder
              }
              value={this.props.description}
              isBlocked={GlobalSettings.features(
                this.props.planStatus
              ).SETTINGS_DESCRIPTION.isBlocked()}
              isNew={GlobalSettings.features(
                this.props.planStatus
              ).SETTINGS_DESCRIPTION.isNew()}
              feature="UPDATE_DESCRIPTION"
              isGrowing={true}
              onFocus={this.props.onChangeSettings}
              onBlur={this.props.onChangeSettings}
              onConfirm={this.props.onChangeSettings}
            />
          </FormItem>
        </div>
      </Feature>
    )
  }

  View = () => {
    return (
      <Feature
        isActive={GlobalSettings.features(
          this.props.planStatus
        ).VIEWS.isActive()}
      >
        <div className="settings__item">
          <FormItem
            id="update-view"
            label={locals[this.props.lang].settings.global.views.label}
            isBlocked={GlobalSettings.features(
              this.props.planStatus
            ).VIEWS.isBlocked()}
          >
            <Dropdown
              id="views"
              options={[
                {
                  label: locals[this.props.lang].settings.global.views.detailed,
                  value: 'PALETTE_WITH_PROPERTIES',
                  feature: 'UPDATE_VIEW',
                  position: 0,
                  type: 'OPTION',
                  isActive: GlobalSettings.features(
                    this.props.planStatus
                  ).VIEWS_PALETTE_WITH_PROPERTIES.isActive(),
                  isBlocked: GlobalSettings.features(
                    this.props.planStatus
                  ).VIEWS_PALETTE_WITH_PROPERTIES.isBlocked(),
                  isNew: GlobalSettings.features(
                    this.props.planStatus
                  ).VIEWS_PALETTE_WITH_PROPERTIES.isNew(),
                  action: this.props.onChangeSettings,
                },
                {
                  label: locals[this.props.lang].settings.global.views.simple,
                  value: 'PALETTE',
                  feature: 'UPDATE_VIEW',
                  position: 1,
                  type: 'OPTION',
                  isActive: GlobalSettings.features(
                    this.props.planStatus
                  ).VIEWS_PALETTE.isActive(),
                  isBlocked: GlobalSettings.features(
                    this.props.planStatus
                  ).VIEWS_PALETTE.isBlocked(),
                  isNew: GlobalSettings.features(
                    this.props.planStatus
                  ).VIEWS_PALETTE.isNew(),
                  action: this.props.onChangeSettings,
                },
                {
                  label: locals[this.props.lang].settings.global.views.sheet,
                  value: 'SHEET',
                  feature: 'UPDATE_VIEW',
                  position: 2,
                  type: 'OPTION',
                  isActive: GlobalSettings.features(
                    this.props.planStatus
                  ).VIEWS_SHEET.isActive(),
                  isBlocked: GlobalSettings.features(
                    this.props.planStatus
                  ).VIEWS_SHEET.isBlocked(),
                  isNew: GlobalSettings.features(
                    this.props.planStatus
                  ).VIEWS_SHEET.isNew(),
                  action: this.props.onChangeSettings,
                },
              ]}
              selected={this.props.view}
              isBlocked={GlobalSettings.features(
                this.props.planStatus
              ).VIEWS.isBlocked()}
              isNew={GlobalSettings.features(
                this.props.planStatus
              ).VIEWS.isNew()}
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
            leftPartSlot={
              <SectionTitle
                label={locals[this.props.lang].settings.global.title}
              />
            }
            isListItem={false}
          />
        }
        body={[
          {
            node: <this.Name />,
          },
          {
            node: <this.Description />,
          },
          {
            node: <this.View />,
          },
        ]}
        border={['BOTTOM']}
      />
    )
  }
}
