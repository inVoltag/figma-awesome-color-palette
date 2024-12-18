import { Chip, Input, texts } from '@a_ng_d/figmug-ui'
import { PureComponent } from 'preact/compat'
import React from 'react'

import { ActionsList } from '../../types/models'

interface KnobProps {
  id: string
  shortId: string
  value: string | number
  offset: number
  min?: string
  max?: string
  canBeTyped: boolean
  isDisplayed: boolean
  isBlocked: boolean
  isDisabled: boolean
  isNew: boolean
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
  static defaultProps = {
    isBlocked: false,
    isDisabled: false,
    isNew: false,
  }

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

  transformStopValue = (value: string | number) => {
    let newValue = value
    if (typeof newValue !== 'string') newValue = newValue.toFixed(1)
    if (newValue.includes('.0')) return (newValue = newValue.replace('.0', ''))
    return newValue
  }

  render() {
    return (
      <div
        className={[
          'slider__knob',
          this.state.isStopInputOpen && 'slider__knob--editing',
          (this.props.isBlocked || this.props.isDisabled) &&
            'slider__knob--disabled',
        ]
          .filter((n) => n)
          .join(' ')}
        style={{ left: `${this.props.offset}%` }}
        data-id={this.props.id}
        data-value={this.props.value}
        tabIndex={!(this.props.isBlocked || this.props.isDisabled) ? 0 : -1}
        onKeyDown={(e) =>
          !(this.props.isBlocked || this.props.isDisabled)
            ? this.keyboardHandler(
                e.key,
                e as React.KeyboardEvent<HTMLInputElement>
              )
            : undefined
        }
        onMouseDown={
          !(this.props.isBlocked || this.props.isDisabled)
            ? this.props.onMouseDown
            : undefined
        }
        onMouseEnter={() =>
          !(this.props.isBlocked || this.props.isDisabled)
            ? this.setState({ isTooltipOpen: true })
            : undefined
        }
        onMouseLeave={(e) => {
          const isFocused = document.activeElement === e.target
          if (isFocused && !(this.props.isBlocked || this.props.isDisabled))
            this.setState({ isTooltipOpen: true })
          else this.setState({ isTooltipOpen: false })
        }}
        onFocus={() =>
          !(this.props.isBlocked || this.props.isDisabled)
            ? this.setState({ isTooltipOpen: true })
            : undefined
        }
        onBlur={() =>
          !(this.props.isBlocked || this.props.isDisabled)
            ? this.setState({ isTooltipOpen: false })
            : undefined
        }
        onClick={(e) =>
          !(this.props.isBlocked || this.props.isDisabled)
            ? this.clickHandler(e)
            : undefined
        }
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
              shouldBlur={true}
              isAutoFocus={true}
              isFlex={true}
              onFocus={() =>
                this.setState({
                  stopInputValue: this.props.value,
                })
              }
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                if ((e.target as HTMLInputElement)?.value !== this.props.value)
                  this.props.onValidStopValue?.(this.props.shortId, e)
                this.setState({ isStopInputOpen: false })
              }}
            />
          </div>
        )}
        <div className={`type ${texts.type} slider__label`}>
          {this.props.shortId}
          {(this.props.isBlocked || this.props.isNew) && (
            <Chip>{this.props.isNew ? 'New' : 'Pro'}</Chip>
          )}
        </div>
        <div className="slider__graduation"></div>
      </div>
    )
  }
}
