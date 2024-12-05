import { texts } from '@a_ng_d/figmug-ui'
import React from 'react'
import { PureComponent } from 'preact/compat'
import { locals } from '../../content/locals'
import { Language, PlanStatus, TrialStatus } from '../../types/app'
import features from '../../utils/config'
import Feature from '../components/Feature'
import package_json from './../../../package.json'
import Icon from './Icon'

interface AboutProps {
  planStatus: PlanStatus
  trialStatus: TrialStatus
  lang: Language
}

export default class About extends PureComponent<AboutProps> {
  render() {
    return (
      <div className="about controls__control">
        <div>
          <div className="about__basic">
            <Icon size={32} />
            <div>
              <p className={`type ${texts.type} type--xlarge`}>
                {locals[this.props.lang].name}
              </p>
              <div className="about__info">
                <p
                  className={`type ${texts.type}`}
                >{`Version ${package_json.version}`}</p>
                <Feature
                  isActive={
                    features.find((feature) => feature.name === 'GET_PRO_PLAN')
                      ?.isActive
                  }
                >
                  <span>・</span>
                  <p className={`type ${texts.type}`}>
                    {this.props.planStatus === 'UNPAID'
                      ? locals[this.props.lang].plan.free
                      : this.props.planStatus === 'PAID' &&
                          this.props.trialStatus === 'PENDING'
                        ? locals[this.props.lang].plan.trial
                        : locals[this.props.lang].plan.pro}
                  </p>
                </Feature>
              </div>
            </div>
          </div>
          <div>
            <p className={`type ${texts.type}`}>
              {locals[this.props.lang].about.createdBy}
              <a
                href="https://uicp.link/author"
                target="_blank"
                rel="noreferrer"
              >
                {locals[this.props.lang].about.author}
              </a>
            </p>
            <p className={`type ${texts.type}`}>
              <a
                href="https://uicp.link/repository"
                target="_blank"
                rel="noreferrer"
              >
                {locals[this.props.lang].about.sourceCode}
              </a>
              {locals[this.props.lang].about.isLicensed}
              <a
                href="https://uicp.link/license"
                target="_blank"
                rel="noreferrer"
              >
                {locals[this.props.lang].about.license}
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }
}
