import { Input, texts } from '@a_ng_d/figmug-ui'
import { PureComponent } from 'preact/compat'
import React from 'react'

import { ActionsList } from '../../types/models'

interface KnobProps {
  id: string
  shortId: string
  value: string | number
  min?: string
  max?: string
  canBeTyped: boolean
  isDisplayed: boolean
  onShiftRight?: React.KeyboardEventHandler<HTMLInputElement>
  onShiftLeft?: React.KeyboardEventHandler<HTMLInputElement>
  onDelete?: React.KeyboardEventHandler<HTMLInputElement>
  onMouseDown: React.MouseEventHandler<HTMLDivElement>
  onValidStopValue?: (
    stopId: string,
    e:
      | React.FocusEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement>
  ) => void
}

interface KnobStates {
  isStopInputOpen: boolean
  isTooltipOpen: boolean
  stopInputValue: string | number
}

export default class Knob extends PureComponent<KnobProps, KnobStates> {
  constructor(props: KnobProps) {
    super(props)
    this.state = {
      isStopInputOpen: false,
      isTooltipOpen: false,
      stopInputValue: this.props.value,
    }
  }

  // Handlers
  keyboardHandler = (
    action: string,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
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
        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;(e.target as HTMLElement).blur()
        this.setState({ isStopInputOpen: false })
      },
      Backspace: () => {
        if (this.props.onDelete !== undefined) this.props.onDelete(e)
      },
    }

    if (e.currentTarget === e.target) return actions[action]?.()
  }

  clickHandler = (e: React.MouseEvent<HTMLDivElement>) => {
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
          this.state.isStopInputOpen && 'slider__knob--editing',
        ]
          .filter((n) => n)
          .join(' ')}
        style={{ left: `${this.props.value}%` }}
        data-id={this.props.id}
        tabIndex={0}
        onKeyDown={(e) =>
          this.keyboardHandler(
            e.key,
            e as React.KeyboardEvent<HTMLInputElement>
          )
        }
        onMouseDown={this.props.onMouseDown}
        onMouseEnter={() => this.setState({ isTooltipOpen: true })}
        onMouseLeave={(e) => {
          const isFocused = document.activeElement === e.target
          if (isFocused) this.setState({ isTooltipOpen: true })
          else this.setState({ isTooltipOpen: false })
        }}
        onFocus={() => this.setState({ isTooltipOpen: true })}
        onBlur={() => this.setState({ isTooltipOpen: false })}
        onClick={(e) => this.clickHandler(e)}
      >
        {(this.props.isDisplayed || this.state.isTooltipOpen) && (
          <div className={`type ${texts.type} type--inverse slider__tooltip`}>
            {this.transformStopValue(this.props.value)}
          </div>
        )}
        {this.state.isStopInputOpen && (
          <div className="slider__input">
            <Input
              type="NUMBER"
              value={(this.state.stopInputValue as number).toFixed(1) ?? '0'}
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
