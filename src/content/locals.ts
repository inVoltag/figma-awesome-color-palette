import { trialTime } from '../config'

export const lang = 'en-US'

const glossary: {
  [key: string]: string
} = {
  name: 'UI Color Palette',
  tagline: 'Create, Manage, Deploy & Publish WCAG-compliant color palettes.',
  url: 'www.ui-color-palette.com',
  author: 'Aurélien Grimaud',
  license: 'MIT',
  colorSpace: 'Color space',
  lch: 'LCH',
  oklch: 'OKLCH',
  lab: 'CIELAB',
  oklab: 'OKLAB',
  hsl: 'HSL',
  hsluv: 'HSLuv',
  hex: 'HEX',
  rgb: 'RGB',
  p3: 'P3',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const locals: { [key: string]: any } = {
  'en-US': {
    name: glossary.name,
    tagline: glossary.tagline,
    url: glossary.url,
    global: {
      description: {
        label: 'Description',
        placeholder: "What's it for?",
      },
    },
    shortcuts: {
      documentation: 'Read the documentation',
      feedback: 'Give feedback',
      email: 'Contact support',
      news: "What's new",
      repository: 'Repository',
      discuss: 'Start a discussion',
      request: 'Post a feature request',
      follow: 'Follow us',
    },
    publication: {
      titlePublish: 'Publish palette',
      titleSynchronize: 'Synchronize palette',
      titleSignIn: 'Publish or Synchronize palette',
      message:
        'Publish your palette as a single source of truth and reuse it in other Figma documents (like a component instance). You can also distribute your palettes by sharing them with the community.',
      share: 'Share with the community',
      unshare: 'Remove from the community',
      statusShared: 'Shared',
      statusLocalChanges: 'Local changes',
      statusUptoDate: 'No change',
      statusUnpublished: 'Unpublished',
      statusRemoteChanges: 'Remote changes',
      statusWaiting: 'Pending…',
      statusNotFound: 'Not found',
      publish: 'Publish…',
      unpublish: 'Unpublish',
      synchronize: 'Synchronize…',
      revert: 'Revert',
      detach: 'Detach',
      signIn: 'Sign in to publish',
    },
    relaunch: {
      create: {
        label: `Create a ${glossary.name}`,
        description: 'Scale the selected colors',
      },
      edit: {
        label: `Edit a ${glossary.name}`,
        description: 'Manage, publish, transfer shades',
      },
    },
    contexts: {
      source: 'Source',
      palettes: 'Palettes',
      scale: 'Scale',
      colors: 'Colors',
      themes: 'Themes',
      export: 'Export',
      settings: 'Settings',
    },
    palettes: {
      contexts: {
        page: 'This page',
        self: 'My palettes',
        community: 'Community',
        explore: 'Explore',
        search: 'Search palettes',
      },
      signInFirst: {
        message: 'Find and reuse your published palettes once authentified',
        signIn: 'Sign in to fetch your palettes',
      },
      lazyLoad: {
        search: 'Search palettes…',
        loadMore: 'Load more palettes',
        completeList: 'The palettes list is complete',
      },
      devMode: {
        title: `${glossary.name}s on this page`,
        readyForDev: 'Ready for development',
        vscode: {
          message: `${glossary.name} is also available for Visual Studio Code`,
          cta: 'Try it out',
        },
      },
    },
    source: {
      title: 'Source colors',
      contexts: {
        overview: 'Overview',
        explore: 'Explore',
      },
      canvas: {
        title: 'Selected colors',
        tip: `Select a frame or a shape (filled with color) on the Figma/FigJam canvas, then create a ${glossary.name}.`,
      },
      coolors: {
        title: 'Coolors',
        helper:
          'Coolors is a tool for creating and exploring beautiful color schemes',
        url: {
          label: 'Palette URL',
          placeholder: 'Paste a link－https://coolors.co/…',
          infoMessage: 'The URL must start with "https://coolors.co"',
          errorMessage:
            'The URL must include several hexadecimal codes (e.g. 8ecae6-…-219ebc)',
        },
      },
      realtimeColors: {
        title: 'Realtime Colors',
        helper:
          'Realtime Colors is a tool for visualizing a color palette through a page template',
        url: {
          label: 'Realtime URL',
          placeholder: 'Paste a link－https://www.realtimecolors.com/…',
          infoMessage:
            'The URL must start with "https://www.realtimecolors.com"',
          errorMessage:
            'The URL must include several hexadecimal codes (e.g. 8ecae6-…-219ebc)',
        },
      },
      colourLovers: {
        title: 'Colour Lovers',
        helper:
          'Colour Lovers is a tool for creating and exploring beautiful color schemes',
        filters: {
          label: 'Colors',
          any: 'Any',
          yellow: 'Yellow',
          orange: 'Orange',
          red: 'Red',
          green: 'Green',
          violet: 'Violet',
          blue: 'Blue',
        },
      },
    },
    scale: {
      title: 'Lightness scale',
      keyboardShortcuts: 'Review the keyboard shortcuts',
      howTo: 'How to adjust',
      presets: {
        more: 'More presets',
      },
      shift: {
        chroma: 'Chroma',
      },
      easing: {
        label: 'Distribution easing',
        linear: 'Linear',
        slowEaseIn: 'Ease in Sine',
        slowEaseOut: 'Ease out Sine',
        slowEaseInOut: 'Ease in and out Sine',
        easeIn: 'Ease in',
        easeOut: 'Ease out',
        easeInOut: 'Ease in and out',
        fastEaseIn: 'Ease in Quad',
        fastEaseOut: 'Ease out Quad',
        fastEaseInOut: 'Ease in and out Quad',
      },
      namingConvention: {
        ones: '1 - 10',
        tens: '10 - 100',
        hundreds: '100 - 1000',
      },
      tips: {
        title: 'Keyboard shortcuts',
        custom: 'Adjustment with Custom preset',
        cta: 'Got it',
        move: 'Move every stop',
        distribute: 'Distribute stops based on easing',
        add: 'Add stop',
        select: 'Select stop',
        unselect: 'Unselect stop',
        navPrevious: 'Select previous stop',
        navNext: 'Select next stop',
        shiftLeft: 'Shift left stop',
        shiftRight: 'Shift right stop',
        type: 'Type stop value',
        remove: 'Remove stop',
        distributeAsTooltip: 'Press ⇧ to distribute stops based on easing',
      },
    },
    colors: {
      title: 'Source colors',
      new: 'New UI Color',
      callout: {
        message:
          'Create a source color to split it into multiple shades according to your lightness scale',
        cta: 'Create a source color',
      },
      lch: {
        label: 'LCH',
      },
      hueShifting: {
        label: 'Shift hue',
      },
      chromaShifting: {
        label: 'Shift chroma',
      },
    },
    themes: {
      title: 'Color themes',
      new: 'New UI Theme',
      callout: {
        message:
          'Create color themes to manage multiple color palettes within one single (e.g. light and dark modes)',
        cta: 'Create a color theme',
      },
      paletteBackgroundColor: {
        label: 'Palette background color',
      },
      switchTheme: {
        label: 'Theme',
        defaultTheme: 'None',
      },
    },
    export: {
      format: 'Code',
      preview: 'Preview',
      tokens: {
        label: 'Tokens',
        global: 'Global (JSON)',
        amznStyleDictionary: 'Amazon Style Dictionary (JSON)',
        tokensStudio: 'Tokens Studio (JSON)',
      },
      css: {
        customProperties: 'Custom Properties (CSS)',
      },
      tailwind: {
        config: 'Tailwind (JS)',
      },
      apple: {
        label: 'Apple',
        swiftui: 'SwiftUI (SWIFT)',
        uikit: 'UIKit (SWIFT)',
      },
      android: {
        label: 'Android',
        compose: 'Compose (KT)',
        resources: 'Resources (XML)',
      },
      csv: {
        spreadsheet: 'Spreadsheet (CSV)',
      },
      colorSpace: {
        label: glossary.colorSpace,
        rgb: glossary.rgb,
        hex: glossary.hex,
        hsl: glossary.hsl,
        lch: glossary.lch,
        p3: glossary.p3,
      },
    },
    settings: {
      contexts: {
        palette: 'Palette',
        preferences: 'Preferences',
      },
      global: {
        title: 'Global',
        name: {
          label: 'Name',
          default: 'Untitled',
        },
        description: {
          label: 'Description',
        },
        views: {
          label: 'Layout',
          simple: 'Palette',
          detailed: 'Palette with properties',
          sheet: 'Color sheet',
        },
      },
      contrast: {
        title: 'Contrast management',
        textColors: {
          textLightColor: 'Text light color',
          textDarkColor: 'Text dark color',
          textThemeColorsDescription:
            'The light and dark text colors serve as a reference to simulate contrast and obtain both WCAG 2.1 and APCA scores',
        },
      },
      color: {
        title: 'Color management',
        colorSpace: {
          label: glossary.colorSpace,
          lch: glossary.lch,
          oklch: glossary.oklch,
          lab: glossary.lab,
          oklab: glossary.oklab,
          hsl: glossary.hsl,
          hsluv: glossary.hsluv,
          hex: glossary.hex,
          rgb: glossary.rgb,
          p3: glossary.p3,
        },
        visionSimulationMode: {
          label: 'Vision simulation',
          colorBlind: 'Color blind',
          none: 'None',
          noneAlternative: 'No vision simulation',
          protanomaly: 'Protanomaly (red-weak)',
          protanopia: 'Protanopia (red-blind)',
          deuteranomaly: 'Deuteranomaly (green-weak)',
          deuteranopia: 'Deuteranopia (green-blind)',
          tritanomaly: 'Tritanomaly (blue-weak)',
          tritanopia: 'Tritanopia (blue-blind)',
          achromatomaly: 'Achromatomaly (total color-weak)',
          achromatopsia: 'Achromatopsia (total color-blind)',
        },
        algorithmVersion: {
          label: 'Chroma adjustment',
          v1: 'Linear',
          v2: 'Sinusoidal',
          v3: 'Sinusoidal and hyperbolic',
        },
      },
      preferences: {
        sync: {
          title: 'Synchronization',
          message:
            'A deep synchronization means that the local variables and styles are synchronized with the palette (if a variable or style is not in the palette, it will be removed).',
          palette: {
            label: 'Synchronize your changes in real time with the palette',
          },
          variables: {
            label:
              'Deeply synchronize the local variables in the collection with the palette',
          },
          styles: {
            label:
              'Deeply synchronize the local styles in the document with the palette',
          },
        },
      },
    },
    preview: {
      score: {
        wcag: 'Display WCAG 2.1 scores',
        apca: 'Display APCA scores',
      },
      lock: {
        tag: 'Locked',
        label: 'Lock source colors',
      },
      reset: {
        helper: 'Reset the imported colors',
      },
    },
    report: {
      title: 'Report a bug',
      fullName: {
        label: 'Full name',
        placeholder: 'Optional',
      },
      email: {
        label: 'Email',
        placeholder: 'Optional',
      },
      message: {
        label: 'Message (required)',
        placeholder:
          'Describe the issue you encountered by trying to describe the steps to reproduce it.',
      },
      cta: 'Submit your issue',
    },
    about: {
      title: `About ${glossary.name}`,
      createdBy: 'Created and maintained by ',
      author: glossary.author,
      sourceCode: 'Source code',
      isLicensed: ' is licensed under ',
      license: glossary.license,
    },
    actions: {
      createPalette: `Create a ${glossary.name}`,
      sync: 'Sync',
      createLocalStyles: 'Sync with the local styles',
      createLocalVariables: 'Sync with the local variables',
      publishOrSyncPalette: 'Publish or Synchronize palette',
      publishPalette: 'Publish palette',
      syncPalette: 'Synchronize palette',
      export: `Export the ${glossary.name} to`,
      addToFile: 'Add to file',
      addToSource: 'Add to source',
      duplicate: 'Duplicate',
      sourceColorsNumber: {
        single: '$1 source color',
        several: '$1 source colors',
      },
      colorThemesNumber: {
        single: '$1 color theme',
        several: '$1 color themes',
      },
    },
    highlight: {
      cta: {
        next: 'Next',
        gotIt: 'Got it',
        learnMore: 'Learn more',
      },
    },
    plan: {
      getPro: 'Get Pro',
      tryPro: 'Try Pro',
      pro: 'Pro plan',
      free: 'Free plan',
      trial: 'Trial',
      trialEnded: 'Your trial has ended',
      trialTimeDays: {
        single: '1 day left in this trial',
        plural: '$1 days left in this trial',
      },
      trialTimeHours: {
        single: '1 hour left in this trial',
        plural: '$1 hours left in this trial',
      },
      trialFeedback: 'How was it?',
      dev: 'Developer plan',
    },
    proPlan: {
      welcome: {
        title: `Welcome to ${glossary.name} Pro!`,
        message:
          'This upgrade will unlock a range of tools that enable you to convert your color palette into a color system. We hope you will enjoy the benefits.',
        trial: `This upgrade will unlock a range of tools that enable you to convert your color palette into a color system. We hope you will enjoy the benefits for the next ${trialTime} hours.`,
        cta: "Let's build",
      },
      trial: {
        title: `Would you like to upgrade to the Pro plan within the next ${trialTime} hours?`,
        message:
          'Explore the potential of synchronizing your color palette with variables, exporting it as design tokens, app resources, or for Tokens Studio and simulating a vision impairment.',
        cta: `Enable the ${trialTime}-hour trial`,
        option: 'Purchase',
      },
    },
    user: {
      signIn: 'Sign in',
      signOut: 'Sign out',
      welcomeMessage: 'Hello $[]',
      updateConsent: 'Manage your cookies',
      cookies: {
        welcome: `${glossary.name} uses cookies to understand how you use our plugin and to improve your experience.`,
        vendors:
          'By accepting this, you agree to our use of cookies and other technologies for the purposes listed above.',
        privacyPolicy: 'Read our Privacy Policy',
        customize: 'Customize cookies',
        back: 'Back',
        deny: 'Deny all',
        consent: 'Accept all',
        save: 'Save preferences',
      },
    },
    paletteProperties: {
      sourceColors: 'Source colors',
      closest: 'Closest to source',
      locked: 'Locked source color',
      base: 'Base',
      wcag: 'WCAG 2.1 scores',
      apca: 'APCA scores',
      fontSize: 'Minimum font sizes',
      pass: 'Pass',
      fail: 'Fail',
      unknown: 'Unknown',
      avoid: 'Avoid',
      nonText: 'Non-text',
      spotText: 'Spot text',
      headlines: 'Headlines',
      bodyText: 'Body text',
      contentText: 'Content text',
      fluentText: 'Fluent text',
      provider: 'Provider: ',
      theme: 'Theme: ',
      preset: 'Preset: ',
      colorSpace: 'Color space: ',
      visionSimulation: 'Vision simulation: ',
    },
    vendors: {
      functional: {
        name: 'Functional',
        description: 'Cookies that are necessary for the plugin to work',
      },
      mixpanel: {
        name: 'Mixpanel',
        description:
          'A top analytics platform for tracking and understanding user interactions',
      },
    },
    pending: {
      announcements: 'Pending announcements…',
      primaryAction: '………',
      secondaryAction: '………',
    },
    success: {
      publication: '✓ The palette has been published',
      nonPublication: '✓ The palette has been unpublished',
      synchronization: '✓ The palette has been synchronized',
      detachment: '✓ The palette has been detached',
      report: '✓ Thanks for your report',
      share: '✓ The palette has been shared with the community',
      unshare: '✓ The palette is no longer shared with the community',
    },
    info: {
      createdLocalStyles: {
        none: 'No style created',
        single: 'style created',
        plural: 'styles created',
      },
      updatedLocalStyles: {
        none: 'No style updated',
        single: 'style updated',
        plural: 'styles updated',
      },
      removedLocalStyles: {
        none: 'No style removed',
        single: 'style removed',
        plural: 'styles removed',
      },
      createdVariablesAndModes: {
        noneNone: 'No variable and mode created',
        noneSingle: '1 mode created',
        singleNone: '1 variable created',
        nonePlural: '$1 modes created',
        pluralNone: '$1 variables created',
        singleSingle: '1 variable and mode created',
        singlePlural: '1 variable and $1 modes created',
        pluralSingle: '$1 variables and 1 mode created',
        pluralPlural: '$1 variables and $2 modes created',
      },
      updatedVariablesAndModes: {
        noneNone: 'No variable and mode updated',
        noneSingle: '1 mode updated',
        singleNone: '1 variable updated',
        nonePlural: '$1 modes updated',
        pluralNone: '$1 variables updated',
        singleSingle: '1 variable and mode updated',
        singlePlural: '1 variable and $1 modes updated',
        pluralSingle: '$1 variables and 1 mode updated',
        pluralPlural: '$1 variables and $2 modes updated',
      },
      removedVariablesAndModes: {
        noneNone: 'No variable and mode removed',
        noneSingle: '1 mode removed',
        singleNone: '1 variable removed',
        nonePlural: '$1 modes removed',
        pluralNone: '$1 variables removed',
        singleSingle: '1 variable and mode removed',
        singlePlural: '1 variable and $1 modes removed',
        pluralSingle: '$1 variables and 1 mode removed',
        pluralPlural: '$1 variables and $2 modes removed',
      },
      signOut: '☻ See you later',
      noResult: 'No palette matches your search',
      maxNumberOfSourceColors: 'You cannot add more than $1 source colors',
    },
    warning: {
      tooManyThemesToCreateModes:
        'You must upgrade your plan to create more variable modes',
      emptySourceColors:
        'There is no source color. Add them manually in the Colors section.',
      hslColorSpace:
        'The HSL color space may include the source colors in the palette, but this approach will not ensure consistency in lightness and contrast.',
      unselectedColor:
        'Select a layer that is filled with at least one solid color',
      paletteNameRecommendation: '64 characters max is recommended',
      noPaletteOnCurrrentPage: `There is no ${glossary.name} on the current page. You can ask a member with editing permissions to create.`,
      noSelfPaletteOnRemote:
        'This is quite empty around here! Publish your palette to reuse it across multiple documents.',
      noCommunityPaletteOnRemote:
        'This is quite empty around here! Be the first to share your palette with other users!',
    },
    error: {
      corruption: `✕ Your ${glossary.name} seems corrupted. Do not edit any layer within it.`,
      palettesPicking: '✕ The palettes cannot be picked for now',
      generic: '✕ Something went wrong',
      badResponse: '✕ The response is not valid',
      authentication: '✕ The authentication has failed',
      timeout: '✕ The authentication has been timed out',
      publication: '✕ The palette cannot be published',
      nonPublication: '✕ The palette cannot be unpublished',
      synchronization: '✕ The palette has not been synchronized',
      share: '✕ The palette has not been shared with the community',
      unshare: '✕ The palette has not been removed from the community',
      fetchPalette: 'The palettes cannot be loaded',
      addToFile: '✕ The palette cannot be added',
      noInternetConnection:
        '✕ The connection with the remote palette is unlinked',
      announcements: 'The announcements cannot be loaded',
    },
  },
}
