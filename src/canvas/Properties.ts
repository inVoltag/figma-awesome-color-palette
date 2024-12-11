import { HexModel } from '@a_ng_d/figmug-ui'
import { APCAcontrast, fontLookupAPCA, sRGBtoY } from 'apca-w3'
import chroma from 'chroma-js'
import * as blinder from 'color-blind'
import { Hsluv } from 'hsluv'

import { lang, locals } from '../content/locals'
import {
  ColorSpaceConfiguration,
  VisionSimulationModeConfiguration,
} from '../types/configurations'
import { ActionsList, TextColorsThemeHexModel } from '../types/models'
import Tag from './Tag'

export default class Properties {
  name: string
  rgb: [number, number, number]
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  textColorsTheme: TextColorsThemeHexModel
  hex: HexModel
  lch: Array<number>
  oklch: Array<number>
  lab: Array<number>
  oklab: Array<number>
  hsl: Array<number>
  hsluv: Array<number>
  nodeTopProps: FrameNode | null
  nodeBottomProps: FrameNode | null
  nodeBaseProps: FrameNode | null
  nodeContrastScoresProps: FrameNode | null
  nodeProperties: TextNode | null
  nodeDetailedBaseProps: FrameNode | null
  nodeDetailedWCAGScoresProps: FrameNode | null
  nodeDetailedAPCAScoresProps: FrameNode | null
  nodeColumns: FrameNode | null
  nodeLeftColumn: FrameNode | null
  nodeRightColumn: FrameNode | null
  node: FrameNode | null

  constructor(
    name: string,
    rgb: [number, number, number],
    colorSpace: ColorSpaceConfiguration,
    visionSimulationMode: VisionSimulationModeConfiguration,
    textColorsTheme: TextColorsThemeHexModel
  ) {
    this.name = name
    this.rgb = rgb
    this.colorSpace = colorSpace
    this.visionSimulationMode = visionSimulationMode
    this.textColorsTheme = textColorsTheme
    this.hex = chroma(rgb).hex()
    this.lch = chroma(rgb).lch()
    this.oklch = chroma(rgb).oklch()
    this.lab = chroma(rgb).lab()
    this.oklab = chroma(rgb).oklab()
    this.hsl = chroma(rgb).hsl()
    this.hsluv = this.getHsluv(rgb)
    this.nodeTopProps = null
    this.nodeBottomProps = null
    this.nodeBaseProps = null
    this.nodeContrastScoresProps = null
    this.nodeProperties = null
    this.nodeDetailedBaseProps = null
    this.nodeDetailedWCAGScoresProps = null
    this.nodeDetailedAPCAScoresProps = null
    this.nodeColumns = null
    this.nodeLeftColumn = null
    this.nodeRightColumn = null
    this.node = null
  }

  simulateColorBlind = (
    sourceColor: string,
    visionSimulationMode: VisionSimulationModeConfiguration
  ): string => {
    const actions: ActionsList = {
      NONE: () => sourceColor,
      PROTANOMALY: () => chroma(blinder.protanomaly(sourceColor)),
      PROTANOPIA: () => chroma(blinder.protanopia(sourceColor)),
      DEUTERANOMALY: () => chroma(blinder.deuteranomaly(sourceColor)),
      DEUTERANOPIA: () => chroma(blinder.deuteranopia(sourceColor)),
      TRITANOMALY: () => chroma(blinder.tritanomaly(sourceColor)),
      TRITANOPIA: () => chroma(blinder.tritanopia(sourceColor)),
      ACHROMATOMALY: () => chroma(blinder.achromatomaly(sourceColor)),
      ACHROMATOPSIA: () => chroma(blinder.achromatopsia(sourceColor)),
    }

    const result = actions[visionSimulationMode]?.()
    return result !== undefined ? result : '#000000'
  }

  getWCAGContrast = (textColor: string) => {
    return chroma.contrast(
      chroma(this.rgb).hex(),
      textColor === 'DARK'
        ? this.simulateColorBlind(
            this.textColorsTheme.darkColor,
            this.visionSimulationMode
          )
        : this.simulateColorBlind(
            this.textColorsTheme.lightColor,
            this.visionSimulationMode
          )
    )
  }

  getAPCAContrast = (textColor: string) => {
    return Math.abs(
      APCAcontrast(
        sRGBtoY(
          textColor === 'DARK'
            ? chroma(
                this.simulateColorBlind(
                  this.textColorsTheme.darkColor,
                  this.visionSimulationMode
                )
              ).rgb()
            : chroma(
                this.simulateColorBlind(
                  this.textColorsTheme.lightColor,
                  this.visionSimulationMode
                )
              ).rgb()
        ),
        sRGBtoY(this.rgb)
      )
    )
  }

  getWCAGScore = (textColor: string) => {
    return this.getWCAGContrast(textColor) < 4.5
      ? 'A'
      : this.getWCAGContrast(textColor) >= 4.5 &&
          this.getWCAGContrast(textColor) < 7
        ? 'AA'
        : 'AAA'
  }

  getScoreColor = (score: string) => {
    if (score !== 'A' && score !== locals[lang].paletteProperties.avoid)
      return {
        r: 0.5294117647,
        g: 0.8156862745,
        b: 0.6941176471,
      }
    else {
      return {
        r: 0.8274509804,
        g: 0.7019607843,
        b: 0.7803921569,
      }
    }
  }

  getMinFontSizes = (textColor: string) => {
    return fontLookupAPCA(this.getAPCAContrast(textColor))
  }

  getRecommendedUsage = (textColor: string) => {
    if (this.getAPCAContrast(textColor) >= 90)
      return locals[lang].paletteProperties.fluentText
    if (
      this.getAPCAContrast(textColor) >= 75 &&
      this.getAPCAContrast(textColor) < 90
    )
      return locals[lang].paletteProperties.contentText
    if (
      this.getAPCAContrast(textColor) >= 60 &&
      this.getAPCAContrast(textColor) < 75
    )
      return locals[lang].paletteProperties.bodyText
    if (
      this.getAPCAContrast(textColor) >= 45 &&
      this.getAPCAContrast(textColor) < 60
    )
      return locals[lang].paletteProperties.headlines
    if (
      this.getAPCAContrast(textColor) >= 30 &&
      this.getAPCAContrast(textColor) < 45
    )
      return locals[lang].paletteProperties.spotText
    if (
      this.getAPCAContrast(textColor) >= 15 &&
      this.getAPCAContrast(textColor) < 30
    )
      return locals[lang].paletteProperties.nonText
    if (this.getAPCAContrast(textColor) < 15)
      return locals[lang].paletteProperties.avoid

    return locals[lang].paletteProperties.unknown
  }

  getHsluv = (rgb: [number, number, number]) => {
    const hsluv = new Hsluv()
    hsluv.rgb_r = rgb[0] / 255
    hsluv.rgb_g = rgb[1] / 255
    hsluv.rgb_b = rgb[2] / 255
    hsluv.rgbToHsluv()

    return [hsluv.hsluv_h, hsluv.hsluv_s, hsluv.hsluv_l]
  }

  makeNodeTopProps = () => {
    // Base
    this.nodeTopProps = figma.createFrame()
    this.nodeTopProps.name = '_top'
    this.nodeTopProps.fills = []

    // Layout
    this.nodeTopProps.layoutMode = 'HORIZONTAL'
    this.nodeTopProps.primaryAxisSizingMode = 'FIXED'
    this.nodeTopProps.layoutAlign = 'STRETCH'
    this.nodeTopProps.layoutSizingVertical = 'HUG'

    return this.nodeTopProps
  }

  makeNodeBottomProps = () => {
    // Base
    this.nodeBottomProps = figma.createFrame()
    this.nodeBottomProps.name = '_bottom'
    this.nodeBottomProps.fills = []

    // Layout
    this.nodeBottomProps.layoutMode = 'VERTICAL'
    this.nodeBottomProps.counterAxisSizingMode = 'FIXED'
    this.nodeBottomProps.layoutAlign = 'STRETCH'
    this.nodeBottomProps.layoutSizingVertical = 'HUG'

    // Insert
    this.nodeBottomProps.appendChild(this.makeNodeContrastScoresProps())

    return this.nodeBottomProps
  }

  makeNodeBaseProps = () => {
    // Base
    this.nodeBaseProps = figma.createFrame()
    this.nodeBaseProps.name = '_base'
    this.nodeBaseProps.fills = []

    // Layout
    this.nodeBaseProps.layoutMode = 'VERTICAL'
    this.nodeBaseProps.counterAxisSizingMode = 'FIXED'
    this.nodeBaseProps.layoutGrow = 1
    this.nodeBaseProps.layoutSizingVertical = 'HUG'
    this.nodeBaseProps.counterAxisAlignItems = 'MAX'
    this.nodeBaseProps.itemSpacing = 4

    let basePropViaColorSpace

    if (this.colorSpace === 'LCH') {
      basePropViaColorSpace = new Tag({
        name: '_lch',
        content: `L ${Math.floor(this.lch[0])} • C ${Math.floor(
          this.lch[1]
        )} • H ${Math.floor(this.lch[2])}`,
      }).makeNodeTag()
    } else if (this.colorSpace === 'OKLCH') {
      basePropViaColorSpace = new Tag({
        name: '_oklch',
        content: `L ${parseFloat(this.oklch[0].toFixed(2))} • C ${parseFloat(
          this.oklch[1].toFixed(2)
        )} • H ${Math.floor(this.oklch[2])}`,
      }).makeNodeTag()
    } else if (this.colorSpace === 'LAB') {
      basePropViaColorSpace = new Tag({
        name: '_lab',
        content: `L ${Math.floor(this.lab[0])} • A ${Math.floor(
          this.lab[1]
        )} • B ${Math.floor(this.lab[2])}`,
      }).makeNodeTag()
    } else if (this.colorSpace === 'OKLAB') {
      basePropViaColorSpace = new Tag({
        name: '_oklab',
        content: `L ${parseFloat(this.oklab[0].toFixed(2))} • A ${parseFloat(
          this.oklab[1].toFixed(2)
        )} • B ${parseFloat(this.oklab[2].toFixed(2))}`,
      }).makeNodeTag()
    } else if (this.colorSpace === 'HSL') {
      basePropViaColorSpace = new Tag({
        name: '_hsl',
        content: `H ${Math.floor(this.hsl[0])} • S ${Math.floor(
          this.hsl[1] * 100
        )} • L ${Math.floor(this.hsl[2] * 100)}`,
      }).makeNodeTag()
    } else if (this.colorSpace === 'HSLUV') {
      basePropViaColorSpace = new Tag({
        name: '_hsluv',
        content: `H ${Math.floor(this.hsluv[0])} • S ${Math.floor(
          this.hsluv[1]
        )} • L ${Math.floor(this.hsluv[2])}`,
      }).makeNodeTag()
    }

    // Insert
    this.nodeBaseProps.appendChild(
      new Tag({
        name: '_hex',
        content: this.hex.toUpperCase(),
      }).makeNodeTag()
    )
    this.nodeBaseProps.appendChild(basePropViaColorSpace as FrameNode)

    return this.nodeBaseProps
  }

  makeNodeContrastScoresProps = () => {
    // Base
    this.nodeContrastScoresProps = figma.createFrame()
    this.nodeContrastScoresProps.name = '_contrast-scores'
    this.nodeContrastScoresProps.fills = []

    // Layout
    this.nodeContrastScoresProps.layoutMode = 'VERTICAL'
    this.nodeContrastScoresProps.counterAxisSizingMode = 'FIXED'
    this.nodeContrastScoresProps.layoutAlign = 'STRETCH'
    this.nodeContrastScoresProps.layoutSizingVertical = 'HUG'
    this.nodeContrastScoresProps.itemSpacing = 4

    // Insert
    // WCAG
    const wcagLightContrast = this.getWCAGContrast('LIGHT').toFixed(2),
      wcagDarkContrast = this.getWCAGContrast('DARK').toFixed(2),
      wcagLightScore = this.getWCAGScore('LIGHT'),
      wcagDarkScore = this.getWCAGScore('DARK')

    const nodeWCAGLightProp = new Tag({
        name: '_wcag21-light',
        content: wcagLightContrast,
        isCompact: true,
      }).makeNodeTagwithIndicator(
        chroma(
          this.simulateColorBlind(
            this.textColorsTheme.lightColor,
            this.visionSimulationMode
          )
        ).gl()
      ),
      nodeWCAGLightScore = new Tag({
        name: '_wcag21-light-score',
        content: wcagLightScore,
        backgroundColor: {
          rgb: this.getScoreColor(wcagLightScore),
          alpha: 1,
        },
      }).makeNodeTag(),
      nodeWCAGDarkProp = new Tag({
        name: '_wcag21-dark',
        content: wcagDarkContrast,
        isCompact: true,
      }).makeNodeTagwithIndicator(
        chroma(
          this.simulateColorBlind(
            this.textColorsTheme.darkColor,
            this.visionSimulationMode
          )
        ).gl()
      ),
      nodeWCAGDarkScore = new Tag({
        name: '_wcag21-dark-score',
        content: wcagDarkScore,
        backgroundColor: {
          rgb: this.getScoreColor(wcagDarkScore),
          alpha: 1,
        },
      }).makeNodeTag()

    nodeWCAGLightProp.appendChild(nodeWCAGLightScore)
    nodeWCAGDarkProp.appendChild(nodeWCAGDarkScore)

    // APCA
    const apcaLightContrast = this.getAPCAContrast('LIGHT').toFixed(1),
      apcaLightRecommendation = this.getRecommendedUsage('LIGHT'),
      apcaDarkContrast = this.getAPCAContrast('DARK').toFixed(1),
      apcaDarkRecommendation = this.getRecommendedUsage('DARK')

    const nodeAPCALightProp = new Tag({
        name: '_apca-light',
        content: `Lc ${apcaLightContrast}`,
        isCompact: true,
      }).makeNodeTagwithIndicator(
        chroma(
          this.simulateColorBlind(
            this.textColorsTheme.lightColor,
            this.visionSimulationMode
          )
        ).gl()
      ),
      nodeAPCALightScore = new Tag({
        name: '_apca-light-score',
        content: apcaLightRecommendation,
        backgroundColor: {
          rgb: this.getScoreColor(apcaLightRecommendation),
          alpha: 1,
        },
      }).makeNodeTag(),
      nodeAPCADarkProp = new Tag({
        name: '_apca-dark',
        content: `Lc ${apcaDarkContrast}`,
        isCompact: true,
      }).makeNodeTagwithIndicator(
        chroma(
          this.simulateColorBlind(
            this.textColorsTheme.darkColor,
            this.visionSimulationMode
          )
        ).gl()
      ),
      nodeAPCADarkScore = new Tag({
        name: '_apca-dark-score',
        content: apcaDarkRecommendation,
        backgroundColor: {
          rgb: this.getScoreColor(apcaDarkRecommendation),
          alpha: 1,
        },
      }).makeNodeTag()

    nodeAPCALightProp.appendChild(nodeAPCALightScore)
    nodeAPCADarkProp.appendChild(nodeAPCADarkScore)

    this.nodeContrastScoresProps.appendChild(nodeWCAGLightProp)
    this.nodeContrastScoresProps.appendChild(nodeAPCALightProp)
    this.nodeContrastScoresProps.appendChild(nodeWCAGDarkProp)
    this.nodeContrastScoresProps.appendChild(nodeAPCADarkProp)

    return this.nodeContrastScoresProps
  }

  makeNodeDetailedBaseProps = () => {
    this.nodeDetailedBaseProps = figma.createFrame()
    this.nodeDetailedBaseProps.name = '_base'
    this.nodeDetailedBaseProps.fills = []

    // Layout
    this.nodeDetailedBaseProps.layoutMode = 'VERTICAL'
    this.nodeDetailedBaseProps.counterAxisSizingMode = 'FIXED'
    this.nodeDetailedBaseProps.layoutAlign = 'STRETCH'
    this.nodeDetailedBaseProps.layoutSizingVertical = 'HUG'
    this.nodeDetailedBaseProps.itemSpacing = 4

    let basePropViaColorSpace

    if (this.colorSpace === 'LCH') {
      basePropViaColorSpace = new Tag({
        name: '_lch',
        content: `L ${Math.floor(this.lch[0])} • C ${Math.floor(
          this.lch[1]
        )} • H ${Math.floor(this.lch[2])}`,
      }).makeNodeTag()
    } else if (this.colorSpace === 'OKLCH') {
      basePropViaColorSpace = new Tag({
        name: '_oklch',
        content: `L ${parseFloat(this.oklch[0].toFixed(2))} • C ${parseFloat(
          this.oklch[1].toFixed(2)
        )} • H ${Math.floor(this.oklch[2])}`,
      }).makeNodeTag()
    } else if (this.colorSpace === 'LAB') {
      basePropViaColorSpace = new Tag({
        name: '_lab',
        content: `L ${Math.floor(this.lab[0])} • A ${Math.floor(
          this.lab[1]
        )} • B ${Math.floor(this.lab[2])}`,
      }).makeNodeTag()
    } else if (this.colorSpace === 'OKLAB') {
      basePropViaColorSpace = new Tag({
        name: '_oklab',
        content: `L ${parseFloat(this.oklab[0].toFixed(2))} • A ${parseFloat(
          this.oklab[1].toFixed(2)
        )} • B ${parseFloat(this.oklab[2].toFixed(2))}`,
      }).makeNodeTag()
    } else if (this.colorSpace === 'HSL') {
      basePropViaColorSpace = new Tag({
        name: '_lab',
        content: `H ${Math.floor(this.hsl[0])} • S ${Math.floor(
          this.hsl[1] * 100
        )} • L ${Math.floor(this.hsl[2] * 100)}`,
      }).makeNodeTag()
    } else if (this.colorSpace === 'HSLUV') {
      basePropViaColorSpace = new Tag({
        name: '_hsluv',
        content: `H ${Math.floor(this.hsluv[0])} • S ${Math.floor(
          this.hsluv[1]
        )} • L ${Math.floor(this.hsluv[2])}`,
      }).makeNodeTag()
    }

    // Insert
    this.nodeDetailedBaseProps.appendChild(
      new Tag({
        name: '_title',
        content: locals[lang].paletteProperties.base,
        fontSize: 10,
      }).makeNodeTag()
    )
    this.nodeDetailedBaseProps.appendChild(
      new Tag({
        name: '_hex',
        content: this.hex.toUpperCase(),
      }).makeNodeTag()
    )
    this.nodeDetailedBaseProps.appendChild(basePropViaColorSpace as FrameNode)

    return this.nodeDetailedBaseProps
  }

  makeDetailedWCAGScoresProps = () => {
    this.nodeDetailedWCAGScoresProps = figma.createFrame()
    this.nodeDetailedWCAGScoresProps.name = '_wcag-scores'
    this.nodeDetailedWCAGScoresProps.fills = []

    // Layout
    this.nodeDetailedWCAGScoresProps.layoutMode = 'VERTICAL'
    this.nodeDetailedWCAGScoresProps.layoutAlign = 'STRETCH'
    this.nodeDetailedWCAGScoresProps.layoutSizingVertical = 'HUG'
    this.nodeDetailedWCAGScoresProps.itemSpacing = 4

    // Insert
    const wcagLightContrast = this.getWCAGContrast('LIGHT').toFixed(2),
      wcagDarkContrast = this.getWCAGContrast('DARK').toFixed(2),
      wcagLightScore = this.getWCAGScore('LIGHT'),
      wcagDarkScore = this.getWCAGScore('DARK')

    const nodeWCAGLightProp = new Tag({
        name: '_wcag21-light',
        content: wcagLightContrast,
        isCompact: true,
      }).makeNodeTagwithIndicator(
        chroma(
          this.simulateColorBlind(
            this.textColorsTheme.lightColor,
            this.visionSimulationMode
          )
        ).gl()
      ),
      nodeWCAGLightScore = new Tag({
        name: '_wcag21-light-score',
        content: wcagLightScore,
        backgroundColor: {
          rgb: this.getScoreColor(wcagLightScore),
          alpha: 1,
        },
      }).makeNodeTag(),
      nodeWCAGDarkProp = new Tag({
        name: '_wcag21-dark',
        content: wcagDarkContrast,
        isCompact: true,
      }).makeNodeTagwithIndicator(
        chroma(
          this.simulateColorBlind(
            this.textColorsTheme.darkColor,
            this.visionSimulationMode
          )
        ).gl()
      ),
      nodeWCAGDarkScore = new Tag({
        name: '_wcag21-dark-score',
        content: wcagDarkScore,
        backgroundColor: {
          rgb: this.getScoreColor(wcagDarkScore),
          alpha: 1,
        },
      }).makeNodeTag()

    nodeWCAGLightProp.appendChild(nodeWCAGLightScore)
    nodeWCAGDarkProp.appendChild(nodeWCAGDarkScore)

    this.nodeDetailedWCAGScoresProps.appendChild(
      new Tag({
        name: '_title',
        content: locals[lang].paletteProperties.wcag,
        fontSize: 10,
      }).makeNodeTag()
    )
    this.nodeDetailedWCAGScoresProps.appendChild(nodeWCAGLightProp)
    this.nodeDetailedWCAGScoresProps.appendChild(nodeWCAGDarkProp)

    return this.nodeDetailedWCAGScoresProps
  }

  makeNodeDetailedAPCAScoresProps = () => {
    this.nodeDetailedAPCAScoresProps = figma.createFrame()
    this.nodeDetailedAPCAScoresProps.name = '_apca-scores'
    this.nodeDetailedAPCAScoresProps.fills = []
    const minimumDarkFontSize: Array<string | number> =
        this.getMinFontSizes('DARK'),
      minimumLightFontSize: Array<string | number> =
        this.getMinFontSizes('LIGHT')

    // Layout
    this.nodeDetailedAPCAScoresProps.layoutMode = 'VERTICAL'
    this.nodeDetailedAPCAScoresProps.counterAxisSizingMode = 'FIXED'
    this.nodeDetailedAPCAScoresProps.layoutAlign = 'STRETCH'
    this.nodeDetailedAPCAScoresProps.layoutSizingVertical = 'HUG'
    this.nodeDetailedAPCAScoresProps.itemSpacing = 4

    // Insert
    const apcaLightContrast = this.getAPCAContrast('LIGHT').toFixed(1),
      apcaLightRecommendation = this.getRecommendedUsage('LIGHT'),
      apcaDarkContrast = this.getAPCAContrast('DARK').toFixed(1),
      apcaDarkRecommendation = this.getRecommendedUsage('DARK')

    const nodeAPCALightProp = new Tag({
        name: '_apca-light',
        content: `Lc ${apcaLightContrast}`,
        isCompact: true,
      }).makeNodeTagwithIndicator(
        chroma(
          this.simulateColorBlind(
            this.textColorsTheme.lightColor,
            this.visionSimulationMode
          )
        ).gl()
      ),
      nodeAPCALightScore = new Tag({
        name: '_apca-light-score',
        content: apcaLightRecommendation,
        backgroundColor: {
          rgb: this.getScoreColor(apcaLightRecommendation),
          alpha: 1,
        },
      }).makeNodeTag(),
      nodeAPCADarkProp = new Tag({
        name: '_apca-dark',
        content: `Lc ${apcaDarkContrast}`,
        isCompact: true,
      }).makeNodeTagwithIndicator(
        chroma(
          this.simulateColorBlind(
            this.textColorsTheme.darkColor,
            this.visionSimulationMode
          )
        ).gl()
      ),
      nodeAPCADarkScore = new Tag({
        name: '_apca-dark-score',
        content: apcaDarkRecommendation,
        backgroundColor: {
          rgb: this.getScoreColor(apcaDarkRecommendation),
          alpha: 1,
        },
      }).makeNodeTag()

    nodeAPCALightProp.appendChild(nodeAPCALightScore)
    nodeAPCADarkProp.appendChild(nodeAPCADarkScore)

    this.nodeDetailedAPCAScoresProps.appendChild(
      new Tag({
        name: '_title',
        content: locals[lang].paletteProperties.apca,
        fontSize: 10,
      }).makeNodeTag()
    )
    this.nodeDetailedAPCAScoresProps.appendChild(
      this.makeNodeColumns(
        [
          nodeAPCALightProp,
          new Tag({
            name: '_minimum-font-sizes',
            content: locals[lang].paletteProperties.fontSize,
          }).makeNodeTag(),
          new Tag({
            name: '_200-light',
            content: `${minimumLightFontSize[2]}pt (Extra-Light 200)`,
          }).makeNodeTag(),
          new Tag({
            name: '_300-light',
            content: `${minimumLightFontSize[3]}pt (Light 300)`,
          }).makeNodeTag(),
          new Tag({
            name: '_400-light',
            content: `${minimumLightFontSize[4]}pt (Regular 400)`,
          }).makeNodeTag(),
          new Tag({
            name: '_500-light',
            content: `${minimumLightFontSize[5]}pt (Medium 500)`,
          }).makeNodeTag(),
          new Tag({
            name: '_500-light',
            content: `${minimumLightFontSize[6]}pt (Semi-Bold 600)`,
          }).makeNodeTag(),
          new Tag({
            name: '_700-light',
            content: `${minimumLightFontSize[7]}pt (Bold 700)`,
          }).makeNodeTag(),
        ],
        [
          nodeAPCADarkProp,
          new Tag({
            name: '_minimum-font-sizes',
            content: locals[lang].paletteProperties.fontSize,
          }).makeNodeTag(),
          new Tag({
            name: '_200-dark',
            content: `${minimumDarkFontSize[2]}pt (Extra-Light 200)`,
          }).makeNodeTag(),
          new Tag({
            name: '_300-dark',
            content: `${minimumDarkFontSize[3]}pt (Light 300)`,
          }).makeNodeTag(),
          new Tag({
            name: '_400-dark',
            content: `${minimumDarkFontSize[4]}pt (Regular 400)`,
          }).makeNodeTag(),
          new Tag({
            name: '_500-dark',
            content: `${minimumDarkFontSize[5]}pt (Medium 500)`,
          }).makeNodeTag(),
          new Tag({
            name: '_600-dark',
            content: `${minimumDarkFontSize[6]}pt (Semi-Bold 600)`,
          }).makeNodeTag(),
          new Tag({
            name: '_700-dark',
            content: `${minimumDarkFontSize[7]}pt (Bold 700)`,
          }).makeNodeTag(),
        ]
      )
    )

    return this.nodeDetailedAPCAScoresProps
  }

  makeNodeColumns(leftNodes: Array<FrameNode>, rightNodes: Array<FrameNode>) {
    this.nodeColumns = figma.createFrame()
    this.nodeLeftColumn = figma.createFrame()
    this.nodeRightColumn = figma.createFrame()
    this.nodeColumns.name = '_columns'
    this.nodeLeftColumn.name = '_left-column'
    this.nodeRightColumn.name = '_right-column'
    this.nodeColumns.fills =
      this.nodeLeftColumn.fills =
      this.nodeRightColumn.fills =
        []

    // Layout
    this.nodeColumns.layoutMode = 'HORIZONTAL'
    this.nodeColumns.primaryAxisSizingMode = 'FIXED'
    this.nodeColumns.layoutAlign = 'STRETCH'
    this.nodeColumns.layoutSizingVertical = 'HUG'
    this.nodeColumns.itemSpacing = 8

    this.nodeLeftColumn.layoutMode = this.nodeRightColumn.layoutMode =
      'VERTICAL'
    this.nodeLeftColumn.counterAxisSizingMode =
      this.nodeRightColumn.counterAxisSizingMode = 'FIXED'
    this.nodeLeftColumn.layoutGrow = this.nodeRightColumn.layoutGrow = 1
    this.nodeLeftColumn.layoutSizingVertical =
      this.nodeRightColumn.layoutSizingVertical = 'HUG'
    this.nodeLeftColumn.itemSpacing = this.nodeRightColumn.itemSpacing = 4

    // Insert
    leftNodes.forEach((node) => this.nodeLeftColumn?.appendChild(node))
    rightNodes.forEach((node) => this.nodeRightColumn?.appendChild(node))
    this.nodeColumns.appendChild(this.nodeLeftColumn)
    this.nodeColumns.appendChild(this.nodeRightColumn)

    return this.nodeColumns
  }

  makeNodeDetailed = () => {
    // Base
    this.node = figma.createFrame()
    this.node.name = '_properties'
    this.node.fills = []

    // Layout
    this.node.layoutMode = 'VERTICAL'
    this.node.counterAxisSizingMode = 'FIXED'
    this.node.layoutAlign = 'STRETCH'
    this.node.primaryAxisSizingMode = 'FIXED'
    this.node.layoutGrow = 1
    this.node.itemSpacing = 16

    // Insert
    this.node.appendChild(
      this.makeNodeColumns(
        [this.makeNodeDetailedBaseProps()],
        [this.makeDetailedWCAGScoresProps()]
      )
    )
    this.node.appendChild(this.makeNodeDetailedAPCAScoresProps())

    return this.node
  }

  makeNode = () => {
    // Base
    this.node = figma.createFrame()
    this.node.name = '_properties'
    this.node.fills = []

    // Layout
    this.node.layoutMode = 'VERTICAL'
    this.node.counterAxisSizingMode = 'FIXED'
    this.node.layoutAlign = 'STRETCH'
    this.node.primaryAxisSizingMode = 'FIXED'
    this.node.layoutGrow = 1
    this.node.primaryAxisAlignItems = 'SPACE_BETWEEN'

    // Insert
    this.node.appendChild(this.makeNodeTopProps())
    this.nodeTopProps?.appendChild(
      new Tag({
        name: '_scale',
        content: this.name,
        fontSize: 10,
      }).makeNodeTag()
    )
    this.nodeTopProps?.appendChild(this.makeNodeBaseProps())
    this.node.appendChild(this.makeNodeBottomProps())

    return this.node
  }
}
