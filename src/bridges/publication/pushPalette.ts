import type { AppStates } from '../../ui/App'
import { palettesDbTableName, palettesStorageName } from '../../config'
import { supabase } from './authentication'

const pushPalette = async (
  rawData: AppStates,
  isShared = false
): Promise<Partial<AppStates>> => {
  const now = new Date().toISOString()
  const name =
    rawData.name === ''
      ? `${rawData.userSession.userFullName}'s UI COLOR PALETTE`
      : rawData.name

  if (rawData.screenshot !== null) {
    const { error } = await supabase.storage
      .from(palettesStorageName)
      .update(
        `${rawData.userSession.userId}/${rawData.id}.png`,
        rawData.screenshot.buffer,
        {
          contentType: 'image/png',
        }
      )

    if (error) throw error
  }

  const { error } = await supabase
    .from(palettesDbTableName)
    .update([
      {
        name: name,
        description: rawData.description,
        preset: rawData.preset,
        scale: rawData.scale,
        colors: rawData.colors,
        color_space: rawData.colorSpace,
        vision_simulation_mode: rawData.visionSimulationMode,
        themes: rawData.themes,
        view: rawData.view,
        text_colors_theme: rawData.textColorsTheme,
        algorithm_version: rawData.algorithmVersion,
        is_shared: isShared,
        creator_full_name: rawData.userSession.userFullName,
        creator_avatar: rawData.userSession.userAvatar,
        creator_id: rawData.userSession.userId,
        updated_at: rawData.dates.updatedAt,
        published_at: now,
      },
    ])
    .match({ palette_id: rawData.id })

  if (!error) {
    const palettePublicationDetails = {
      name: name,
      dates: {
        publishedAt: now,
        createdAt: rawData.dates.createdAt,
        updatedAt: now,
      },
      publicationStatus: {
        isPublished: true,
        isShared: isShared,
      },
      creatorIdentity: {
        creatorFullName: rawData.userSession.userFullName,
        creatorAvatar: rawData.userSession.userAvatar,
        creatorId: rawData.userSession.userId ?? '',
      },
    }

    parent.postMessage(
      {
        pluginMessage: {
          type: 'UPDATE_GLOBAL',
          data: {
            ...rawData,
            ...palettePublicationDetails,
          },
        },
      },
      '*'
    )

    return palettePublicationDetails
  } else throw error
}

export default pushPalette
