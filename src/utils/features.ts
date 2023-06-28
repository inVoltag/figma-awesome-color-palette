import type { Features } from './types'

const features: Array<Features> = [
  {
    name: 'ONBOARDING',
    description: 'Onboarding service when the selection is empty',
    isActive: true,
    isPro: false,
    type: 'SERVICE',
    service: [],
  },
  {
    name: 'CREATE',
    description: 'Palette creation service when several colors are selected',
    isActive: true,
    isPro: false,
    type: 'SERVICE',
    service: [],
  },
  {
    name: 'EDIT',
    description: 'Palette configuration service when the palette is selected',
    isActive: true,
    isPro: false,
    type: 'SERVICE',
    service: [],
  },
  {
    name: 'HIGHLIGHT',
    description: 'Release note that highlights the key feature',
    isActive: true,
    isPro: false,
    type: 'DIVISION',
    service: ['ONBOARD', 'CREATE', 'EDIT'],
  },
  {
    name: 'SHORTCUTS',
    description: 'Quick links and access',
    isActive: true,
    isPro: false,
    type: 'DIVISION',
    service: ['ONBOARD', 'CREATE', 'EDIT'],
  },
  {
    name: 'PROPERTIES',
    description: 'Shades information and WCAG scores',
    isActive: true,
    isPro: false,
    type: 'ACTION',
    service: ['CREATE', 'EDIT'],
  },
  {
    name: 'VIEWS',
    description: 'Different types of information arrangement',
    isActive: true,
    isPro: false,
    type: 'DIVISION',
    service: ['CREATE', 'EDIT'],
  },
  {
    name: 'VIEWS_PALETTE',
    description: 'Palette view',
    isActive: true,
    isPro: false,
    type: 'ACTION',
    service: ['CREATE', 'EDIT'],
  },
  {
    name: 'VIEWS_PALETTE_WITH_PROPERTIES',
    description: 'Detailed palette view',
    isActive: true,
    isPro: false,
    type: 'ACTION',
    service: ['CREATE', 'EDIT'],
  },
  {
    name: 'VIEWS_SHEET',
    description: 'Detailed color sheet view',
    isActive: false,
    isPro: false,
    type: 'ACTION',
    service: ['CREATE', 'EDIT'],
  },
  {
    name: 'CREATE_PALETTE',
    description: 'Generate a palette',
    isActive: true,
    isPro: false,
    type: 'ACTION',
    service: ['CREATE'],
  },
  {
    name: 'CREATE_LOCAL_STYLES',
    description: 'Create local styles on the document',
    isActive: true,
    isPro: false,
    type: 'ACTION',
    service: ['EDIT'],
  },
  {
    name: 'UPDATE_LOCAL_STYLES',
    description: 'Update local styles on the document',
    isActive: true,
    isPro: false,
    type: 'ACTION',
    service: ['EDIT'],
  },
  {
    name: 'SCALE',
    description: 'Lightness scale configuration',
    isActive: true,
    isPro: false,
    type: 'CONTEXT',
    service: ['CREATE', 'EDIT'],
  },
  {
    name: 'SCALE_PRESETS',
    description: 'List of existing color systems',
    isActive: true,
    isPro: false,
    type: 'ACTION',
    service: ['CREATE'],
  },
  {
    name: 'SCALE_CONFIGURATION',
    description: 'The lightness stops on a range slider',
    isActive: true,
    isPro: false,
    type: 'ACTION',
    service: ['CREATE', 'EDIT'],
  },
  {
    name: 'SCALE_TIPS',
    description:
      'Tip message to ONBOARD users about how to configure the lightness scale',
    isActive: true,
    isPro: false,
    type: 'DIVISION',
    service: ['CREATE', 'EDIT'],
  },
  {
    name: 'COLORS',
    description: 'Source colors configuration',
    isActive: true,
    isPro: false,
    type: 'CONTEXT',
    service: ['EDIT'],
  },
  {
    name: 'COLORS_HUE_SHIFTING',
    description: 'Color hue shifting number field',
    isActive: true,
    isPro: false,
    type: 'ACTION',
    service: ['EDIT'],
  },
  {
    name: 'EXPORT',
    description: 'Palette export options',
    isActive: true,
    isPro: false,
    type: 'CONTEXT',
    service: ['EDIT'],
  },
  {
    name: 'EXPORT_JSON',
    description: 'Palette export to JSON',
    isActive: true,
    isPro: false,
    type: 'ACTION',
    service: ['EDIT'],
  },
  {
    name: 'EXPORT_CSS',
    description: 'Palette export to CSS',
    isActive: true,
    isPro: false,
    type: 'ACTION',
    service: ['EDIT'],
  },
  {
    name: 'EXPORT_CSV',
    description: 'Palette LCH values export to CSV',
    isActive: true,
    isPro: false,
    type: 'ACTION',
    service: ['EDIT'],
  },
  {
    name: 'EXPORT_SWIFT',
    description:
      'Palette export to SWIFT (macOS, iOS, iPadOS, watchOS, tvOS, visionOS)',
    isActive: false,
    isPro: false,
    type: 'ACTION',
    service: ['EDIT'],
  },
  {
    name: 'EXPORT_XML',
    description: 'Palette export to XML (Android)',
    isActive: false,
    isPro: false,
    type: 'ACTION',
    service: ['EDIT'],
  },
  {
    name: 'SETTINGS',
    description: 'Palette global configuration',
    isActive: true,
    isPro: false,
    type: 'CONTEXT',
    service: ['CREATE', 'EDIT'],
  },
  {
    name: 'SETTINGS_PALETTE_NAME',
    description: 'Palette name text field',
    isActive: true,
    isPro: false,
    type: 'ACTION',
    service: ['CREATE', 'EDIT'],
  },
  {
    name: 'SETTINGS_TEXT_COLORS_THEME',
    description: 'Text colors customization to better check contrast',
    isActive: true,
    isPro: false,
    type: 'ACTION',
    service: ['CREATE', 'EDIT'],
  },
  {
    name: 'SETTINGS_NEW_ALGORITHM',
    description: 'Color shades generation new algorithm toggle',
    isActive: true,
    isPro: false,
    type: 'ACTION',
    service: ['EDIT'],
  },
  {
    name: 'SETTINGS_COLOR_SPACE',
    description: 'Palette global color space',
    isActive: true,
    isPro: false,
    type: 'ACTION',
    service: ['CREATE', 'EDIT'],
  },
  {
    name: 'SETTINGS_COLOR_SPACE_LCH',
    description: 'LCH color space',
    isActive: true,
    isPro: false,
    type: 'ACTION',
    service: ['CREATE', 'EDIT'],
  },
  {
    name: 'SETTINGS_COLOR_SPACE_OKLCH',
    description: 'OKLCH color space',
    isActive: true,
    isPro: false,
    type: 'ACTION',
    service: ['CREATE', 'EDIT'],
  },
  {
    name: 'SETTINGS_COLOR_SPACE_LAB',
    description: 'CIELAB color space',
    isActive: true,
    isPro: false,
    type: 'ACTION',
    service: ['CREATE', 'EDIT'],
  },
  {
    name: 'SETTINGS_COLOR_SPACE_OKLAB',
    description: 'OKLAB color space',
    isActive: true,
    isPro: false,
    type: 'ACTION',
    service: ['CREATE', 'EDIT'],
  },
  {
    name: 'SETTINGS_COLOR_SPACE_HSL',
    description: 'HSL color space',
    isActive: true,
    isPro: false,
    type: 'ACTION',
    service: ['CREATE', 'EDIT'],
  },
  {
    name: 'ABOUT',
    description: 'Additional informations and useful links',
    isActive: true,
    isPro: false,
    type: 'CONTEXT',
    service: ['CREATE', 'EDIT'],
  },
  {
    name: 'GET_PRO_PLAN',
    description: 'Access the subscription to get pro features',
    isActive: false,
    isPro: false,
    type: 'ACTION',
    service: ['ONBOARD', 'CREATE', 'EDIT'],
  },
]

export default features
