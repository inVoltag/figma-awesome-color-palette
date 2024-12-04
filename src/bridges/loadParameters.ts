import { lang, locals } from '../content/locals'
import isAvailableAndBlocked from '../utils/isAvailableAndBlocked'
import isBlocked from '../utils/isBlocked'
import { presets } from '../utils/palettePackage'

const loadParameters = ({ key, result }: ParameterInputEvent) => {
  const viableSelection = figma.currentPage.selection.filter(
    (element: SceneNode) => {
      const fills = (
        element as Exclude<
          SceneNode,
          | SliceNode
          | GroupNode
          | ConnectorNode
          | CodeBlockNode
          | WidgetNode
          | EmbedNode
          | LinkUnfurlNode
          | MediaNode
        >
      ).fills
      return (
        element.type !== 'GROUP' &&
        element.type !== 'EMBED' &&
        element.type !== 'CONNECTOR' &&
        element.getPluginDataKeys().length === 0 &&
        Array.isArray(fills) &&
        fills.filter((fill: Paint) => fill.type === 'SOLID').length !== 0
      )
    }
  )

  switch (key) {
    case 'preset': {
      const suggestionsList = presets
        .filter(
          (preset) =>
            !isBlocked(
              `PRESETS_${preset.id}`,
              figma.payments?.status.type as 'PAID' | 'UNPAID'
            )
        )
        .map((preset) => preset.name) as Array<string>

      if (viableSelection.length > 0) result.setSuggestions(suggestionsList)
      else result.setError(locals[lang].warning.unselectedColor)
      break
    }

    case 'space': {
      const suggestionsList = [
        isAvailableAndBlocked('SETTINGS_COLOR_SPACE_LCH', 'LCH'),
        isAvailableAndBlocked('SETTINGS_COLOR_SPACE_OKLCH', 'OKLCH'),
        isAvailableAndBlocked('SETTINGS_COLOR_SPACE_LAB', 'LAB'),
        isAvailableAndBlocked('SETTINGS_COLOR_SPACE_OKLAB', 'OKLAB'),
        isAvailableAndBlocked('SETTINGS_COLOR_SPACE_HSL', 'HSL'),
        isAvailableAndBlocked('SETTINGS_COLOR_SPACE_HSLUV', 'HSLuv'),
      ].filter((n) => n) as Array<string>

      result.setSuggestions(suggestionsList)
      break
    }

    case 'view': {
      const suggestionsList = [
        isAvailableAndBlocked(
          'VIEWS_PALETTE_WITH_PROPERTIES',
          'Palette with properties'
        ),
        isAvailableAndBlocked('VIEWS_PALETTE', 'Palette'),
        isAvailableAndBlocked('VIEWS_SHEET', 'Color sheet'),
      ].filter((n) => n) as Array<string>

      result.setSuggestions(suggestionsList)
      break
    }

    case 'name': {
      result.setLoadingMessage(locals[lang].warning.paletteNameRecommendation)
      break
    }

    default:
      return
  }
}

export default loadParameters
