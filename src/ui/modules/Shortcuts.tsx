import {
  Bar,
  Button,
  ConsentConfiguration,
  Menu,
  icons,
  layouts,
  texts,
} from '@a_ng_d/figmug-ui'
import React from 'react'

import { signIn, signOut } from '../../bridges/publication/authentication'
import { locals } from '../../content/locals'
import {
  EditorType,
  HighlightDigest,
  Language,
  PlanStatus,
  TrialStatus,
} from '../../types/app'
import { UserSession } from '../../types/user'
import features from '../../utils/config'
import { trackSignInEvent, trackSignOutEvent } from '../../utils/eventsTracker'
import isBlocked from '../../utils/isBlocked'
import Feature from '../components/Feature'

interface ShortcutsProps {
  editorType: EditorType
  planStatus: PlanStatus
  trialStatus: TrialStatus
  trialRemainingTime: number
  userSession: UserSession
  userConsent: Array<ConsentConfiguration>
  highlight: HighlightDigest
  lang: Language
  figmaUserId: string
  onReOpenFeedback: () => void
  onReOpenTrialFeedback: () => void
  onReOpenHighlight: () => void
  onReOpenAbout: () => void
  onReOpenReport: () => void
  onGetProPlan: () => void
  onUpdateConsent: () => void
}

interface ShortcutsStates {
  isUserMenuLoading: boolean
}

export default class Shortcuts extends React.Component<
  ShortcutsProps,
  ShortcutsStates
> {
  constructor(props: ShortcutsProps) {
    super(props)
    this.state = {
      isUserMenuLoading: false,
    }
  }

  // Direct actions
  onHold = (e: any) => {
    const shiftX = e.target.offsetWidth - e.nativeEvent.layerX
    const shiftY = e.target.offsetHeight - e.nativeEvent.layerY
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
                  isActive={
                    features.find(
                      (feature) => feature.name === 'SHORTCUTS_DOCUMENTATION'
                    )?.isActive
                  }
                >
                  <Button
                    type="icon"
                    icon="library"
                    action={() =>
                      parent.postMessage(
                        {
                          pluginMessage: {
                            type: 'OPEN_IN_BROWSER',
                            url: 'https://uicp.link/docs',
                          },
                        },
                        '*'
                      )
                    }
                  />
                </Feature>
                <Feature
                  isActive={
                    features.find(
                      (feature) => feature.name === 'SHORTCUTS_USER'
                    )?.isActive
                  }
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
                          value: null,
                          feature: null,
                          position: 0,
                          type: 'TITLE',
                          isActive: true,
                          isBlocked: false,
                          isNew: false,
                          children: [],
                          action: () => null,
                        },
                        {
                          label: '',
                          value: null,
                          feature: null,
                          position: 0,
                          type: 'SEPARATOR',
                          isActive: true,
                          isBlocked: false,
                          children: [],
                          action: () => null,
                        },
                        {
                          label: locals[this.props.lang].user.signOut,
                          value: null,
                          feature: null,
                          position: 0,
                          type: 'OPTION',
                          isActive: true,
                          isBlocked: false,
                          isNew: false,
                          children: [],
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
                                  this.props.figmaUserId,
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
                          value: null,
                          feature: null,
                          position: 0,
                          type: 'OPTION',
                          isActive: true,
                          isBlocked: false,
                          isNew: false,
                          children: [],
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
                          value: null,
                          feature: null,
                          position: 0,
                          type: 'OPTION',
                          isActive: true,
                          isBlocked: false,
                          isNew: false,
                          children: [],
                          action: async () => {
                            this.setState({ isUserMenuLoading: true })
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
                          value: null,
                          feature: null,
                          position: 0,
                          type: 'OPTION',
                          isActive: true,
                          isBlocked: false,
                          isNew: false,
                          children: [],
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
                  icon="info"
                  options={[
                    {
                      label: locals[this.props.lang].shortcuts.news,
                      value: null,
                      feature: null,
                      position: 0,
                      type: 'OPTION',
                      isActive:
                        features.find(
                          (feature) => feature.name === 'SHORTCUTS_HIGHLIGHT'
                        )?.isActive ?? true,
                      isBlocked: isBlocked(
                        'SHORTCUTS_HIGHLIGHT',
                        this.props.planStatus
                      ),
                      isNew:
                        this.props.highlight.status ===
                        'DISPLAY_HIGHLIGHT_NOTIFICATION'
                          ? true
                          : false,
                      children: [],
                      action: () => this.props.onReOpenHighlight(),
                    },
                    {
                      label: locals[this.props.lang].about.repository,
                      value: null,
                      feature: null,
                      position: 0,
                      type: 'OPTION',
                      isActive: features.find(
                        (feature) => feature.name === 'SHORTCUTS_REPOSITORY'
                      )?.isActive,
                      isBlocked: isBlocked(
                        'SHORTCUTS_REPOSITORY',
                        this.props.planStatus
                      ),
                      isNew: features.find(
                        (feature) => feature.name === 'SHORTCUTS_REPOSITORY'
                      )?.isNew,
                      children: [],
                      action: () =>
                        parent.postMessage(
                          {
                            pluginMessage: {
                              type: 'OPEN_IN_BROWSER',
                              url: 'https://uicp.link/repository',
                            },
                          },
                          '*'
                        ),
                    },
                    {
                      label: '',
                      value: null,
                      feature: null,
                      position: 0,
                      type: 'SEPARATOR',
                      isActive: true,
                      isBlocked: false,
                      children: [],
                      action: () => null,
                    },
                    {
                      label: locals[this.props.lang].shortcuts.feedback,
                      value: null,
                      feature: null,
                      position: 0,
                      type: 'OPTION',
                      isActive: features.find(
                        (feature) => feature.name === 'SHORTCUTS_FEEDBACK'
                      )?.isActive,
                      isBlocked: isBlocked(
                        'SHORTCUTS_FEEDBACK',
                        this.props.planStatus
                      ),
                      isNew: features.find(
                        (feature) => feature.name === 'SHORTCUTS_FEEDBACK'
                      )?.isNew,
                      children: [],
                      action: () => this.props.onReOpenFeedback(),
                    },
                    {
                      label: locals[this.props.lang].about.beInvolved.request,
                      value: null,
                      feature: null,
                      position: 0,
                      type: 'OPTION',
                      isActive: features.find(
                        (feature) => feature.name === 'SHORTCUTS_REQUESTS'
                      )?.isActive,
                      isBlocked: isBlocked(
                        'SHORTCUTS_REQUESTS',
                        this.props.planStatus
                      ),
                      isNew: features.find(
                        (feature) => feature.name === 'SHORTCUTS_REQUESTS'
                      )?.isNew,
                      children: [],
                      action: () =>
                        parent.postMessage(
                          {
                            pluginMessage: {
                              type: 'OPEN_IN_BROWSER',
                              url: 'https://uicp.link/request-feature',
                            },
                          },
                          '*'
                        ),
                    },
                    {
                      label: locals[this.props.lang].about.beInvolved.issue,
                      value: null,
                      feature: null,
                      position: 0,
                      type: 'OPTION',
                      isActive: features.find(
                        (feature) => feature.name === 'SHORTCUTS_REPORTING'
                      )?.isActive,
                      isBlocked: isBlocked(
                        'SHORTCUTS_REPORTING',
                        this.props.planStatus
                      ),
                      isNew: features.find(
                        (feature) => feature.name === 'SHORTCUTS_REPORTING'
                      )?.isNew,
                      children: [],
                      action: this.props.onReOpenReport,
                    },
                    {
                      label: locals[this.props.lang].about.getHelp.email,
                      value: null,
                      feature: null,
                      position: 0,
                      type: 'OPTION',
                      isActive: features.find(
                        (feature) => feature.name === 'SHORTCUTS_EMAIL'
                      )?.isActive,
                      isBlocked: isBlocked(
                        'SHORTCUTS_EMAIL',
                        this.props.planStatus
                      ),
                      isNew: features.find(
                        (feature) => feature.name === 'SHORTCUTS_EMAIL'
                      )?.isNew,
                      children: [],
                      action: () =>
                        parent.postMessage(
                          {
                            pluginMessage: {
                              type: 'OPEN_IN_BROWSER',
                              url: 'https://uicp.link/contact-support',
                            },
                          },
                          '*'
                        ),
                    },
                    {
                      label: '',
                      value: null,
                      feature: null,
                      position: 0,
                      type: 'SEPARATOR',
                      isActive: true,
                      isBlocked: false,
                      children: [],
                      action: () => null,
                    },
                    {
                      label: locals[this.props.lang].about.title,
                      value: null,
                      feature: null,
                      position: 0,
                      type: 'OPTION',
                      isActive: features.find(
                        (feature) => feature.name === 'SHORTCUTS_ABOUT'
                      )?.isActive,
                      isBlocked: isBlocked(
                        'SHORTCUTS_ABOUT',
                        this.props.planStatus
                      ),
                      isNew: features.find(
                        (feature) => feature.name === 'SHORTCUTS_ABOUT'
                      )?.isNew,
                      children: [],
                      action: this.props.onReOpenAbout,
                    },
                    {
                      label: locals[this.props.lang].about.giveSupport.follow,
                      value: null,
                      feature: null,
                      position: 0,
                      type: 'OPTION',
                      isActive: features.find(
                        (feature) => feature.name === 'SHORTCUTS_NETWORKING'
                      )?.isActive,
                      isBlocked: isBlocked(
                        'SHORTCUTS_NETWORKING',
                        this.props.planStatus
                      ),
                      isNew: features.find(
                        (feature) => feature.name === 'SHORTCUTS_NETWORKING'
                      )?.isNew,
                      children: [],
                      action: () =>
                        parent.postMessage(
                          {
                            pluginMessage: {
                              type: 'OPEN_IN_BROWSER',
                              url: 'https://uicp.link/network',
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
              {this.props.editorType !== 'dev' && (
                <div
                  className={`box-resizer-grip`}
                  onMouseDown={this.onHold.bind(this)}
                >
                  <div className={`${icons['icon--resize-grip']} icon-box`} />
                </div>
              )}
            </>
          }
          leftPartSlot={
            <Feature
              isActive={
                features.find((feature) => feature.name === 'GET_PRO_PLAN')
                  ?.isActive
              }
            >
              <div
                className={['pro-zone', layouts['snackbar--tight']]
                  .filter((n) => n)
                  .join(' ')}
              >
                {this.props.planStatus === 'UNPAID' &&
                  this.props.trialStatus !== 'PENDING' && (
                    <Button
                      type="compact"
                      icon="lock-off"
                      label={
                        this.props.trialStatus === 'UNUSED'
                          ? locals[this.props.lang].plan.tryPro
                          : locals[this.props.lang].plan.getPro
                      }
                      action={this.props.onGetProPlan}
                    />
                  )}
                {this.props.trialStatus === 'PENDING' ? (
                  <div className={`label ${texts.label}`}>
                    <div className="type--bold">
                      {Math.ceil(
                        this.props.trialRemainingTime > 72
                          ? this.props.trialRemainingTime / 24
                          : this.props.trialRemainingTime
                      )}
                    </div>
                    <div>
                      {Math.ceil(this.props.trialRemainingTime) > 72
                        ? 'day'
                        : 'hour'}
                      {Math.ceil(this.props.trialRemainingTime) <= 1 ? '' : 's'}{' '}
                      left in this trial
                    </div>
                  </div>
                ) : (
                  this.props.trialStatus === 'EXPIRED' &&
                  this.props.planStatus !== 'PAID' && (
                    <>
                      <div
                        className={`type ${texts.type} ${texts['type--secondary']} truncated`}
                      >
                        <span>{locals[this.props.lang].plan.trialEnded}</span>
                      </div>
                      <span
                        className={`type ${texts.type} ${texts['type--secondary']}`}
                      >
                        ・
                      </span>
                      <Button
                        type="tertiary"
                        label={locals[this.props.lang].shortcuts.trialFeedback}
                        action={this.props.onReOpenTrialFeedback}
                      />
                    </>
                  )
                )}
              </div>
            </Feature>
          }
          border={['TOP']}
        />
        {this.props.editorType === 'dev' && (
          <div
            style={{
              height: '48px',
            }}
          ></div>
        )}
      </>
    )
  }
}
