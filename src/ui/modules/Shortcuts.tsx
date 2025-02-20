import {
  Bar,
  Button,
  ConsentConfiguration,
  Icon,
  Menu,
  layouts,
} from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { signIn, signOut } from '../../bridges/publication/authentication'
import features, {
  authorUrl,
  documentationUrl,
  feedbackUrl,
  isTrialEnabled,
  networkUrl,
  repositoryUrl,
  requestsUrl,
  supportEmail,
} from '../../config'
import { locals } from '../../content/locals'
import {
  EditorType,
  HighlightDigest,
  Language,
  PlanStatus,
  TrialStatus,
} from '../../types/app'
import { UserConfiguration } from '../../types/configurations'
import { UserSession } from '../../types/user'
import { trackSignInEvent, trackSignOutEvent } from '../../utils/eventsTracker'
import Feature from '../components/Feature'
import TrialControls from './TrialControls'

interface ShortcutsProps {
  planStatus: PlanStatus
  trialStatus: TrialStatus
  trialRemainingTime: number
  userIdentity: UserConfiguration
  userSession: UserSession
  userConsent: Array<ConsentConfiguration>
  lang: Language
  editorType: EditorType
  highlight: HighlightDigest
  onReOpenHighlight: () => void
  onReOpenAbout: () => void
  onReOpenReport: () => void
  onGetProPlan: () => void
  onUpdateConsent: () => void
}

interface ShortcutsStates {
  isUserMenuLoading: boolean
}

export default class Shortcuts extends PureComponent<
  ShortcutsProps,
  ShortcutsStates
> {
  static features = (planStatus: PlanStatus) => ({
    SHORTCUTS_HIGHLIGHT: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_HIGHLIGHT',
      planStatus: planStatus,
    }),
    SHORTCUTS_USER: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_USER',
      planStatus: planStatus,
    }),
    SHORTCUTS_REPOSITORY: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_REPOSITORY',
      planStatus: planStatus,
    }),
    SHORTCUTS_EMAIL: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_EMAIL',
      planStatus: planStatus,
    }),
    SHORTCUTS_FEEDBACK: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_FEEDBACK',
      planStatus: planStatus,
    }),
    SHORTCUTS_REPORTING: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_REPORTING',
      planStatus: planStatus,
    }),
    SHORTCUTS_REQUESTS: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_REQUESTS',
      planStatus: planStatus,
    }),
    SHORTCUTS_ABOUT: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_ABOUT',
      planStatus: planStatus,
    }),
    SHORTCUTS_NETWORKING: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_NETWORKING',
      planStatus: planStatus,
    }),
    SHORTCUTS_AUTHOR: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_AUTHOR',
      planStatus: planStatus,
    }),
    SHORTCUTS_DOCUMENTATION: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_DOCUMENTATION',
      planStatus: planStatus,
    }),
    GET_PRO_PLAN: new FeatureStatus({
      features: features,
      featureName: 'GET_PRO_PLAN',
      planStatus: planStatus,
    }),
    CONSENT: new FeatureStatus({
      features: features,
      featureName: 'CONSENT',
      planStatus: planStatus,
    }),
  })

  constructor(props: ShortcutsProps) {
    super(props)
    this.state = {
      isUserMenuLoading: false,
    }
  }

  // Direct Actions
  onHold = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const shiftX = target.offsetWidth - e.layerX
    const shiftY = target.offsetHeight - e.layerY
    window.onmousemove = (e) => this.onResize(e, shiftX, shiftY)
    window.onmouseup = this.onRelease
  }

  onResize = (e: MouseEvent, shiftX: number, shiftY: number) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'RESIZE_UI',
          origin: {
            x: e.screenX - e.clientX,
            y: e.screenY - e.clientY,
          },
          shift: {
            x: shiftX,
            y: shiftY,
          },
          cursor: {
            x: e.screenX,
            y: e.screenY,
          },
        },
      },
      '*'
    )
  }

  onRelease = () => (window.onmousemove = null)

  // Render
  render() {
    let fragment = null

    if (isTrialEnabled || this.props.trialStatus !== 'UNUSED')
      fragment = <TrialControls {...this.props} />
    else if (
      this.props.planStatus === 'UNPAID' &&
      this.props.trialStatus === 'UNUSED'
    )
      fragment = (
        <Button
          type="compact"
          icon="lock-off"
          label={locals[this.props.lang].plan.getPro}
          action={() =>
            parent.postMessage({ pluginMessage: { type: 'GET_PRO_PLAN' } }, '*')
          }
        />
      )

    return (
      <>
        <Bar
          rightPartSlot={
            <>
              <div
                className={['shortcuts', layouts['snackbar--tight']]
                  .filter((n) => n)
                  .join(' ')}
              >
                <Feature
                  isActive={Shortcuts.features(
                    this.props.planStatus
                  ).SHORTCUTS_DOCUMENTATION.isActive()}
                >
                  <Button
                    type="icon"
                    icon="library"
                    isBlocked={Shortcuts.features(
                      this.props.planStatus
                    ).SHORTCUTS_DOCUMENTATION.isBlocked()}
                    isNew={Shortcuts.features(
                      this.props.planStatus
                    ).SHORTCUTS_DOCUMENTATION.isNew()}
                    action={() =>
                      parent.postMessage(
                        {
                          pluginMessage: {
                            type: 'OPEN_IN_BROWSER',
                            url: documentationUrl,
                          },
                        },
                        '*'
                      )
                    }
                  />
                </Feature>
                <Feature
                  isActive={Shortcuts.features(
                    this.props.planStatus
                  ).SHORTCUTS_USER.isActive()}
                >
                  {this.props.userSession.connectionStatus === 'CONNECTED' ? (
                    <Menu
                      id="user-menu"
                      icon="user"
                      options={[
                        {
                          label: locals[
                            this.props.lang
                          ].user.welcomeMessage.replace(
                            '$[]',
                            this.props.userSession.userFullName
                          ),
                          type: 'TITLE',
                          action: () => null,
                        },
                        {
                          type: 'SEPARATOR',
                        },
                        {
                          label: locals[this.props.lang].user.signOut,
                          type: 'OPTION',
                          action: async () => {
                            this.setState({ isUserMenuLoading: true })
                            signOut()
                              .then(() => {
                                parent.postMessage(
                                  {
                                    pluginMessage: {
                                      type: 'SEND_MESSAGE',
                                      message:
                                        locals[this.props.lang].info.signOut,
                                    },
                                  },
                                  '*'
                                )

                                trackSignOutEvent(
                                  this.props.userIdentity.id,
                                  this.props.userConsent.find(
                                    (consent) => consent.id === 'mixpanel'
                                  )?.isConsented ?? false
                                )
                              })
                              .finally(() => {
                                this.setState({ isUserMenuLoading: false })
                              })
                              .catch(() => {
                                parent.postMessage(
                                  {
                                    pluginMessage: {
                                      type: 'SEND_MESSAGE',
                                      message:
                                        locals[this.props.lang].error.generic,
                                    },
                                  },
                                  '*'
                                )
                              })
                          },
                        },
                        {
                          label: locals[this.props.lang].user.updateConsent,
                          type: 'OPTION',
                          isActive: Shortcuts.features(
                            this.props.planStatus
                          ).CONSENT.isActive(),
                          isBlocked: Shortcuts.features(
                            this.props.planStatus
                          ).CONSENT.isBlocked(),
                          isNew: Shortcuts.features(
                            this.props.planStatus
                          ).CONSENT.isNew(),
                          action: this.props.onUpdateConsent,
                        },
                      ]}
                      alignment="TOP_RIGHT"
                    />
                  ) : (
                    <Menu
                      id="user-menu"
                      icon="user"
                      options={[
                        {
                          label: locals[this.props.lang].user.signIn,
                          type: 'OPTION',
                          action: async () => {
                            this.setState({ isUserMenuLoading: true })
                            signIn(this.props.userIdentity.id)
                              .then(() => {
                                trackSignInEvent(
                                  this.props.userIdentity.id,
                                  this.props.userConsent.find(
                                    (consent) => consent.id === 'mixpanel'
                                  )?.isConsented ?? false
                                )
                              })
                              .finally(() => {
                                this.setState({ isUserMenuLoading: false })
                              })
                              .catch((error) => {
                                parent.postMessage(
                                  {
                                    pluginMessage: {
                                      type: 'SEND_MESSAGE',
                                      message:
                                        error.message ===
                                        'Authentication timeout'
                                          ? locals[this.props.lang].error
                                              .timeout
                                          : locals[this.props.lang].error
                                              .authentication,
                                    },
                                  },
                                  '*'
                                )
                              })
                          },
                        },
                        {
                          label: locals[this.props.lang].user.updateConsent,
                          type: 'OPTION',
                          isActive: Shortcuts.features(
                            this.props.planStatus
                          ).CONSENT.isActive(),
                          isBlocked: Shortcuts.features(
                            this.props.planStatus
                          ).CONSENT.isBlocked(),
                          isNew: Shortcuts.features(
                            this.props.planStatus
                          ).CONSENT.isNew(),
                          action: this.props.onUpdateConsent,
                        },
                      ]}
                      state={
                        this.state.isUserMenuLoading ? 'LOADING' : 'DEFAULT'
                      }
                      alignment="TOP_RIGHT"
                    />
                  )}
                </Feature>
                <Menu
                  id="shortcuts-menu"
                  icon="ellipses"
                  options={[
                    {
                      label: locals[this.props.lang].shortcuts.news,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_HIGHLIGHT.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_HIGHLIGHT.isBlocked(),
                      isNew:
                        this.props.highlight.status ===
                        'DISPLAY_HIGHLIGHT_NOTIFICATION'
                          ? true
                          : false,
                      action: () => this.props.onReOpenHighlight(),
                    },
                    {
                      label: locals[this.props.lang].shortcuts.repository,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_REPOSITORY.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_REPOSITORY.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_REPOSITORY.isNew(),
                      action: () =>
                        parent.postMessage(
                          {
                            pluginMessage: {
                              type: 'OPEN_IN_BROWSER',
                              url: repositoryUrl,
                            },
                          },
                          '*'
                        ),
                    },
                    {
                      type: 'SEPARATOR',
                    },
                    {
                      label: locals[this.props.lang].shortcuts.request,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_REQUESTS.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_REQUESTS.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_REQUESTS.isNew(),
                      action: () =>
                        parent.postMessage(
                          {
                            pluginMessage: {
                              type: 'OPEN_IN_BROWSER',
                              url: requestsUrl,
                            },
                          },
                          '*'
                        ),
                    },
                    {
                      label: locals[this.props.lang].shortcuts.feedback,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_FEEDBACK.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_FEEDBACK.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_FEEDBACK.isNew(),
                      action: () => {
                        parent.postMessage(
                          {
                            pluginMessage: {
                              type: 'OPEN_IN_BROWSER',
                              url: feedbackUrl,
                            },
                          },
                          '*'
                        )
                      },
                    },
                    {
                      label: locals[this.props.lang].report.title,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_REPORTING.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_REPORTING.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_REPORTING.isNew(),
                      action: this.props.onReOpenReport,
                    },
                    {
                      label: locals[this.props.lang].shortcuts.email,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_EMAIL.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_EMAIL.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_EMAIL.isNew(),
                      action: () =>
                        parent.postMessage(
                          {
                            pluginMessage: {
                              type: 'OPEN_IN_BROWSER',
                              url: supportEmail,
                            },
                          },
                          '*'
                        ),
                    },
                    {
                      type: 'SEPARATOR',
                    },
                    {
                      label: locals[this.props.lang].about.title,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_ABOUT.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_ABOUT.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_ABOUT.isNew(),
                      action: this.props.onReOpenAbout,
                    },
                    {
                      label: locals[this.props.lang].shortcuts.follow,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_NETWORKING.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_NETWORKING.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_NETWORKING.isNew(),
                      action: () =>
                        parent.postMessage(
                          {
                            pluginMessage: {
                              type: 'OPEN_IN_BROWSER',
                              url: networkUrl,
                            },
                          },
                          '*'
                        ),
                    },
                    {
                      label: locals[this.props.lang].shortcuts.author,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_AUTHOR.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_AUTHOR.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_AUTHOR.isNew(),
                      action: () =>
                        parent.postMessage(
                          {
                            pluginMessage: {
                              type: 'OPEN_IN_BROWSER',
                              url: authorUrl,
                            },
                          },
                          '*'
                        ),
                    },
                  ]}
                  alignment="TOP_RIGHT"
                  isNew={
                    this.props.highlight.status ===
                    'DISPLAY_HIGHLIGHT_NOTIFICATION'
                      ? true
                      : false
                  }
                />
              </div>
              {this.props.editorType !== 'dev' &&
                this.props.editorType !== 'dev_vscode' && (
                  <div
                    className={`box-resizer-grip`}
                    onMouseDown={this.onHold.bind(this)}
                  >
                    <Icon
                      type="PICTO"
                      iconName="resize-grip"
                    />
                  </div>
                )}
            </>
          }
          leftPartSlot={
            <Feature
              isActive={Shortcuts.features(
                this.props.planStatus
              ).GET_PRO_PLAN.isActive()}
            >
              {fragment}
            </Feature>
          }
          border={['TOP']}
        />
      </>
    )
  }
}
