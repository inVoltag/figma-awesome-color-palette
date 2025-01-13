import { Dialog, Icon, SemanticMessage, texts } from '@a_ng_d/figmug-ui'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { announcementsWorkerUrl } from '../../config'
import { locals } from '../../content/locals'
import { HighlightDigest, Language } from '../../types/app'

interface HighlightProps {
  highlight: HighlightDigest
  lang: Language
  onCloseHighlight: (e: MouseEvent) => void
}

interface HighlightStates {
  position: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  announcements: Array<any>
  status: 'LOADING' | 'LOADED' | 'ERROR'
}

export default class Highlight extends PureComponent<
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
        if (data.message !== 'The database could not be queried')
          this.setState({
            announcements: data.announcements,
            status: 'LOADED',
          })
        else this.setState({ status: 'ERROR' })
      })
      .catch(() => {
        this.setState({ status: 'ERROR' })
      })
  }

  goNextSlide = (e: MouseEvent) => {
    if (this.state.position + 1 < this.state.announcements.length)
      this.setState({ position: this.state.position + 1 })
    else {
      this.props.onCloseHighlight(e as MouseEvent)
      this.setState({ position: 0 })
    }
  }

  render() {
    if (this.state.status === 'LOADING')
      return (
        <Dialog
          title={locals[this.props.lang].pending.announcements}
          actions={{}}
          onClose={this.props.onCloseHighlight}
        >
          <div className="callout--centered">
            <Icon
              type="PICTO"
              iconName="spinner"
            />
          </div>
        </Dialog>
      )
    else if (this.state.status === 'ERROR')
      return (
        <Dialog
          title={locals[this.props.lang].error.generic}
          actions={{}}
          onClose={this.props.onCloseHighlight}
        >
          <div className="callout--centered">
            <SemanticMessage
              type="WARNING"
              message={locals[this.props.lang].error.announcements}
            />
          </div>
        </Dialog>
      )
    else
      return (
        <Dialog
          title={
            this.state.announcements[this.state.position].properties.Titre
              .title[0].plain_text
          }
          tag={
            this.state.announcements[this.state.position].properties.Type.select
              .name
          }
          actions={{
            primary: {
              label:
                this.state.position + 1 < this.state.announcements.length
                  ? locals[this.props.lang].highlight.cta.next
                  : locals[this.props.lang].highlight.cta.gotIt,
              action: (e: MouseEvent) => this.goNextSlide(e),
            },
            secondary: (() => {
              if (
                this.state.announcements[this.state.position].properties.URL
                  .url !== null
              )
                return {
                  label: locals[this.props.lang].highlight.cta.learnMore,
                  action: () =>
                    window.open(
                      this.state.announcements[this.state.position].properties
                        .URL.url,
                      '_blank'
                    ),
                }
              else return undefined
            })(),
          }}
          indicator={
            this.state.announcements.length > 1
              ? `${this.state.position + 1} of ${this.state.announcements.length}`
              : undefined
          }
          onClose={(e: MouseEvent) => {
            if (this.props.highlight.version !== undefined)
              parent.postMessage(
                {
                  pluginMessage: {
                    type: 'SET_ITEMS',
                    items: [
                      {
                        key: 'highlight_version',
                        value: this.props.highlight.version,
                      },
                    ],
                  },
                },
                '*'
              )
            this.props.onCloseHighlight(e)
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
