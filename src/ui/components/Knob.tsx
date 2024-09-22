import { Input, texts } from '@a_ng_d/figmug-ui'
import React from 'react'

import { ActionsList } from '../../types/models'

interface KnobProps {
  id: string
  shortId: string
  value: string | number
  min?: string
  max?: string
  canBeTyped: boolean
  onShiftRight?: React.KeyboardEventHandler
  onShiftLeft?: React.KeyboardEventHandler
  onDelete?: React.KeyboardEventHandler
  onMouseDown: React.MouseEventHandler
  onValidStopValue?: (
    stopId: string,
    e:
      | React.FocusEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement>
  ) => void
}

interface States {
  isStopInputOpen: boolean
  stopInputValue: string | number
}

export default class Knob extends React.Component<KnobProps, States> {
  constructor(props: KnobProps) {
    super(props)
    this.state = {
      isStopInputOpen: false,
      stopInputValue: this.props.value,
    }
  }

  // Handlers
  keyboardHandler = (action: string, e: React.KeyboardEvent) => {
    const actions: ActionsList = {
      ArrowRight: () => {
        if (this.props.onShiftRight !== undefined) this.props.onShiftRight(e)
      },
      ArrowLeft: () => {
        if (this.props.onShiftLeft !== undefined) this.props.onShiftLeft(e)
      },
      Enter: () => {
        if (this.props.canBeTyped)
          this.setState({
            isStopInputOpen: true,
            stopInputValue: this.props.value,
          })
      },
      Escape: () => {
        ;(e.target as HTMLElement).blur()
        this.setState({ isStopInputOpen: false })
      },
      Backspace: () => {
        if (this.props.onDelete !== undefined) this.props.onDelete(e)
      },
    }

    if (e.currentTarget === e.target) return actions[action]?.()
  }

  clickHandler = (e: React.MouseEvent) => {
    if (e.detail === 2 && this.props.canBeTyped)
      this.setState({
        isStopInputOpen: true,
        stopInputValue: this.props.value,
      })
  }

  transformStopValue = (value: string | number) =>
    typeof value === 'string'
      ? value === '100.0'
        ? '100'
        : value
      : value === 100
        ? '100'
        : value.toFixed(1)

  render() {
    return (
      <div
        className={[
          'slider__knob',
          this.props.id,
          this.state.isStopInputOpen ? 'slider__knob--editing' : null,
        ]
          .filter((n) => n)
          .join(' ')}
        style={{ left: `${this.props.value}%` }}
        tabIndex={0}
        onKeyDown={(e) => this.keyboardHandler(e.key, e)}
        onMouseDown={this.props.onMouseDown}
        onClick={(e) => this.clickHandler(e)}
      >
        <div className={`type ${texts.type} type--inverse slider__tooltip`}>
          {this.transformStopValue(this.props.value)}
        </div>
        {this.state.isStopInputOpen && (
          <div className="slider__input">
            <Input
              type="NUMBER"
              value={this.state.stopInputValue.toString() ?? '0'}
              min={this.props.min}
              max={this.props.max}
              step="0.1"
              feature="TYPE_STOP_VALUE"
              isAutoFocus={true}
              isFlex={true}
              onFocus={() =>
                this.setState({
                  stopInputValue: this.props.value,
                })
              }
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                this.props.onValidStopValue?.(this.props.shortId, e)
                this.setState({ isStopInputOpen: false })
              }}
              onConfirm={(e: React.KeyboardEvent<HTMLInputElement>) => {
                this.props.onValidStopValue?.(this.props.shortId, e)
                if (e.key === 'Enter') this.setState({ isStopInputOpen: false })
              }}
            />
          </div>
        )}
        <div className={`type ${texts.type} slider__label`}>
          {this.props.shortId}
        </div>
        <div className="slider__graduation"></div>
      </div>
    )
  }
}
