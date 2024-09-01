import * as Sentry from '@sentry/browser';
import { ConsentConfiguration, Dialog, FormItem, Input, texts } from '@a_ng_d/figmug-ui';
import React from 'react';



import { signIn } from '../../bridges/publication/authentication';
import cp from '../../content/images/choose_plan.webp';
import pp from '../../content/images/pro_plan.webp';
import p from '../../content/images/publication.webp';
import t from '../../content/images/trial.webp';
import { locals } from '../../content/locals';
import {
  HighlightDigest,
  Language,
  PlanStatus,
  TrialStatus,
} from '../../types/app'
import { PriorityContext } from '../../types/management'
import { UserSession } from '../../types/user'
import features from '../../utils/config'
import { trackSignInEvent } from '../../utils/eventsTracker'
import type { AppStates } from '../App'
import Feature from '../components/Feature'
import About from './About'
import Highlight from './Highlight'
import Publication from './Publication'

interface PriorityContainerProps {
  context: PriorityContext
  rawData: AppStates
  userConsent: Array<ConsentConfiguration>
  planStatus: PlanStatus
  trialStatus: TrialStatus
  userSession: UserSession
  highlight: HighlightDigest
  lang: Language
  figmaUserId: string
  onChangePublication: React.Dispatch<Partial<AppStates>>
  onClose: React.ChangeEventHandler & (() => void)
}

interface PriorityContainerStates {
  isPrimaryActionLoading: boolean
  isSecondaryActionLoading: boolean
  userFullName: string
  userEmail: string
  userMessage: string
}

export default class PriorityContainer extends React.Component<
  PriorityContainerProps,
  PriorityContainerStates
> {
  counter: number

  constructor(props: PriorityContainerProps) {
    super(props)
    this.counter = 0
    this.state = {
      isPrimaryActionLoading: false,
      isSecondaryActionLoading: false,
      userFullName: '',
      userEmail: '',
      userMessage: '',
    }
  }

  // Handlers
  reportHandler = () => {
    this.setState({ isPrimaryActionLoading: true })
    Sentry.sendFeedback(
      {
        name: this.state.userFullName,
        email: this.state.userEmail,
        message: this.state.userMessage,
      },
      {
        includeReplay: true,
      }
    )
      .then(() => {
        this.setState({
          userFullName: '',
          userEmail: '',
          userMessage: '',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'SEND_MESSAGE',
              message: locals[this.props.lang].success.report,
            },
          },
          '*'
        )
      })
      .finally(() => this.setState({ isPrimaryActionLoading: false }))
      .catch(() => {
        parent.postMessage(
          {
            pluginMessage: {
              type: 'SEND_MESSAGE',
              message: locals[this.props.lang].error.generic,
            },
          },
          '*'
        )
      })
  }

  // Templates
  TryPro = () => {
    return (
      <Feature
        isActive={
          features.find((feature) => feature.name === 'GET_PRO_PLAN')?.isActive
        }
      >
        <Dialog
          title={locals[this.props.lang].proPlan.trial.title}
          actions={{
            primary: {
              label: locals[this.props.lang].proPlan.trial.cta,
              action: () =>
                parent.postMessage(
                  { pluginMessage: { type: 'ENABLE_TRIAL' } },
                  '*'
                ),
            },
            secondary: {
              label: locals[this.props.lang].proPlan.trial.option,
              action: () =>
                parent.postMessage(
                  { pluginMessage: { type: 'GET_PRO_PLAN' } },
                  '*'
                ),
            },
          }}
          onClose={this.props.onClose}
        >
          <div className="dialog__cover">
            <img
              src={cp}
              style={{
                width: '100%',
              }}
            />
          </div>
          <div className="dialog__text">
            <p className={`type ${texts.type}`}>
              {locals[this.props.lang].proPlan.trial.message}
            </p>
          </div>
        </Dialog>
      </Feature>
    )
  }

  WelcomeToTrial = () => {
    return (
      <Feature
        isActive={
          features.find((feature) => feature.name === 'GET_PRO_PLAN')?.isActive
        }
      >
        <Dialog
          title={locals[this.props.lang].proPlan.welcome.title}
          actions={{
            primary: {
              label: locals[this.props.lang].proPlan.welcome.cta,
              action: this.props.onClose,
            },
          }}
          onClose={this.props.onClose}
        >
          <div className="dialog__cover">
            <img
              src={t}
              style={{
                width: '100%',
              }}
            />
          </div>
          <div className="dialog__text">
            <p className={`type ${texts.type}`}>
              {locals[this.props.lang].proPlan.welcome.trial}
            </p>
          </div>
        </Dialog>
      </Feature>
    )
  }

  Feedback = () => {
    return (
      <Feature
        isActive={
          features.find((feature) => feature.name === 'SHORTCUTS_FEEDBACK')
            ?.isActive
        }
      >
        <Dialog
          title={locals[this.props.lang].shortcuts.feedback}
          actions={{}}
          onClose={this.props.onClose}
        >
          <iframe
            style={{
              border: 'none',
              width: '100%',
            }}
            title="Voice of the UI Color Palette Users"
            loading="lazy"
            src="https://tally.so/embed/w7KBNL?hideTitle=1"
          ></iframe>
        </Dialog>
      </Feature>
    )
  }

  TrialFeedback = () => {
    return (
      <Feature
        isActive={
          features.find((feature) => feature.name === 'SHORTCUTS_FEEDBACK')
            ?.isActive
        }
      >
        <Dialog
          title={locals[this.props.lang].shortcuts.trialFeedback}
          actions={{}}
          onClose={this.props.onClose}
        >
          <iframe
            style={{
              border: 'none',
              width: '100%',
              height: '100%',
            }}
            title="Voice of the UI Color Palette Users"
            loading="lazy"
            src="https://tally.so/embed/w2Krvp?hideTitle=1"
          ></iframe>
        </Dialog>
      </Feature>
    )
  }

  WelcomeToPro = () => {
    return (
      <Feature
        isActive={
          features.find((feature) => feature.name === 'GET_PRO_PLAN')?.isActive
        }
      >
        <Dialog
          title={locals[this.props.lang].proPlan.welcome.title}
          actions={{
            primary: {
              label: locals[this.props.lang].proPlan.welcome.cta,
              action: this.props.onClose,
            },
          }}
          onClose={this.props.onClose}
        >
          <div className="dialog__cover">
            <img
              src={pp}
              style={{
                width: '100%',
              }}
            />
          </div>
          <div className="dialog__text">
            <p className={`type ${texts.type}`}>
              {locals[this.props.lang].proPlan.welcome.message}
            </p>
          </div>
        </Dialog>
      </Feature>
    )
  }

  Highlight = () => {
    return (
      <Feature
        isActive={
          features.find((feature) => feature.name === 'SHORTCUTS_HIGHLIGHT')
            ?.isActive
        }
      >
        <Highlight
          {...this.props}
          onCloseHighlight={this.props.onClose}
        />
      </Feature>
    )
  }

  About = () => {
    return (
      <Feature
        isActive={
          features.find((feature) => feature.name === 'SHORTCUTS_ABOUT')
            ?.isActive
        }
      >
        <Dialog
          title={locals[this.props.lang].about.title}
          actions={{}}
          onClose={this.props.onClose}
        >
          <About
            planStatus={this.props.planStatus}
            trialStatus={this.props.trialStatus}
            lang={this.props.lang}
          />
        </Dialog>
      </Feature>
    )
  }

  Publication = () => {
    return (
      <Feature
        isActive={
          features.find((feature) => feature.name === 'PUBLICATION')?.isActive
        }
      >
        {this.props.rawData.userSession.connectionStatus === 'UNCONNECTED' ? (
          <Dialog
            title={locals[this.props.lang].publication.titleSignIn}
            actions={{
              primary: {
                label: locals[this.props.lang].publication.signIn,
                state: this.state.isPrimaryActionLoading
                  ? 'LOADING'
                  : 'DEFAULT',
                action: async () => {
                  this.setState({ isPrimaryActionLoading: true })
                  signIn(this.props.figmaUserId)
                    .then(() => {
                      trackSignInEvent(
                        this.props.figmaUserId,
                        this.props.userConsent.find(
                          (consent) => consent.id === 'mixpanel'
                        )?.isConsented ?? false
                      )
                    })
                    .finally(() => {
                      this.setState({ isPrimaryActionLoading: false })
                    })
                    .catch((error) => {
                      parent.postMessage(
                        {
                          pluginMessage: {
                            type: 'SEND_MESSAGE',
                            message:
                              error.message === 'Authentication timeout'
                                ? locals[this.props.lang].error.timeout
                                : locals[this.props.lang].error.authentication,
                          },
                        },
                        '*'
                      )
                    })
                },
              },
            }}
            onClose={this.props.onClose}
          >
            <div className="dialog__cover">
              <img
                src={p}
                style={{
                  width: '100%',
                }}
              />
            </div>
            <div className="dialog__text">
              <p className={`type ${texts.type}`}>
                {locals[this.props.lang].publication.message}
              </p>
            </div>
          </Dialog>
        ) : (
          <Publication
            {...this.props}
            isPrimaryActionLoading={this.state.isPrimaryActionLoading}
            isSecondaryActionLoading={this.state.isSecondaryActionLoading}
            onLoadPrimaryAction={(e) =>
              this.setState({ isPrimaryActionLoading: e })
            }
            onLoadSecondaryAction={(e) =>
              this.setState({ isSecondaryActionLoading: e })
            }
            onClosePublication={this.props.onClose}
          />
        )}
      </Feature>
    )
  }

  Report = () => {
    return (
      <Feature
        isActive={
          features.find((feature) => feature.name === 'REPORT')?.isActive
        }
      >
        <Dialog
          title={locals[this.props.lang].report.title}
          actions={{
            primary: {
              label: locals[this.props.lang].report.cta,
              state: (() => {
                if (this.state.userMessage === '') {
                  return 'DISABLED'
                }
                if (this.state.isPrimaryActionLoading) return 'LOADING'
                return 'DEFAULT'
              })(),
              action: this.reportHandler,
            },
          }}
          onClose={this.props.onClose}
        >
          <div className="dialog__form">
            <div className="dialog__form__item">
              <FormItem
                label={locals[this.props.lang].report.fullName.label}
                id="type-fullname"
                shouldFill
              >
                <Input
                  type="TEXT"
                  value={this.state.userFullName}
                  isAutoFocus={true}
                  placeholder={
                    locals[this.props.lang].report.fullName.placeholder
                  }
                  onChange={(e) =>
                    this.setState({ userFullName: e.target.value })
                  }
                />
              </FormItem>
            </div>
            <div className="dialog__form__item">
              <FormItem
                label={locals[this.props.lang].report.email.label}
                id="type-email"
                shouldFill
              >
                <Input
                  type="TEXT"
                  value={this.state.userEmail}
                  placeholder={locals[this.props.lang].report.email.placeholder}
                  onChange={(e) => this.setState({ userEmail: e.target.value })}
                />
              </FormItem>
            </div>
            <div className="dialog__form__item">
              <FormItem
                label={locals[this.props.lang].report.message.label}
                id="type-message"
                shouldFill
              >
                <Input
                  type="LONG_TEXT"
                  placeholder={
                    locals[this.props.lang].report.message.placeholder
                  }
                  value={this.state.userMessage}
                  onChange={(e) =>
                    this.setState({ userMessage: e.target.value })
                  }
                />
              </FormItem>
            </div>
          </div>
        </Dialog>
      </Feature>
    )
  }

  // Render
  render() {
    return (
      <>
        {this.props.context === 'TRY' ? <this.TryPro /> : null}
        {this.props.context === 'WELCOME_TO_TRIAL' ? (
          <this.WelcomeToTrial />
        ) : null}
        {this.props.context === 'WELCOME_TO_PRO' ? <this.WelcomeToPro /> : null}
        {this.props.context === 'FEEDBACK' ? <this.Feedback /> : null}
        {this.props.context === 'TRIAL_FEEDBACK' ? (
          <this.TrialFeedback />
        ) : null}
        {this.props.context === 'HIGHLIGHT' ? <this.Highlight /> : null}
        {this.props.context === 'ABOUT' ? <this.About /> : null}
        {this.props.context === 'PUBLICATION' ? <this.Publication /> : null}
        {this.props.context === 'REPORT' ? <this.Report /> : null}
      </>
    )
  }
}