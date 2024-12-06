import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { lang, locals } from '../content/locals'
import features from '../utils/config'
import { presets } from '../utils/palettePackage'
import checkPlanStatus from './checks/checkPlanStatus'

const loadParameters = async ({ key, result }: ParameterInputEvent) => {
  switch (key) {
    case 'preset': {
      const planStatus = (await checkPlanStatus('PARAMETERS')) ?? 'UNPAID'
      
      const filteredPresets = await Promise.all(
        presets.map(async (preset) => {
          const isBlocked = new FeatureStatus({
            features: features,
            featureName: `PRESETS_${preset.id}`,
            planStatus: planStatus,
          }).isBlocked()
          return { preset, isBlocked }
        })
      )

      const suggestionsList = filteredPresets
        .filter(({ isBlocked }) => !isBlocked)
        .map(({ preset }) => preset.name) as Array<string>

      result.setSuggestions(suggestionsList)
      break
    }

    case 'space': {
      const planStatus = (await checkPlanStatus('PARAMETERS')) ?? 'UNPAID'
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
      const planStatus = (await checkPlanStatus('PARAMETERS')) ?? 'UNPAID'
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

    default:
      return
  }
}

export default loadParameters
