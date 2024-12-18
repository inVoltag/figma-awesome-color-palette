import { doMap } from '@a_ng_d/figmug-utils'
import { Component } from 'preact/compat'
import React from 'react'

import Knob from './Knob'

interface SimpleSliderProps {
  id: string
  shortId: string
  value: number
  min: number
  max: number
  colors: {
    min: string
    max: string
  }
  feature: string
  isBlocked?: boolean
  isDisabled?: boolean
  isNew?: boolean
  onChange: (feature: string, state: string, value: number) => void
}

interface SimpleSliderStates {
  isTooltipDisplay: boolean
}

export default class SimpleSlider extends Component<SimpleSliderProps, SimpleSliderStates> {
  private value: number

  static defaultProps = {
    isBlocked: false,
    isDisabled: false,
    isNew: false,
  }

  constructor(props: SimpleSliderProps) {
    super(props)
    this.state = {
      isTooltipDisplay: false,
    }
    this.value = this.props.value
  }

  componentDidUpdate = (previousProps: Readonly<SimpleSliderProps>) => {
    if (previousProps.value !== this.props.value) this.value = this.props.value
  }

  // Handlers
  validHandler = (
    e:
      | React.FocusEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement>
  ) => {
    const target = e.target as HTMLInputElement
    if (target.value !== '')
      if (parseFloat(target.value) < this.props.min)
        this.props.onChange(this.props.feature, 'TYPED', this.props.min)
      else if (parseFloat(target.value) > this.props.max)
        this.props.onChange(this.props.feature, 'TYPED', this.props.max)
      else
        this.props.onChange(
          this.props.feature,
          'TYPED',
          parseFloat(target.value)
        )
  }

  // Direct actions
  onGrab = (e: React.MouseEvent<HTMLElement>) => {
    const stop = e.currentTarget as HTMLElement,
      range = stop.parentElement as HTMLElement,
      shift =
        e.clientX -
        stop.getBoundingClientRect().left -
        stop.getBoundingClientRect().width / 2,
      rangeWidth = range.offsetWidth as number,
      slider = range.parentElement as HTMLElement

    stop.style.zIndex = '2'

    document.onmousemove = (e) =>
      this.onSlide(e, slider, range, stop, shift, rangeWidth)

    document.onmouseup = () => this.onRelease(stop)
  }

  onSlide = (
    e: MouseEvent,
    slider: HTMLElement,
    range: HTMLElement,
    stop: HTMLElement,
    shift: number,
    rangeWidth: number
  ) => {
    const sliderPadding: number = parseFloat(
      window.getComputedStyle(slider, null).getPropertyValue('padding-left')
    )
    let offset = e.clientX - slider.offsetLeft - sliderPadding - shift

    const limitMin = 0
    const limitMax = rangeWidth

    if (offset <= limitMin) offset = limitMin
    else if (offset >= limitMax) offset = limitMax

    stop.style.left = doMap(offset, 0, rangeWidth, 0, 100).toFixed(1) + '%'
    this.value = Math.floor(
      doMap(offset, 0, rangeWidth, this.props.min, this.props.max)
    )

    this.props.onChange(this.props.feature, 'UPDATING', this.value)
  }

  onRelease = (stop: HTMLElement) => {
    document.onmousemove = null
    document.onmouseup = null
    stop.onmouseup = null
    stop.style.zIndex = '1'
    this.props.onChange(this.props.feature, 'RELEASED', this.value)
    this.setState({
      isTooltipDisplay: false,
    })
  }

  // Render
  render() {
    return (
      <div className="slider">
        <div
          className="slider__range"
          style={{
            background: `linear-gradient(90deg, ${this.props.colors.min}, ${this.props.colors.max})`,
          }}
        >
          <Knob
            id={this.props.id}
            shortId={this.props.shortId}
            value={this.props.value}
            offset={doMap(
              this.props.value,
              this.props.min,
              this.props.max,
              0,
              100
            )}
            min={this.props.min.toString()}
            max={this.props.max.toString()}
            canBeTyped={true}
            isDisplayed={this.state.isTooltipDisplay}
            isBlocked={this.props.isBlocked}
            isDisabled={this.props.isDisabled}
            isNew={this.props.isNew}
            onShiftRight={(e) =>
              this.props.onChange(
                this.props.feature,
                'SHIFTED',
                e.metaKey ? this.props.value + 10 : this.props.value + 1
              )
            }
            onShiftLeft={(e) =>
              this.props.onChange(
                this.props.feature,
                'SHIFTED',
                e.shiftKey ? this.props.value - 10 : this.props.value - 1
              )
            }
            onMouseDown={(e: React.MouseEvent<HTMLElement>) => {
              this.onGrab(e)
              ;(e.target as HTMLElement).focus()
            }}
            onValidStopValue={(stopId, e) => this.validHandler(e)}
          />
        </div>
      </div>
    )
  }
}
