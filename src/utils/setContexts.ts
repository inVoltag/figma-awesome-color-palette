import { lang, locals } from '../content/locals'
import { Context, PlanStatus } from '../types/app'
import features from '../config'
import { FeatureStatus } from '@a_ng_d/figmug-utils'

export const setContexts = (
  contextList: Array<Context>,
  planStatus: PlanStatus
) => {
  const featuresList = {
    PALETTES: new FeatureStatus({
      features: features,
      featureName: 'PALETTES',
      planStatus: planStatus,
    }),
    PALETTES_SELF: new FeatureStatus({
      features: features,
      featureName: 'PALETTES_SELF',
      planStatus: planStatus,
    }),
    PALETTES_COMMUNITY: new FeatureStatus({
      features: features,
      featureName: 'PALETTES_COMMUNITY',
      planStatus: planStatus,
    }),
    SOURCE: new FeatureStatus({
      features: features,
      featureName: 'SOURCE',
      planStatus: planStatus,
    }),
    SOURCE_EXPLORE: new FeatureStatus({
      features: features,
      featureName: 'SOURCE_EXPLORE',
      planStatus: planStatus,
    }),
    SCALE: new FeatureStatus({
      features: features,
      featureName: 'SCALE',
      planStatus: planStatus,
    }),
    COLORS: new FeatureStatus({
      features: features,
      featureName: 'COLORS',
      planStatus: planStatus,
    }),
    THEMES: new FeatureStatus({
      features: features,
      featureName: 'THEMES',
      planStatus: planStatus,
    }),
    EXPORT: new FeatureStatus({
      features: features,
      featureName: 'EXPORT',
      planStatus: planStatus,
    }),
    SETTINGS: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS',
      planStatus: planStatus,
    }),
    SETTINGS_PALETTE: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_PALETTE',
      planStatus: planStatus,
    }),
    SETTINGS_PREFERENCES: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_PREFERENCES',
      planStatus: planStatus,
    }),
  }

  const contexts: Array<{
    label: string
    id: Context
    isUpdated: boolean
    isActive: boolean
  }> = [
    {
      label: locals[lang].contexts.palettes,
      id: 'PALETTES',
      isUpdated: featuresList.PALETTES.isNew(),
      isActive: featuresList.PALETTES.isActive(),
    },
    {
      label: locals[lang].palettes.contexts.self,
      id: 'PALETTES_SELF',
      isUpdated: featuresList.PALETTES_SELF.isNew(),
      isActive: featuresList.PALETTES_SELF.isActive(),
    },
    {
      label: locals[lang].palettes.contexts.community,
      id: 'PALETTES_COMMUNITY',
      isUpdated: featuresList.PALETTES_COMMUNITY.isNew(),
      isActive: featuresList.PALETTES_COMMUNITY.isActive(),
    },
    {
      label: locals[lang].contexts.source,
      id: 'SOURCE',
      isUpdated: featuresList.SOURCE.isNew(),
      isActive: featuresList.SOURCE.isActive(),
    },
    {
      label: locals[lang].source.contexts.overview,
      id: 'SOURCE_OVERVIEW',
      isUpdated: featuresList.SOURCE_EXPLORE.isNew(),
      isActive: featuresList.SOURCE_EXPLORE.isActive(),
    },
    {
      label: locals[lang].source.contexts.explore,
      id: 'SOURCE_EXPLORE',
      isUpdated: featuresList.SOURCE_EXPLORE.isNew(),
      isActive: featuresList.SOURCE_EXPLORE.isActive(),
    },
    {
      label: locals[lang].contexts.scale,
      id: 'SCALE',
      isUpdated: featuresList.SCALE.isNew(),
      isActive: featuresList.SCALE.isActive(),
    },
    {
      label: locals[lang].contexts.colors,
      id: 'COLORS',
      isUpdated: featuresList.COLORS.isNew(),
      isActive: featuresList.COLORS.isActive(),
    },
    {
      label: locals[lang].contexts.themes,
      id: 'THEMES',
      isUpdated: featuresList.THEMES.isNew(),
      isActive: featuresList.THEMES.isActive(),
    },
    {
      label: locals[lang].contexts.export,
      id: 'EXPORT',
      isUpdated: featuresList.EXPORT.isNew(),
      isActive: featuresList.EXPORT.isActive(),
    },
    {
      label: locals[lang].contexts.settings,
      id: 'SETTINGS',
      isUpdated: featuresList.SETTINGS.isNew(),
      isActive: featuresList.SETTINGS.isActive(),
    },
    {
      label: locals[lang].settings.contexts.palette,
      id: 'SETTINGS_PALETTE',
      isUpdated: featuresList.SETTINGS_PALETTE.isNew(),
      isActive: featuresList.SETTINGS_PALETTE.isActive(),
    },
    {
      label: locals[lang].settings.contexts.preferences,
      id: 'SETTINGS_PREFERENCES',
      isUpdated: featuresList.SETTINGS_PREFERENCES.isNew(),
      isActive: featuresList.SETTINGS_PREFERENCES.isActive(),
    },
  ]

  return contexts.filter((context) => {
    return contextList.includes(context.id) && context.isActive
  })
}
