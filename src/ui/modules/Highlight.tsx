import { Dialog, Icon, texts } from '@a_ng_d/figmug-ui'
import React from 'react'

import { locals } from '../../content/locals'
import { Language } from '../../types/app'
import { announcementsWorkerUrl } from '../../utils/config'

interface HighlightProps {
  lang: Language
  onCloseHighlight: React.ReactEventHandler
}

interface HighlightStates {
  position: number
  announcements: Array<any>
  status: 'LOADING' | 'LOADED' | 'ERROR'
}

export default class Highlight extends React.Component<
  HighlightProps,
  HighlightStates
> {
  constructor(props: HighlightProps) {
    super(props)
    this.state = {
      position: 0,
      announcements: [],
      status: 'LOADING',
    }
  }

  componentDidMount = () => {
    fetch(
      `${announcementsWorkerUrl}/?action=get_announcements&database_id=${process.env.REACT_APP_NOTION_ANNOUNCEMENTS_ID}`
    )
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          announcements: data.announcements,
          status: 'LOADED',
        })
      })
      .catch(() => {
        parent.postMessage(
          {
            pluginMessage: {
              type: 'SEND_MESSAGE',
              message: 'Nope',
            },
          },
          '*'
        )
        this.setState({ status: 'ERROR' })
      })
  }

  goNextSlide = (e: React.SyntheticEvent<Element, Event>) => {
    if (this.state.position + 1 < this.state.announcements.length)
      this.setState({ position: this.state.position + 1 })
    else {
      this.props.onCloseHighlight(e)
      this.setState({ position: 0 })
    }
  }

  render() {
    if (this.state.status === 'LOADING')
      return (
        <Dialog
          title="Loading..."
          actions={{
            primary: {
              label: locals[this.props.lang].publication.waiting,
              state: 'DISABLED',
              action: () => null,
            },
            secondary: {
              label: locals[this.props.lang].publication.waiting,
              state: 'DISABLED',
              action: () => null,
            },
          }}
          onClose={(e) => {
            this.props.onCloseHighlight(e)
            this.setState({ position: 0 })
          }}
        >
          <Icon
            type="PICTO"
            iconName="spinner"
          />
        </Dialog>
      )
    else
      return (
        <Dialog
          title={
            this.state.announcements[this.state.position].properties.Titre
              .title[0].plain_text
          }
          actions={{
            primary: {
              label:
                this.state.position + 1 < this.state.announcements.length
                  ? locals[this.props.lang].highlight.cta.next
                  : locals[this.props.lang].highlight.cta.gotIt,
              action: (e) => this.goNextSlide(e),
            },
            secondary: {
              label: locals[this.props.lang].highlight.cta.learnMore,
              action: () =>
                window.open(
                  this.state.announcements[this.state.position].properties.URL
                    .url,
                  '_blank'
                ),
            },
          }}
          indicator={
            this.state.announcements.length > 1
              ? `${this.state.position + 1} of ${this.state.announcements.length}`
              : undefined
          }
          onClose={(e) => {
            this.props.onCloseHighlight(e)
            this.setState({ position: 0 })
          }}
        >
          <div className="dialog__cover">
            <img
              src={
                this.state.announcements[this.state.position].properties.Image
                  .files[0].file.url
              }
              style={{
                width: '100%',
              }}
            />
          </div>
          <div className="dialog__text">
            <p className={`type ${texts.type}`}>
              {
                this.state.announcements[this.state.position].properties
                  .Description.rich_text[0].plain_text
              }
            </p>
          </div>
        </Dialog>
      )
  }
}
