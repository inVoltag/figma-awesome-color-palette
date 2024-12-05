import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { lang, locals } from '../content/locals'
import { PlanStatus } from '../types/app'
import features from '../utils/config'
import { presets } from '../utils/palettePackage'

const loadParameters = ({ key, result }: ParameterInputEvent) => {
  const planStatus: PlanStatus = figma.payments?.status.type as PlanStatus
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
            !new FeatureStatus({
              features: features,
              featureName: `PRESETS_${preset.id}`,
              planStatus: planStatus,
            }).isBlocked()
        )
        .map((preset) => preset.name) as Array<string>

      if (viableSelection.length > 0) result.setSuggestions(suggestionsList)
      else result.setError(locals[lang].warning.unselectedColor)
      break
    }

    case 'space': {
      const suggestionsList = [
        new FeatureStatus({
          features: features,
          featureName: 'SETTINGS_COLOR_SPACE_LCH',
          planStatus: planStatus,
          suggestion: locals[lang].settings.color.colorSpace.lch,
        }).isAvailableAndBlocked(),
        new FeatureStatus({
          features: features,
          featureName: 'SETTINGS_COLOR_SPACE_OKLCH',
          planStatus: planStatus,
          suggestion: locals[lang].settings.color.colorSpace.oklch,
        }).isAvailableAndBlocked(),
        new FeatureStatus({
          features: features,
          featureName: 'SETTINGS_COLOR_SPACE_LAB',
          planStatus: planStatus,
          suggestion: locals[lang].settings.color.colorSpace.lab,
        }).isAvailableAndBlocked(),
        new FeatureStatus({
          features: features,
          featureName: 'SETTINGS_COLOR_SPACE_OKLAB',
          planStatus: planStatus,
          suggestion: locals[lang].settings.color.colorSpace.oklab,
        }).isAvailableAndBlocked(),
        new FeatureStatus({
          features: features,
          featureName: 'SETTINGS_COLOR_SPACE_HSL',
          planStatus: planStatus,
          suggestion: locals[lang].settings.color.colorSpace.hsl,
        }).isAvailableAndBlocked(),
        new FeatureStatus({
          features: features,
          featureName: 'SETTINGS_COLOR_SPACE_HSLUV',
          planStatus: planStatus,
          suggestion: locals[lang].settings.color.colorSpace.hsluv,
        }).isAvailableAndBlocked(),
      ].filter((n) => n) as Array<string>

      result.setSuggestions(suggestionsList)
      break
    }

    case 'view': {
      const suggestionsList = [
        new FeatureStatus({
          features: features,
          featureName: 'VIEWS_PALETTE_WITH_PROPERTIES',
          planStatus: planStatus,
          suggestion: locals[lang].settings.global.views.detailed,
        }).isAvailableAndBlocked(),
        new FeatureStatus({
          features: features,
          featureName: 'VIEWS_PALETTE',
          planStatus: planStatus,
          suggestion: locals[lang].settings.global.views.simple,
        }).isAvailableAndBlocked(),
        new FeatureStatus({
          features: features,
          featureName: 'VIEWS_SHEET',
          planStatus: planStatus,
          suggestion: locals[lang].settings.global.views.sheet,
        }).isAvailableAndBlocked(),
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
