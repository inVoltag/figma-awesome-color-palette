import { doMap } from '@a_ng_d/figmug-utils'
import { Component } from 'preact/compat'
import React from 'react'

import { Easing, Language } from '../../types/app'
import { ScaleConfiguration } from '../../types/configurations'
import doLightnessScale from '../../utils/doLightnessScale'
import addStop from './../handlers/addStop'
import deleteStop from './../handlers/deleteStop'
import shiftLeftStop from './../handlers/shiftLeftStop'
import shiftRightStop from './../handlers/shiftRightStop'
import Knob from './Knob'
import { locals } from '../../content/locals'
import { $palette } from '../../stores/palette'

interface SliderProps {
  stops: Array<number>
  hasPreset: boolean
  presetName: string
  type: 'EDIT' | 'FULLY_EDIT'
  min?: number
  max?: number
  scale?: ScaleConfiguration
  distributionEasing: Easing
  colors: {
    min: string
    max: string
  }
  lang: Language
  onChange: (state: string, feature?: string) => void
}

interface SliderStates {
  isTooltipDisplay: Array<boolean>
}

export default class Slider extends Component<SliderProps, SliderStates> {
  private safeGap: number
  private palette: typeof $palette

  static defaultProps = {
    colors: {
      min: 'var(--figma-color-bg-secondary)',
      max: 'var(--figma-color-bg-secondary)',
    },
  }

  constructor(props: SliderProps) {
    super(props)
    this.palette = $palette
    this.state = {
      isTooltipDisplay: Array(this.props.stops?.length).fill(false),
    }
    this.safeGap = 0.1
  }

  // Handlers
  validHandler = (
    stopId: string,
    e:
      | React.FocusEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement>
  ) => {
    const target = e.target as HTMLInputElement
    if (target.value !== '') {
      this.palette.setKey('scale', this.props.scale ?? {})
      if (parseFloat(target.value) < parseFloat(target.min))
        this.palette.setKey(
          `scale[lightness-${stopId}]`,
          parseFloat(target.min)
        )
      else if (parseFloat(target.value) > parseFloat(target.max))
        this.palette.setKey(
          `scale[lightness-${stopId}]`,
          parseFloat(target.max)
        )
      else
        this.palette.setKey(
          `scale[lightness-${stopId}]`,
          parseFloat(target.value)
        )
      this.props.onChange('TYPED')
    }
  }

  // Direct actions
  onGrab = (e: React.MouseEvent<HTMLElement>) => {
    const stop = e.currentTarget as HTMLElement,
      range = stop.parentElement as HTMLElement,
      shift =
        e.clientX -
        (e.currentTarget as HTMLElement).getBoundingClientRect().left -
        (e.currentTarget as HTMLElement).getBoundingClientRect().width / 2,
      tooltip = stop.children[0] as HTMLElement,
      rangeWidth = range.offsetWidth as number,
      slider = range.parentElement as HTMLElement,
      stops = Array.from(range.children as HTMLCollectionOf<HTMLElement>)

    const update = () => {
      const scale = this.palette.get().scale
      this.palette.setKey(
        'min',
        parseFloat(
          doMap(
            (range.lastChild as HTMLElement).offsetLeft,
            0,
            rangeWidth,
            0,
            100
          ).toFixed(1)
        )
      )
      this.palette.setKey(
        'max',
        parseFloat(
          doMap(
            (range.firstChild as HTMLElement).offsetLeft,
            0,
            rangeWidth,
            0,
            100
          ).toFixed(1)
        )
      )
      stops.forEach(
        (stop) =>
          (scale[stop.dataset.id as string] = parseFloat(
            stop.style.left.replace('%', '')
          ))
      )
      this.palette.setKey('scale', scale)
    }

    stop.style.zIndex = '2'

    document.onmousemove = (e) =>
      this.onSlide(
        e,
        slider,
        range,
        stops,
        stop,
        tooltip,
        shift,
        rangeWidth,
        update
      )

    document.onmouseup = () => this.onRelease(stops, stop, update)
  }

  onSlide = (
    e: MouseEvent,
    slider: HTMLElement,
    range: HTMLElement,
    stops: Array<HTMLElement>,
    stop: HTMLElement,
    tooltip: HTMLElement,
    shift: number,
    rangeWidth: number,
    update: () => void
  ) => {
    let limitMin: number, limitMax: number
    const gap: number = doMap(this.safeGap, 0, 100, 0, rangeWidth),
      sliderPadding: number = parseFloat(
        window.getComputedStyle(slider, null).getPropertyValue('padding-left')
      )
    let offset = e.clientX - slider.offsetLeft - sliderPadding - shift

    update()

    if (stop === range.lastChild) {
      limitMin = 0
      limitMax = (stop.previousElementSibling as HTMLElement).offsetLeft - gap
    } else if (stop === range.firstChild) {
      limitMin = (stop.nextElementSibling as HTMLElement).offsetLeft + gap
      limitMax = rangeWidth
    } else {
      limitMin = (stop.nextElementSibling as HTMLElement).offsetLeft + gap
      limitMax = (stop.previousElementSibling as HTMLElement).offsetLeft - gap
    }

    if (offset <= limitMin) offset = limitMin
    else if (offset >= limitMax) offset = limitMax

    // Distribute stops horizontal spacing
    if (stop === range.lastChild && e.shiftKey)
      return this.distributeStops(
        'MIN',
        parseFloat(doMap(offset, 0, rangeWidth, 0, 100).toFixed(1)),
        stops
      )
    else if (stop === range.firstChild && e.shiftKey)
      return this.distributeStops(
        'MAX',
        parseFloat(doMap(offset, 0, rangeWidth, 0, 100).toFixed(1)),
        stops
      )

    // Link every stop
    if (e.ctrlKey || e.metaKey)
      if (
        offset <
          stop.offsetLeft - (range.lastChild as HTMLElement).offsetLeft ||
        offset >
          rangeWidth -
            (range.firstChild as HTMLElement).offsetLeft +
            stop.offsetLeft
      )
        offset = stop.offsetLeft
      else
        return this.linkStops(
          parseFloat(doMap(offset, 0, rangeWidth, 0, 100).toFixed(1)),
          stop,
          stops
        )

    if (e.ctrlKey === false && e.metaKey === false && e.shiftKey === false)
      this.setState({
        isTooltipDisplay: Array(stops.length).fill(false),
      })

    stop.style.left = doMap(offset, 0, rangeWidth, 0, 100).toFixed(1) + '%'

    // Update lightness scale
    update()
    this.props.onChange('UPDATING')
    document.body.style.cursor = 'ew-resize'
  }

  onRelease = (
    stops: Array<HTMLElement>,
    stop: HTMLElement,
    update: () => void
  ) => {
    document.onmousemove = null
    document.onmouseup = null
    stop.onmouseup = null
    stop.style.zIndex = '1'
    this.setState({
      isTooltipDisplay: Array(stops.length).fill(false),
    })

    update()
    this.props.onChange('RELEASED')
    document.body.style.cursor = ''
  }

  onAdd = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      (e.target as HTMLElement).classList[0] === 'slider__range' &&
      Object.keys(this.props.scale !== undefined ? this.props.scale : {})
        .length < 24 &&
      this.props.presetName === 'Custom' &&
      !this.props.hasPreset
    ) {
      addStop(
        e,
        this.props.scale ?? {},
        this.props.presetName,
        this.props.min ?? 0,
        this.props.max ?? 100
      )
      this.props.onChange('SHIFTED', 'ADD_STOP')
    }
  }

  onDelete = (knob: HTMLElement) => {
    deleteStop(
      this.props.scale ?? {},
      knob,
      this.props.presetName,
      this.props.min ?? 0,
      this.props.max ?? 100
    )
    this.props.onChange('SHIFTED', 'DELETE_STOP')
  }

  onShiftRight = (knob: HTMLElement, isMeta: boolean, isCtrl: boolean) => {
    shiftRightStop(this.props.scale ?? {}, knob, isMeta, isCtrl, this.safeGap)
    this.props.onChange('SHIFTED')
  }

  onShiftLeft = (knob: HTMLElement, isMeta: boolean, isCtrl: boolean) => {
    shiftLeftStop(this.props.scale ?? {}, knob, isMeta, isCtrl, this.safeGap)
    this.props.onChange('SHIFTED')
  }

  distributeStops = (
    type: string,
    value: number,
    stops: Array<HTMLElement>
  ) => {
    if (type === 'MIN') this.palette.setKey('min', value)
    else if (type === 'MAX') this.palette.setKey('max', value)

    this.palette.setKey(
      'scale',
      doLightnessScale(
        this.props.stops,
        this.palette.get().min ?? 0,
        this.palette.get().max ?? 100,
        true,
        this.props.distributionEasing
      )
    )

    stops.forEach((stop) => {
      stop.style.left =
        this.palette.get().scale[stop.dataset.id as string] + '%'
    })

    this.setState({
      isTooltipDisplay: Array(stops.length).fill(true),
    })

    this.props.onChange('UPDATING')
    document.body.style.cursor = 'ew-resize'
  }

  linkStops = (value: number, src: HTMLElement, stops: Array<HTMLElement>) => {
    const scale = this.palette.get().scale

    stops
      .filter((stop) => stop !== src)
      .forEach((stop) => {
        const delta =
          scale[stop.dataset.id as string] -
          scale[src.dataset.id as string] +
          value

        stop.style.left = delta.toFixed(1) + '%'
        scale[stop.dataset.id as string] = delta
      })

    src.style.left = value + '%'
    scale[src.dataset.id as string] = value

    this.palette.setKey('scale', scale)

    this.setState({
      isTooltipDisplay: this.state.isTooltipDisplay.fill(true),
    })

    this.props.onChange('UPDATING')
    document.body.style.cursor = 'ew-resize'
  }

  // Templates
  Edit = () => {
    this.palette.setKey('scale', this.props.scale ?? {})
    return (
      <div
        className="slider__range"
        style={{
          background: `linear-gradient(90deg, ${this.props.colors.min}, ${this.props.colors.max})`,
        }}
      >
        {Object.entries(this.props.scale ?? {}).map(
          (lightness, index, original) => (
            <Knob
              key={lightness[0]}
              id={lightness[0]}
              shortId={lightness[0].replace('lightness-', '')}
              value={lightness[1]}
              offset={lightness[1]}
              min={
                original[index + 1] === undefined
                  ? '0'
                  : (original[index + 1][1] + this.safeGap).toString()
              }
              max={
                original[index - 1] === undefined
                  ? '100'
                  : (original[index - 1][1] - this.safeGap).toString()
              }
              helper={
                index === 0 || index === original.length - 1
                  ? locals[this.props.lang].scale.tips.distributeAsTooltip
                  : undefined
              }
              canBeTyped={true}
              isDisplayed={this.state.isTooltipDisplay[index]}
              onShiftRight={(e: React.KeyboardEvent<HTMLInputElement>) => {
                this.onShiftRight(e.target as HTMLElement, e.metaKey, e.ctrlKey)
              }}
              onShiftLeft={(e: React.KeyboardEvent<HTMLInputElement>) => {
                this.onShiftLeft(e.target as HTMLElement, e.metaKey, e.ctrlKey)
              }}
              onMouseDown={(e: React.MouseEvent<HTMLElement>) => {
                this.onGrab(e)
                ;(e.target as HTMLElement).focus()
              }}
              onValidStopValue={(stopId, e) => this.validHandler(stopId, e)}
            />
          )
        )}
      </div>
    )
  }

  FullyEdit = () => {
    this.palette.setKey('scale', this.props.scale ?? {})
    return (
      <div
        className={[
          'slider__range',
          this.props.presetName === 'Custom' &&
            this.props.stops.length < 24 &&
            !this.props.hasPreset &&
            'slider__range--add',
          this.props.presetName === 'Custom' &&
            this.props.stops.length === 24 &&
            !this.props.hasPreset &&
            'slider__range--not-allowed',
        ]
          .filter((n) => n)
          .join(' ')}
        style={{
          background: `linear-gradient(90deg, ${this.props.colors.min}, ${this.props.colors.max})`,
        }}
        onMouseDown={(e) => this.onAdd(e)}
      >
        {Object.entries(this.props.scale ?? {}).map(
          (lightness, index, original) => (
            <Knob
              key={lightness[0]}
              id={lightness[0]}
              shortId={lightness[0].replace('lightness-', '')}
              value={lightness[1]}
              offset={lightness[1]}
              min={
                original[index + 1] === undefined
                  ? '0'
                  : (original[index + 1][1] + this.safeGap).toString()
              }
              max={
                original[index - 1] === undefined
                  ? '100'
                  : (original[index - 1][1] - this.safeGap).toString()
              }
              helper={
                index === 0 || index === original.length - 1
                  ? 'Press ⇧ to distribute'
                  : undefined
              }
              canBeTyped={true}
              isDisplayed={this.state.isTooltipDisplay[index]}
              onShiftRight={(e: React.KeyboardEvent<HTMLInputElement>) => {
                this.onShiftRight(e.target as HTMLElement, e.metaKey, e.ctrlKey)
              }}
              onShiftLeft={(e: React.KeyboardEvent<HTMLInputElement>) => {
                this.onShiftLeft(e.target as HTMLElement, e.metaKey, e.ctrlKey)
              }}
              onDelete={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (
                  this.props.stops.length > 2 &&
                  this.props.presetName === 'Custom' &&
                  !this.props.hasPreset
                )
                  this.onDelete(e.target as HTMLElement)
              }}
              onMouseDown={(e: React.MouseEvent<HTMLElement>) => {
                this.onGrab(e)
                ;(e.target as HTMLElement).focus()
              }}
              onValidStopValue={(stopId, e) => this.validHandler(stopId, e)}
            />
          )
        )}
      </div>
    )
  }

  // Render
  render() {
    return (
      <div className="slider">
        {this.props.type === 'EDIT' && <this.Edit />}
        {this.props.type === 'FULLY_EDIT' && <this.FullyEdit />}
      </div>
    )
  }
}
