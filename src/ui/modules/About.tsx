import { Layout, layouts, texts } from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import features, {
  authorUrl,
  isProEnabled,
  licenseUrl,
  repositoryUrl,
} from '../../config'
import { locals } from '../../content/locals'
import { Language, PlanStatus, TrialStatus } from '../../types/app'
import Feature from '../components/Feature'
import package_json from './../../../package.json'
import Icon from './Icon'

interface AboutProps {
  planStatus: PlanStatus
  trialStatus: TrialStatus
  lang: Language
}

export default class About extends PureComponent<AboutProps> {
  static features = (planStatus: PlanStatus) => ({
    GET_PRO_PLAN: new FeatureStatus({
      features: features,
      featureName: 'GET_PRO_PLAN',
      planStatus: planStatus,
    }),
  })

  render() {
    return (
      <Layout
        id="about"
        column={[
          {
            node: (
              <div className={layouts['stackbar--medium']}>
                <div className={layouts['snackbar--large']}>
                  <Icon size={32} />
                  <div>
                    <span className={`type ${texts.type} type--xlarge`}>
                      {locals[this.props.lang].name}
                    </span>
                    <div className={layouts.snackbar}>
                      <span
                        className={`type ${texts.type}`}
                      >{`Version ${package_json.version}`}</span>
                      <Feature
                        isActive={
                          About.features(
                            this.props.planStatus
                          ).GET_PRO_PLAN.isActive() && isProEnabled
                        }
                      >
                        <span className={`type ${texts.type}`}>・</span>
                        <span className={`type ${texts.type}`}>
                          {this.props.planStatus === 'UNPAID'
                            ? locals[this.props.lang].plan.free
                            : this.props.planStatus === 'PAID' &&
                                this.props.trialStatus === 'PENDING'
                              ? locals[this.props.lang].plan.trial
                              : locals[this.props.lang].plan.pro}
                        </span>
                      </Feature>
                    </div>
                  </div>
                </div>
                <div className={layouts.stackbar}>
                  <span className={`type ${texts.type}`}>
                    {locals[this.props.lang].about.createdBy}
                    <a
                      href={authorUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {locals[this.props.lang].about.author}
                    </a>
                  </span>
                  <span className={`type ${texts.type}`}>
                    <a
                      href={repositoryUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {locals[this.props.lang].about.sourceCode}
                    </a>
                    {locals[this.props.lang].about.isLicensed}
                    <a
                      href={licenseUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {locals[this.props.lang].about.license}
                    </a>
                  </span>
                </div>
              </div>
            ),
            typeModifier: 'CENTERED',
          },
        ]}
        isFullWidth
      />
    )
  }
}
