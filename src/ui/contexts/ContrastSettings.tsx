import {
  FormItem,
  Input,
  Section,
  SectionTitle,
  SemanticMessage,
  SimpleItem,
} from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'

import features from '../../config'
import { locals } from '../../content/locals'
import { Language, PlanStatus } from '../../types/app'
import { TextColorsThemeHexModel } from '../../types/models'
import Feature from '../components/Feature'

interface ContrastSettingsProps {
  textColorsTheme: TextColorsThemeHexModel
  planStatus: PlanStatus
  lang: Language
  onChangeSettings: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
}

export default class ContrastSettings extends PureComponent<ContrastSettingsProps> {
  static features = (planStatus: PlanStatus) => ({
    SETTINGS_TEXT_COLORS_THEME: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_TEXT_COLORS_THEME',
      planStatus: planStatus,
    }),
  })

  // Templates
  TextColorsTheme = () => {
    return (
      <Feature
        isActive={ContrastSettings.features(
          this.props.planStatus
        ).SETTINGS_TEXT_COLORS_THEME.isActive()}
      >
        <FormItem
          label={
            locals[this.props.lang].settings.contrast.textColors.textLightColor
          }
          id="update-text-light-color"
          isBlocked={ContrastSettings.features(
            this.props.planStatus
          ).SETTINGS_TEXT_COLORS_THEME.isBlocked()}
        >
          <Input
            id="update-text-light-color"
            type="COLOR"
            value={this.props.textColorsTheme?.lightColor ?? '#FFFFFF'}
            isBlocked={ContrastSettings.features(
              this.props.planStatus
            ).SETTINGS_TEXT_COLORS_THEME.isBlocked()}
            isNew={ContrastSettings.features(
              this.props.planStatus
            ).SETTINGS_TEXT_COLORS_THEME.isNew()}
            feature="UPDATE_TEXT_LIGHT_COLOR"
            onChange={this.props.onChangeSettings}
            onFocus={this.props.onChangeSettings}
            onBlur={this.props.onChangeSettings}
          />
        </FormItem>
        <FormItem
          label={
            locals[this.props.lang].settings.contrast.textColors.textDarkColor
          }
          id="update-text-dark-color"
          isBlocked={ContrastSettings.features(
            this.props.planStatus
          ).SETTINGS_TEXT_COLORS_THEME.isBlocked()}
        >
          <Input
            id="update-text-dark-color"
            type="COLOR"
            value={this.props.textColorsTheme?.darkColor ?? '#OOOOOO'}
            isBlocked={ContrastSettings.features(
              this.props.planStatus
            ).SETTINGS_TEXT_COLORS_THEME.isBlocked()}
            isNew={ContrastSettings.features(
              this.props.planStatus
            ).SETTINGS_TEXT_COLORS_THEME.isNew()}
            feature="UPDATE_TEXT_DARK_COLOR"
            onChange={this.props.onChangeSettings}
            onFocus={this.props.onChangeSettings}
            onBlur={this.props.onChangeSettings}
          />
        </FormItem>
        <SemanticMessage
          type="INFO"
          message={
            locals[this.props.lang].settings.contrast.textColors
              .textThemeColorsDescription
          }
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
                label={locals[this.props.lang].settings.contrast.title}
              />
            }
            isListItem={false}
          />
        }
        body={[
          {
            node: <this.TextColorsTheme />,
          },
        ]}
        border={['BOTTOM']}
      />
    )
  }
}
