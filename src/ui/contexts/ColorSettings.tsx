import {
  Dropdown,
  FormItem,
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
import { Language, PlanStatus, Service } from '../../types/app'
import {
  AlgorithmVersionConfiguration,
  ColorSpaceConfiguration,
  VisionSimulationModeConfiguration,
} from '../../types/configurations'
import Feature from '../components/Feature'

interface ColorSettingsProps {
  service: Service
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  algorithmVersion?: AlgorithmVersionConfiguration
  isLast?: boolean
  planStatus: PlanStatus
  lang: Language
  onChangeSettings: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
}

export default class ColorSettings extends PureComponent<ColorSettingsProps> {
  static features = (planStatus: PlanStatus) => ({
    SETTINGS_COLOR_SPACE: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_COLOR_SPACE',
      planStatus: planStatus,
    }),
    SETTINGS_COLOR_SPACE_LCH: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_COLOR_SPACE_LCH',
      planStatus: planStatus,
    }),
    SETTINGS_COLOR_SPACE_OKLCH: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_COLOR_SPACE_OKLCH',
      planStatus: planStatus,
    }),
    SETTINGS_COLOR_SPACE_LAB: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_COLOR_SPACE_LAB',
      planStatus: planStatus,
    }),
    SETTINGS_COLOR_SPACE_OKLAB: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_COLOR_SPACE_OKLAB',
      planStatus: planStatus,
    }),
    SETTINGS_COLOR_SPACE_HSL: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_COLOR_SPACE_HSL',
      planStatus: planStatus,
    }),
    SETTINGS_COLOR_SPACE_HSLUV: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_COLOR_SPACE_HSLUV',
      planStatus: planStatus,
    }),
    SETTINGS_VISION_SIMULATION_MODE: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE',
      planStatus: planStatus,
    }),
    SETTINGS_VISION_SIMULATION_MODE_NONE: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_NONE',
      planStatus: planStatus,
    }),
    SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY',
      planStatus: planStatus,
    }),
    SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA',
      planStatus: planStatus,
    }),
    SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY',
      planStatus: planStatus,
    }),
    SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA',
      planStatus: planStatus,
    }),
    SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY',
      planStatus: planStatus,
    }),
    SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA',
      planStatus: planStatus,
    }),
    SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY',
      planStatus: planStatus,
    }),
    SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA',
      planStatus: planStatus,
    }),
    SETTINGS_ALGORITHM: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_ALGORITHM',
      planStatus: planStatus,
    }),
    SETTINGS_ALGORITHM_V1: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_ALGORITHM_V1',
      planStatus: planStatus,
    }),
    SETTINGS_ALGORITHM_V2: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_ALGORITHM_V2',
      planStatus: planStatus,
    }),
    SETTINGS_ALGORITHM_V3: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_ALGORITHM_V3',
      planStatus: planStatus,
    }),
  })

  static defaultProps = {
    isLast: false,
  }

  // Templates
  ColorSpace = () => {
    return (
      <Feature
        isActive={ColorSettings.features(
          this.props.planStatus
        ).SETTINGS_COLOR_SPACE.isActive()}
      >
        <FormItem
          id="update-color-space"
          label={locals[this.props.lang].settings.color.colorSpace.label}
          isBlocked={ColorSettings.features(
            this.props.planStatus
          ).SETTINGS_COLOR_SPACE.isBlocked()}
        >
          <Dropdown
            id="update-color-space"
            options={[
              {
                label: locals[this.props.lang].settings.color.colorSpace.lch,
                value: 'LCH',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_COLOR_SPACE_LCH.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_COLOR_SPACE_LCH.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_COLOR_SPACE_LCH.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label: locals[this.props.lang].settings.color.colorSpace.oklch,
                value: 'OKLCH',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_COLOR_SPACE_OKLCH.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_COLOR_SPACE_OKLCH.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_COLOR_SPACE_OKLCH.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label: locals[this.props.lang].settings.color.colorSpace.lab,
                value: 'LAB',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_COLOR_SPACE_LAB.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_COLOR_SPACE_LAB.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_COLOR_SPACE_LAB.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label: locals[this.props.lang].settings.color.colorSpace.oklab,
                value: 'OKLAB',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_COLOR_SPACE_OKLAB.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_COLOR_SPACE_OKLAB.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_COLOR_SPACE_OKLAB.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label: locals[this.props.lang].settings.color.colorSpace.hsl,
                value: 'HSL',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_COLOR_SPACE_HSL.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_COLOR_SPACE_HSL.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_COLOR_SPACE_HSL.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label: locals[this.props.lang].settings.color.colorSpace.hsluv,
                value: 'HSLUV',
                feature: 'UPDATE_COLOR_SPACE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_COLOR_SPACE_HSLUV.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_COLOR_SPACE_HSLUV.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_COLOR_SPACE_HSLUV.isNew(),
                action: this.props.onChangeSettings,
              },
            ]}
            selected={this.props.colorSpace}
            isBlocked={ColorSettings.features(
              this.props.planStatus
            ).SETTINGS_COLOR_SPACE.isBlocked()}
            isNew={ColorSettings.features(
              this.props.planStatus
            ).SETTINGS_COLOR_SPACE.isNew()}
          />
        </FormItem>
        {this.props.colorSpace === 'HSL' && (
          <SemanticMessage
            type="WARNING"
            message={locals[this.props.lang].warning.hslColorSpace}
          />
        )}
      </Feature>
    )
  }

  VisionSimulationMode = () => {
    return (
      <Feature
        isActive={ColorSettings.features(
          this.props.planStatus
        ).SETTINGS_VISION_SIMULATION_MODE.isActive()}
      >
        <FormItem
          id="update-color-blind-mode"
          label={
            locals[this.props.lang].settings.color.visionSimulationMode.label
          }
          isBlocked={ColorSettings.features(
            this.props.planStatus
          ).SETTINGS_VISION_SIMULATION_MODE.isBlocked()}
        >
          <Dropdown
            id="update-color-blind-mode"
            options={[
              {
                label:
                  locals[this.props.lang].settings.color.visionSimulationMode
                    .none,
                value: 'NONE',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_NONE.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_NONE.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_NONE.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                type: 'SEPARATOR',
              },
              {
                label:
                  locals[this.props.lang].settings.color.visionSimulationMode
                    .colorBlind,
                type: 'TITLE',
              },
              {
                label:
                  locals[this.props.lang].settings.color.visionSimulationMode
                    .protanomaly,
                value: 'PROTANOMALY',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label:
                  locals[this.props.lang].settings.color.visionSimulationMode
                    .protanopia,
                value: 'PROTANOPIA',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label:
                  locals[this.props.lang].settings.color.visionSimulationMode
                    .deuteranomaly,
                value: 'DEUTERANOMALY',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label:
                  locals[this.props.lang].settings.color.visionSimulationMode
                    .deuteranopia,
                value: 'DEUTERANOPIA',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label:
                  locals[this.props.lang].settings.color.visionSimulationMode
                    .tritanomaly,
                value: 'TRITANOMALY',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label:
                  locals[this.props.lang].settings.color.visionSimulationMode
                    .tritanopia,
                value: 'TRITANOPIA',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label:
                  locals[this.props.lang].settings.color.visionSimulationMode
                    .achromatomaly,
                value: 'ACHROMATOMALY',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label:
                  locals[this.props.lang].settings.color.visionSimulationMode
                    .achromatopsia,
                value: 'ACHROMATOPSIA',
                feature: 'UPDATE_COLOR_BLIND_MODE',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA.isNew(),
                action: this.props.onChangeSettings,
              },
            ]}
            selected={this.props.visionSimulationMode}
            isBlocked={ColorSettings.features(
              this.props.planStatus
            ).SETTINGS_VISION_SIMULATION_MODE.isBlocked()}
            isNew={ColorSettings.features(
              this.props.planStatus
            ).SETTINGS_VISION_SIMULATION_MODE.isNew()}
          />
        </FormItem>
      </Feature>
    )
  }

  ChromaVelocity = () => {
    return (
      <Feature
        isActive={ColorSettings.features(
          this.props.planStatus
        ).SETTINGS_ALGORITHM.isActive()}
      >
        <FormItem
          id="update-algorithm"
          label={locals[this.props.lang].settings.color.algorithmVersion.label}
          isBlocked={ColorSettings.features(
            this.props.planStatus
          ).SETTINGS_ALGORITHM.isBlocked()}
        >
          <Dropdown
            id="update-algorithm"
            options={[
              {
                label:
                  locals[this.props.lang].settings.color.algorithmVersion.v1,
                value: 'v1',
                feature: 'UPDATE_ALGORITHM_VERSION',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_ALGORITHM_V1.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_ALGORITHM_V1.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_ALGORITHM_V1.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label:
                  locals[this.props.lang].settings.color.algorithmVersion.v2,
                value: 'v2',
                feature: 'UPDATE_ALGORITHM_VERSION',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_ALGORITHM_V2.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_ALGORITHM_V2.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_ALGORITHM_V2.isNew(),
                action: this.props.onChangeSettings,
              },
              {
                label:
                  locals[this.props.lang].settings.color.algorithmVersion.v3,
                value: 'v3',
                feature: 'UPDATE_ALGORITHM_VERSION',
                type: 'OPTION',
                isActive: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_ALGORITHM_V3.isActive(),
                isBlocked: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_ALGORITHM_V3.isBlocked(),
                isNew: ColorSettings.features(
                  this.props.planStatus
                ).SETTINGS_ALGORITHM_V3.isNew(),
                action: this.props.onChangeSettings,
              },
            ]}
            selected={this.props.algorithmVersion}
            isBlocked={ColorSettings.features(
              this.props.planStatus
            ).SETTINGS_ALGORITHM.isBlocked()}
            isNew={ColorSettings.features(
              this.props.planStatus
            ).SETTINGS_ALGORITHM.isNew()}
          />
        </FormItem>
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
                label={locals[this.props.lang].settings.color.title}
              />
            }
            isListItem={false}
          />
        }
        body={[
          {
            node: <this.ColorSpace />,
          },
          {
            node: <this.VisionSimulationMode />,
          },
          {
            node: <this.ChromaVelocity />,
          },
        ]}
        border={!this.props.isLast ? ['BOTTOM'] : undefined}
      />
    )
  }
}
