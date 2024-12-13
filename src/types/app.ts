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
  | 'SETTINGS_PALETTE'
  | 'SETTINGS_PREFERENCES'

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

export type PriorityContext =
  | 'EMPTY'
  | 'HIGHLIGHT'
  | 'WELCOME_TO_PRO'
  | 'WELCOME_TO_TRIAL'
  | 'TRY'
  | 'ABOUT'
  | 'PUBLICATION'
  | 'REPORT'

export type ThirdParty = 'COOLORS' | 'REALTIME_COLORS' | 'COLOUR_LOVERS'

export type NamingConvention = 'ONES' | 'TENS' | 'HUNDREDS'

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
