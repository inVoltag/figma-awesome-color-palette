import chroma from 'chroma-js'
import { PureComponent } from 'preact/compat'
import React from 'react'

import { Chip, ColorChip, HexModel, Icon } from '@a_ng_d/figmug-ui'
import { locals } from '../../content/locals'
import { Language } from '../../types/app'
import {
  ColorConfiguration,
  LockedSourceColorsConfiguration,
  SourceColorConfiguration,
  VisionSimulationModeConfiguration,
} from '../../types/configurations'
import { TextColorsThemeHexModel } from '../../types/models'
import Color from '../../utils/Color'
import Contrast from '../../utils/Contrast'

interface ShadeProps {
  index: number
  color: HexModel
  sourceColor: SourceColorConfiguration | ColorConfiguration
  scaledColors: HexModel[]
  isWCAGDisplayed: boolean
  isAPCADisplayed: boolean
  areSourceColorsLocked: LockedSourceColorsConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  textColorsTheme: TextColorsThemeHexModel
  lang: Language
}

interface ShadeStates {
  isCompact: boolean
}

export default class Shade extends PureComponent<ShadeProps, ShadeStates> {
  constructor(props: ShadeProps) {
    super(props)
    this.state = {
      isCompact: false,
    }
  }

  // Templates
  wcagScoreTag = ({
    color,
    score,
    friendlyScore,
    isCompact,
  }: {
    color: HexModel
    score: number
    friendlyScore: string
    isCompact: boolean
  }) => (
    <Chip
      state="ON_BACKGROUND"
      leftSlot={
        <ColorChip
          color={color}
          w="var(--size-xxsmall)"
          h="var(--size-xxsmall)"
          isRounded
        />
      }
      rightSlot={<span className={'type'}>{score <= 4.5 ? '✘' : '✔'}</span>}
    >
      {!isCompact ? `${score.toFixed(2)} : 1` : friendlyScore}
    </Chip>
  )

  apcaScoreTag = ({
    color,
    score,
    friendlyScore,
    isCompact,
  }: {
    color: HexModel
    score: number
    friendlyScore: string
    isCompact: boolean
  }) => (
    <Chip
      state="ON_BACKGROUND"
      leftSlot={
        <ColorChip
          color={color}
          w="var(--size-xxsmall)"
          h="var(--size-xxsmall)"
          isRounded
        />
      }
      rightSlot={<span className={'type'}>{score <= 45 ? '✘' : '✔'}</span>}
    >
      {!isCompact ? `Lc ${score.toFixed(1)}` : friendlyScore}
    </Chip>
  )

  lockColorTag = () => (
    <Chip
      state="ON_BACKGROUND"
      rightSlot={
        <Icon
          type="PICTO"
          iconName="lock-on"
          iconColor="var(--black)"
        />
      }
    >
      {locals[this.props.lang].preview.lock.tag}
    </Chip>
  )

  // Render
  render() {
    const sourceColor = chroma([
      this.props.sourceColor.rgb.r * 255,
      this.props.sourceColor.rgb.g * 255,
      this.props.sourceColor.rgb.b * 255,
    ]).hex()
    const distances = this.props.scaledColors.map((scaledColor) =>
      chroma.distance(sourceColor, scaledColor, 'rgb')
    )
    const minDistanceIndex = distances.indexOf(Math.min(...distances))

    const background: HexModel =
      this.props.index === minDistanceIndex && this.props.areSourceColorsLocked
        ? new Color({
            visionSimulationMode: this.props.visionSimulationMode,
          }).simulateColorBlindHex(chroma(sourceColor).rgb())
        : this.props.color

    const darkText = new Color({
      visionSimulationMode: this.props.visionSimulationMode,
    }).simulateColorBlindHex(
      chroma(this.props.textColorsTheme.darkColor).rgb(false)
    )
    const lightText = new Color({
      visionSimulationMode: this.props.visionSimulationMode,
    }).simulateColorBlindHex(
      chroma(this.props.textColorsTheme.lightColor).rgb(false)
    )

    const lightTextContrast = new Contrast({
      backgroundColor: chroma(background).rgb(false),
      textColor: lightText,
    })
    const darkTextContrast = new Contrast({
      backgroundColor: chroma(background).rgb(false),
      textColor: darkText,
    })

    return (
      <div
        className="preview__cell"
        style={{
          backgroundColor: background,
        }}
        onMouseEnter={() => this.setState({ isCompact: true })}
        onMouseLeave={() => this.setState({ isCompact: false })}
      >
        {this.props.isWCAGDisplayed && (
          <this.wcagScoreTag
            color={lightText}
            score={lightTextContrast.getWCAGContrast()}
            friendlyScore={lightTextContrast.getWCAGScore()}
            isCompact={this.state.isCompact}
          />
        )}
        {this.props.isAPCADisplayed && (
          <this.apcaScoreTag
            color={lightText}
            score={lightTextContrast.getAPCAContrast()}
            friendlyScore={lightTextContrast.getRecommendedUsage()}
            isCompact={this.state.isCompact}
          />
        )}
        {this.props.isWCAGDisplayed && (
          <this.wcagScoreTag
            color={darkText}
            score={darkTextContrast.getWCAGContrast()}
            friendlyScore={darkTextContrast.getWCAGScore()}
            isCompact={this.state.isCompact}
          />
        )}
        {this.props.isAPCADisplayed && (
          <this.apcaScoreTag
            color={darkText}
            score={darkTextContrast.getAPCAContrast()}
            friendlyScore={darkTextContrast.getRecommendedUsage()}
            isCompact={this.state.isCompact}
          />
        )}
        {this.props.index === minDistanceIndex &&
          this.props.areSourceColorsLocked && <this.lockColorTag />}
      </div>
    )
  }
}
