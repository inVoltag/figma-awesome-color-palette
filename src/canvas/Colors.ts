import chroma from 'chroma-js'
import { Hsluv } from 'hsluv'

import { lang, locals } from '../content/locals'
import { ScaleConfiguration } from '../types/configurations'
import {
  PaletteData,
  PaletteDataColorItem,
  PaletteDataThemeItem,
} from '../types/data'
import { PaletteNode } from '../types/nodes'
import Color from '../utils/Color'
import Header from './Header'
import Sample from './Sample'
import Signature from './Signature'
import Title from './Title'

export default class Colors {
  private parent: PaletteNode
  private palette: FrameNode | undefined
  private paletteData: PaletteData
  private currentScale: ScaleConfiguration
  private paletteBackgroundGl: Array<number>
  private sampleScale: number
  private sampleRatio: number
  private sampleSize: number
  private gap: number
  private nodeRow: FrameNode | null
  private nodeRowSource: FrameNode | null
  private nodeRowShades: FrameNode | null
  private nodeEmpty: FrameNode | null
  private nodeShades: FrameNode | null
  private node: FrameNode | null

  constructor(parent?: PaletteNode, palette?: FrameNode | undefined) {
    this.parent = parent as PaletteNode
    this.palette = palette
    this.paletteData = {
      name: this.parent.name,
      description: this.parent.description,
      themes: [],
      collectionId: '',
      type: 'palette',
    }
    this.currentScale =
      this.parent.themes.find((theme) => theme.isEnabled)?.scale ?? {}
    this.paletteBackgroundGl = chroma(
      this.parent.themes.find((theme) => theme.isEnabled)?.paletteBackground ??
        '#FFF'
    ).gl()
    this.sampleScale = 1.75
    this.sampleRatio = 3 / 2
    this.sampleSize = 184
    this.gap = 32
    this.nodeRow = null
    this.nodeRowSource = null
    this.nodeRowShades = null
    this.nodeEmpty = null
    this.nodeShades = null
    this.node = null
  }

  makeEmptyCase = () => {
    // Base
    this.nodeEmpty = figma.createFrame()
    this.nodeEmpty.name = '_message'
    this.nodeEmpty.resize(100, 48)
    this.nodeEmpty.fills = []

    // Layout
    this.nodeEmpty.layoutMode = 'HORIZONTAL'
    this.nodeEmpty.primaryAxisSizingMode = 'FIXED'
    this.nodeEmpty.layoutSizingVertical = 'FIXED'
    this.nodeEmpty.layoutAlign = 'STRETCH'
    this.nodeEmpty.primaryAxisAlignItems = 'CENTER'

    // Insert
    this.nodeEmpty.appendChild(
      new Sample(
        locals[lang].warning.emptySourceColors,
        null,
        null,
        [255, 255, 255],
        this.parent.colorSpace,
        this.parent.visionSimulationMode,
        this.parent.view,
        this.parent.textColorsTheme
      ).makeNodeName('FILL', 48, 48)
    )

    return this.nodeEmpty
  }

  searchForModeId = (themes: Array<PaletteDataThemeItem>, themeId: string) => {
    const themeMatch = themes.find((record) => record.id === themeId),
      modeId = themeMatch === undefined ? '' : themeMatch.modeId

    return modeId === undefined ? '' : modeId
  }

  searchForShadeVariableId = (
    themes: Array<PaletteDataThemeItem>,
    themeId: string,
    colorId: string,
    shadeName: string
  ) => {
    const themeMatch = themes.find((theme) => theme.id === themeId),
      colorMatch =
        themeMatch === undefined
          ? undefined
          : themeMatch.colors.find((color) => color.id === colorId),
      shadeMatch =
        colorMatch === undefined
          ? undefined
          : colorMatch.shades.find((shade) => shade.name === shadeName),
      variableId = shadeMatch === undefined ? '' : shadeMatch.variableId

    return variableId === undefined ? '' : variableId
  }

  searchForShadeStyleId = (
    themes: Array<PaletteDataThemeItem>,
    themeId: string,
    colorId: string,
    shadeName: string
  ) => {
    const themeMatch = themes.find((theme) => theme.id === themeId),
      colorMatch =
        themeMatch === undefined
          ? undefined
          : themeMatch.colors.find((color) => color.id === colorId),
      shadeMatch =
        colorMatch === undefined
          ? undefined
          : colorMatch.shades.find((shade) => shade.name === shadeName),
      styleId = shadeMatch === undefined ? '' : shadeMatch.styleId

    return styleId === undefined ? '' : styleId
  }

  makePaletteData = (service: string) => {
    let data = this.paletteData
    if (service === 'EDIT') {
      data = JSON.parse(this.palette?.getPluginData('data') ?? '')
      this.paletteData.collectionId = data.collectionId
    }

    this.parent.themes.forEach((theme) => {
      const paletteDataThemeItem: PaletteDataThemeItem = {
        name: theme.name,
        description: theme.description,
        colors: [],
        modeId:
          service === 'EDIT' ? this.searchForModeId(data.themes, theme.id) : '',
        id: theme.id,
        type: theme.type,
      }
      this.parent.colors.forEach((color) => {
        const scaledColors = Object.entries(theme.scale)
          .reverse()
          .map((lightness) => {
            const colorData = new Color({
              render: 'RGB' as 'HEX' | 'RGB',
              sourceColor: [
                color.rgb.r * 255,
                color.rgb.g * 255,
                color.rgb.b * 255,
              ],
              lightness: lightness[1],
              hueShifting: color.hue.shift ?? 0,
              chromaShifting: color.chroma.shift ?? 100,
              algorithmVersion: this.parent.algorithmVersion,
              visionSimulationMode: this.parent.visionSimulationMode,
            })

            if (this.parent.colorSpace === 'LCH')
              return [lightness, colorData.lch()]
            else if (this.parent.colorSpace === 'OKLCH')
              return [lightness, colorData.oklch()]
            else if (this.parent.colorSpace === 'LAB')
              return [lightness, colorData.lab()]
            else if (this.parent.colorSpace === 'OKLAB')
              return [lightness, colorData.oklab()]
            else if (this.parent.colorSpace === 'HSL')
              return [lightness, colorData.hsl()]
            else if (this.parent.colorSpace === 'HSLUV')
              return [lightness, colorData.hsluv()]
            return [lightness, colorData.lch()]
          }) as Array<[[string, number], [number, number, number]]>

        const paletteDataColorItem: PaletteDataColorItem = {
            name: color.name,
            description: color.description,
            shades: [],
            id: color.id,
            type: 'color',
          },
          sourceColor: [number, number, number] = [
            color.rgb.r * 255,
            color.rgb.g * 255,
            color.rgb.b * 255,
          ]

        const sourceHsluv = new Hsluv()
        sourceHsluv.rgb_r = color.rgb.r
        sourceHsluv.rgb_g = color.rgb.g
        sourceHsluv.rgb_b = color.rgb.b
        sourceHsluv.rgbToHsluv()

        paletteDataColorItem.shades.push({
          name: 'source',
          description: 'Source color',
          hex: chroma(sourceColor).hex(),
          rgb: sourceColor,
          gl: chroma(sourceColor).gl(),
          lch: chroma(sourceColor).lch(),
          oklch: chroma(sourceColor).oklch(),
          lab: chroma(sourceColor).lab(),
          oklab: chroma(sourceColor).oklab(),
          hsl: chroma(sourceColor).hsl(),
          hsluv: [
            sourceHsluv.hsluv_h,
            sourceHsluv.hsluv_s,
            sourceHsluv.hsluv_l,
          ],
          variableId:
            service === 'EDIT'
              ? this.searchForShadeVariableId(
                  data.themes,
                  theme.id,
                  color.id,
                  'source'
                )
              : '',
          styleId:
            service === 'EDIT'
              ? this.searchForShadeStyleId(
                  data.themes,
                  theme.id,
                  color.id,
                  'source'
                )
              : '',
          type: 'source color',
        })

        scaledColors.forEach((scaledColor) => {
          const scaleName: string =
            Object.keys(this.currentScale)
              .find((key) => key === scaledColor[0][0])
              ?.replace('lightness-', '') ?? '0'

          const newHsluv = new Hsluv()
          newHsluv.rgb_r = scaledColor[1][0] / 255
          newHsluv.rgb_g = scaledColor[1][1] / 255
          newHsluv.rgb_b = scaledColor[1][2] / 255
          newHsluv.rgbToHsluv()

          paletteDataColorItem.shades.push({
            name: scaleName,
            description: `Shade color with ${scaledColor[0][1]}% of lightness`,
            hex: chroma(scaledColor[1]).hex(),
            rgb: chroma(scaledColor[1]).rgb(),
            gl: chroma(scaledColor[1]).gl(),
            lch: chroma(scaledColor[1]).lch(),
            oklch: chroma(scaledColor[1]).oklch(),
            lab: chroma(scaledColor[1]).lab(),
            oklab: chroma(scaledColor[1]).oklab(),
            hsl: chroma(scaledColor[1]).hsl(),
            hsluv: [newHsluv.hsluv_h, newHsluv.hsluv_s, newHsluv.hsluv_l],
            variableId:
              service === 'EDIT'
                ? this.searchForShadeVariableId(
                    data.themes,
                    theme.id,
                    color.id,
                    scaleName
                  )
                : '',
            styleId:
              service === 'EDIT'
                ? this.searchForShadeStyleId(
                    data.themes,
                    theme.id,
                    color.id,
                    scaleName
                  )
                : '',
            type: 'color shade',
          })
        })

        paletteDataThemeItem.colors.push(paletteDataColorItem)
      })
      this.paletteData.themes.push(paletteDataThemeItem)
    })

    this.palette?.setPluginData('data', JSON.stringify(this.paletteData))
    return this.paletteData
  }

  makeNodeShades = () => {
    const enabledThemeId =
      this.parent.themes.find((theme) => theme.isEnabled)?.id ?? ''
    const data = this.makePaletteData(
      this.parent.service ?? 'EDIT'
    ).themes.find((theme) => theme.id === enabledThemeId)

    // Base
    this.nodeShades = figma.createFrame()
    this.nodeShades.name = '_shades'
    this.nodeShades.fills = []

    // Layout
    this.nodeShades.layoutMode = 'VERTICAL'
    this.nodeShades.layoutSizingHorizontal = 'HUG'
    this.nodeShades.layoutSizingVertical = 'HUG'

    // Insert
    this.nodeShades.appendChild(
      new Header(
        this.parent as PaletteNode,
        this.parent.view.includes('PALETTE')
          ? this.sampleSize
          : this.sampleSize * this.sampleScale * 4 +
            this.sampleSize * this.sampleRatio +
            this.gap * 4
      ).makeNode()
    )

    data?.colors.forEach((color) => {
      const sourceColor = color.shades.find(
        (shade) => shade.name === 'source'
      ) ?? { hex: '#000000', rgb: [0, 0, 0] }

      // Base
      this.nodeRow = figma.createFrame()
      this.nodeRowSource = figma.createFrame()
      this.nodeRowShades = figma.createFrame()
      this.nodeRow.name = color.name
      this.nodeRowSource.name = '_source'
      this.nodeRowShades.name = '_shades'
      this.nodeRow.fills =
        this.nodeRowSource.fills =
        this.nodeRowShades.fills =
          []

      // Layout
      this.nodeRow.layoutMode =
        this.nodeRowSource.layoutMode =
        this.nodeRowShades.layoutMode =
          'HORIZONTAL'
      this.nodeRow.layoutSizingHorizontal =
        this.nodeRowSource.layoutSizingHorizontal =
        this.nodeRowShades.layoutSizingHorizontal =
          'HUG'
      this.nodeRow.layoutSizingVertical =
        this.nodeRowSource.layoutSizingVertical =
        this.nodeRowShades.layoutSizingVertical =
          'HUG'
      if (!this.parent.view.includes('PALETTE'))
        this.nodeRow.itemSpacing = this.gap

      // Insert
      this.nodeRowSource.appendChild(
        this.parent.view.includes('PALETTE')
          ? new Sample(
              color.name,
              null,
              null,
              sourceColor.rgb,
              this.parent.colorSpace,
              this.parent.visionSimulationMode,
              this.parent.view,
              this.parent.textColorsTheme
            ).makeNodeShade(
              this.sampleSize,
              this.sampleSize * this.sampleRatio,
              color.name,
              true
            )
          : new Sample(
              color.name,
              null,
              null,
              sourceColor.rgb,
              this.parent.colorSpace,
              this.parent.visionSimulationMode,
              this.parent.view,
              this.parent.textColorsTheme
            ).makeNodeRichShade(
              this.sampleSize * this.sampleRatio,
              this.sampleSize * this.sampleRatio * this.sampleScale,
              color.name,
              true,
              color.description
            )
      )

      const distances = color.shades
        .filter((shade) => shade.name !== 'source')
        .map((shade) => chroma.distance(sourceColor.hex, shade.hex, 'rgb'))
      const minDistanceIndex = distances.indexOf(Math.min(...distances))

      color.shades
        .filter((shade) => shade.name !== 'source')
        .forEach((shade, index) => {
          const distance: number = chroma.distance(
            sourceColor.hex,
            shade.hex,
            'rgb'
          )

          if (this.parent.view.includes('PALETTE'))
            this.nodeRowShades?.appendChild(
              new Sample(
                color.name,
                {
                  r: sourceColor.rgb[0] / 255,
                  g: sourceColor.rgb[1] / 255,
                  b: sourceColor.rgb[2] / 255,
                },
                shade.name,
                index === minDistanceIndex && this.parent.areSourceColorsLocked
                  ? new Color({
                      visionSimulationMode: this.parent.visionSimulationMode,
                    }).simulateColorBlindRgb(sourceColor.rgb)
                  : shade.rgb,
                this.parent.colorSpace,
                this.parent.visionSimulationMode,
                this.parent.view,
                this.parent.textColorsTheme,
                {
                  isClosestToRef:
                    distance < 4 && !this.parent.areSourceColorsLocked,
                  isLocked:
                    index === minDistanceIndex &&
                    this.parent.areSourceColorsLocked,
                }
              ).makeNodeShade(
                this.sampleSize,
                this.sampleSize * this.sampleRatio,
                shade.name
              )
            )
          else if (this.nodeRowShades !== null) {
            this.nodeRowShades.layoutSizingHorizontal = 'FIXED'
            this.nodeRowShades.layoutWrap = 'WRAP'
            this.nodeRowShades.itemSpacing = this.gap
            this.nodeRowShades.resize(
              this.sampleSize * this.sampleScale * 4 + this.gap * 3,
              100
            )
            this.nodeRowShades.layoutSizingVertical = 'HUG'
            this.nodeRowShades.appendChild(
              new Sample(
                color.name,
                {
                  r: sourceColor.rgb[0] / 255,
                  g: sourceColor.rgb[1] / 255,
                  b: sourceColor.rgb[2] / 255,
                },
                shade.name,
                index === minDistanceIndex && this.parent.areSourceColorsLocked
                  ? new Color({
                      visionSimulationMode: this.parent.visionSimulationMode,
                    }).simulateColorBlindRgb(sourceColor.rgb)
                  : shade.rgb,
                this.parent.colorSpace,
                this.parent.visionSimulationMode,
                this.parent.view,
                this.parent.textColorsTheme,
                {
                  isClosestToRef:
                    distance < 4 && !this.parent.areSourceColorsLocked,
                  isLocked:
                    index === minDistanceIndex &&
                    this.parent.areSourceColorsLocked,
                }
              ).makeNodeRichShade(
                this.sampleSize * this.sampleScale,
                this.sampleSize * this.sampleRatio * this.sampleScale,
                shade.name
              )
            )
          }
        })

      this.nodeRow.appendChild(this.nodeRowSource)
      this.nodeRow.appendChild(this.nodeRowShades)
      this.nodeShades?.appendChild(this.nodeRow)
    })
    if (this.parent.colors.length === 0)
      this.nodeShades.appendChild(this.makeEmptyCase())

    return this.nodeShades
  }

  makeNode = () => {
    // Base
    this.node = figma.createFrame()
    this.node.name = '_colors・do not edit any layer'
    this.node.fills = []
    this.node.locked = true

    // Layout
    this.node.layoutMode = 'VERTICAL'
    this.node.layoutSizingHorizontal = 'HUG'
    this.node.layoutSizingVertical = 'HUG'
    this.node.itemSpacing = 16

    // Insert
    this.node.appendChild(new Title(this.parent).makeNode())
    this.node.appendChild(this.makeNodeShades())
    this.node.appendChild(new Signature().makeNode())

    if (this.palette !== undefined)
      this.palette.fills = [
        {
          type: 'SOLID',
          color: {
            r: this.paletteBackgroundGl[0],
            g: this.paletteBackgroundGl[1],
            b: this.paletteBackgroundGl[2],
          },
        },
      ]

    return this.node
  }
}
