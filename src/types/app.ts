export interface Feature {
  name: string
  description: string
  isActive: boolean
  isPro: boolean
  isNew: boolean
  type: 'SERVICE' | 'DIVISION' | 'ACTION' | 'CONTEXT'
  service: Array<Service>
}

export type Service = 'CREATE' | 'EDIT' | 'TRANSFER'

export type Context =
  | 'PALETTES'
  | 'PALETTES_SELF'
  | 'PALETTES_COMMUNITY'
  | 'PALETTES_EXPLORE'
  | 'SOURCE'
  | 'SOURCE_OVERVIEW'
  | 'SOURCE_EXPLORE'
  | 'SCALE'
  | 'COLORS'
  | 'THEMES'
  | 'EXPORT'
  | 'SETTINGS'

export type FilterOptions =
  | 'ANY'
  | 'YELLOW'
  | 'ORANGE'
  | 'RED'
  | 'GREEN'
  | 'VIOLET'
  | 'BLUE'

export type EditorType = 'figma' | 'figjam' | 'dev'

export type PlanStatus = 'UNPAID' | 'PAID' | 'NOT_SUPPORTED'

export type TrialStatus = 'UNUSED' | 'PENDING' | 'EXPIRED'

export type FetchStatus =
  | 'UNLOADED'
  | 'LOADING'
  | 'LOADED'
  | 'ERROR'
  | 'EMPTY'
  | 'COMPLETE'
  | 'SIGN_IN_FIRST'
  | 'NO_RESULT'

export type HighlightStatus =
  | 'NO_HIGHLIGHT'
  | 'DISPLAY_HIGHLIGHT_NOTIFICATION'
  | 'DISPLAY_HIGHLIGHT_DIALOG'

export type Language = 'en-US'

export interface windowSize {
  w: number
  h: number
}

export interface HighlightDigest {
  version: string
  status: HighlightStatus
}

export interface SelectedColor {
  id: string | undefined
  position: number
}

export interface HoveredColor extends SelectedColor {
  hasGuideAbove: boolean
  hasGuideBelow: boolean
}

export type PriorityContext =
  | 'EMPTY'
  | 'FEEDBACK'
  | 'TRIAL_FEEDBACK'
  | 'HIGHLIGHT'
  | 'WELCOME_TO_PRO'
  | 'WELCOME_TO_TRIAL'
  | 'TRY'
  | 'ABOUT'
  | 'PUBLICATION'
  | 'REPORT'

export type ThirdParty = 'COOLORS' | 'REALTIME_COLORS' | 'COLOUR_LOVERS'

export type Easing = 'LINEAR' | 'EASE_IN' | 'EASE_OUT' | 'EASE_IN_OUT'

export interface ImportUrl {
  value: string
  state: 'DEFAULT' | 'ERROR' | undefined
  canBeSubmitted: boolean
  helper:
    | {
        type: 'INFO' | 'ERROR'
        message: string
      }
    | undefined
}

export interface ContextItem {
  label: string
  id: Context
  isUpdated: boolean
  isActive: boolean
}
