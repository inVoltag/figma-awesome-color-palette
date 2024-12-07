import { lang, locals } from '../content/locals'
import { Context } from '../types/app'
import features from '../config'

export const setContexts = (contextList: Array<Context>) => {
  const contexts: Array<{
    label: string
    id: Context
    isUpdated: boolean
    isActive: boolean
  }> = [
    {
      label: locals[lang].contexts.palettes,
      id: 'PALETTES',
      isUpdated:
        features.find((feature) => feature.name === 'PALETTES')?.isNew ?? false,
      isActive:
        features.find((feature) => feature.name === 'PALETTES')?.isActive ??
        false,
    },
    {
      label: locals[lang].palettes.contexts.self,
      id: 'PALETTES_SELF',
      isUpdated:
        features.find((feature) => feature.name === 'PALETTES_SELF')?.isNew ??
        false,
      isActive:
        features.find((feature) => feature.name === 'PALETTES_SELF')
          ?.isActive ?? false,
    },
    {
      label: locals[lang].palettes.contexts.community,
      id: 'PALETTES_COMMUNITY',
      isUpdated:
        features.find((feature) => feature.name === 'PALETTES_COMMUNITY')
          ?.isNew ?? false,
      isActive:
        features.find((feature) => feature.name === 'PALETTES_COMMUNITY')
          ?.isActive ?? false,
    },
    {
      label: locals[lang].contexts.source,
      id: 'SOURCE',
      isUpdated:
        features.find((feature) => feature.name === 'SOURCE')?.isNew ?? false,
      isActive:
        features.find((feature) => feature.name === 'SOURCE')?.isActive ??
        false,
    },
    {
      label: locals[lang].source.contexts.overview,
      id: 'SOURCE_OVERVIEW',
      isUpdated:
        features.find((feature) => feature.name === 'SOURCE_OVERVIEW')?.isNew ??
        false,
      isActive:
        features.find((feature) => feature.name === 'SOURCE_OVERVIEW')
          ?.isActive ?? false,
    },
    {
      label: locals[lang].source.contexts.explore,
      id: 'SOURCE_EXPLORE',
      isUpdated:
        features.find((feature) => feature.name === 'SOURCE_EXPLORE')?.isNew ??
        false,
      isActive:
        features.find((feature) => feature.name === 'SOURCE_EXPLORE')
          ?.isActive ?? false,
    },
    {
      label: locals[lang].contexts.scale,
      id: 'SCALE',
      isUpdated:
        features.find((feature) => feature.name === 'SCALE')?.isNew ?? false,
      isActive:
        features.find((feature) => feature.name === 'SCALE')?.isActive ?? false,
    },
    {
      label: locals[lang].contexts.colors,
      id: 'COLORS',
      isUpdated:
        features.find((feature) => feature.name === 'COLORS')?.isNew ?? false,
      isActive:
        features.find((feature) => feature.name === 'COLORS')?.isActive ??
        false,
    },
    {
      label: locals[lang].contexts.themes,
      id: 'THEMES',
      isUpdated:
        features.find((feature) => feature.name === 'THEMES')?.isNew ?? false,
      isActive:
        features.find((feature) => feature.name === 'THEMES')?.isActive ??
        false,
    },
    {
      label: locals[lang].contexts.export,
      id: 'EXPORT',
      isUpdated:
        features.find((feature) => feature.name === 'EXPORT')?.isNew ?? false,
      isActive:
        features.find((feature) => feature.name === 'EXPORT')?.isActive ??
        false,
    },
    {
      label: locals[lang].contexts.settings,
      id: 'SETTINGS',
      isUpdated:
        features.find((feature) => feature.name === 'SETTINGS')?.isNew ?? false,
      isActive:
        features.find((feature) => feature.name === 'SETTINGS')?.isActive ??
        false,
    },
  ]

  return contexts.filter((context) => {
    return contextList.includes(context.id) && context.isActive
  })
}
