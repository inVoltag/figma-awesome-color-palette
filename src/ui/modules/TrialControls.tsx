import { Button, FeatureStatus, layouts, texts } from '@a_ng_d/figmug-ui'
import React, { PureComponent } from 'react'
import { locals } from '../../content/locals'
import { Language, PlanStatus, TrialStatus } from '../../types/app'
import features, { trialFeedbackUrl } from '../../utils/config'
import Feature from '../components/Feature'

interface TrialControlsProps {
  planStatus: PlanStatus
  trialStatus: TrialStatus
  trialRemainingTime: number
  lang: Language
  onGetProPlan: () => void
}

export default class TrialControls extends PureComponent<TrialControlsProps> {
  static features = (planStatus: PlanStatus) => ({
    ACTIVITIES_RUN: new FeatureStatus({
      features: features,
      featureName: 'ACTIVITIES_RUN',
      planStatus: planStatus,
    }),
    SHORTCUTS_FEEDBACK: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_FEEDBACK',
      planStatus: planStatus,
    }),
  })

  constructor(props: TrialControlsProps) {
    super(props)
    this.state = {
      isUserMenuLoading: false,
    }
  }

  // Templates
  RemainingTime = () => (
    <div className={`type ${texts.type} ${texts['type--secondary']} truncated`}>
      {Math.ceil(this.props.trialRemainingTime) > 72 && (
        <span>
          {locals[this.props.lang].plan.trialTimeDays.plural.replace(
            '$1',
            Math.ceil(this.props.trialRemainingTime) > 72
              ? Math.ceil(this.props.trialRemainingTime / 24)
              : Math.ceil(this.props.trialRemainingTime)
          )}
        </span>
      )}
      {Math.ceil(this.props.trialRemainingTime) <= 72 &&
        Math.ceil(this.props.trialRemainingTime) > 1 && (
          <span>
            {locals[this.props.lang].plan.trialTimeHours.plural.replace(
              '$1',
              Math.ceil(this.props.trialRemainingTime)
            )}
          </span>
        )}
      {Math.ceil(this.props.trialRemainingTime) <= 1 && (
        <span>{locals[this.props.lang].plan.trialTimeHours.single}</span>
      )}
    </div>
  )

  FreePlan = () => (
    <>
      <Button
        type="compact"
        icon="lock-off"
        label={locals[this.props.lang].plan.tryPro}
        action={this.props.onGetProPlan}
      />
    </>
  )

  PendingTrial = () => <this.RemainingTime />

  ExpiredTrial = () => (
    <>
      <Button
        type="compact"
        icon="lock-off"
        label={locals[this.props.lang].plan.getPro}
        action={this.props.onGetProPlan}
      />
      <span className={`type ${texts.type} ${texts['type--secondary']}`}>
        ・
      </span>
      <div
        className={`type ${texts.type} ${texts['type--secondary']} truncated`}
      >
        <span>{locals[this.props.lang].plan.trialEnded}</span>
      </div>
      <Feature
        isActive={TrialControls.features(
          this.props.planStatus
        ).SHORTCUTS_FEEDBACK.isActive()}
      >
        <span className={`type ${texts.type} ${texts['type--secondary']}`}>
          ・
        </span>
        <Button
          type="tertiary"
          label={locals[this.props.lang].plan.trialFeedback}
          isBlocked={TrialControls.features(
            this.props.planStatus
          ).SHORTCUTS_FEEDBACK.isBlocked()}
          isNew={TrialControls.features(
            this.props.planStatus
          ).SHORTCUTS_FEEDBACK.isNew()}
          action={() =>
            parent.postMessage(
              {
                pluginMessage: {
                  type: 'OPEN_IN_BROWSER',
                  url: trialFeedbackUrl,
                },
              },
              '*'
            )
          }
        />
      </Feature>
    </>
  )

  // Render
  render() {
    return (
      <div
        className={['pro-zone', layouts['snackbar--tight']]
          .filter((n) => n)
          .join(' ')}
      >
        {this.props.trialStatus === 'UNUSED' &&
          this.props.planStatus === 'UNPAID' && <this.FreePlan />}
        {this.props.trialStatus === 'PENDING' && <this.PendingTrial />}
        {this.props.trialStatus === 'EXPIRED' &&
          this.props.planStatus === 'UNPAID' && <this.ExpiredTrial />}
      </div>
    )
  }
}
