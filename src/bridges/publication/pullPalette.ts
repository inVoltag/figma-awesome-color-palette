import { palettesDbTableName } from '../../config'
import type { AppStates } from '../../ui/App'
import { supabase } from './authentication'

const pullPalette = async (rawData: AppStates): Promise<Partial<AppStates>> => {
  const { data, error } = await supabase
    .from(palettesDbTableName)
    .select('*')
    .eq('palette_id', rawData.id)

  if (!error && data.length === 1) {
    const palettePublicationDetails: Partial<AppStates> = {
      name: data[0].name,
      description: data[0].description,
      preset: data[0].preset,
      scale: data[0].scale,
      shift: data[0].shift,
      areSourceColorsLocked: data[0].are_source_colors_locked,
      colors: data[0].colors,
      colorSpace: data[0].color_space,
      visionSimulationMode: data[0].vision_simulation_mode,
      themes: data[0].themes,
      view: data[0].view,
      textColorsTheme: data[0].text_colors_theme,
      algorithmVersion: data[0].algorithm_version,
      dates: {
        publishedAt: data[0].published_at,
        createdAt: data[0].created_at,
        updatedAt: data[0].updated_at,
      },
      publicationStatus: {
        isPublished: true,
        isShared: data[0].is_shared,
      },
      creatorIdentity: {
        creatorFullName: data[0].creator_full_name,
        creatorAvatar: data[0].creator_avatar,
        creatorId: data[0].creator_id,
      },
    }

    parent.postMessage(
      {
        pluginMessage: {
          type: 'UPDATE_GLOBAL',
          data: palettePublicationDetails,
        },
      },
      '*'
    )

    return palettePublicationDetails
  } else throw error
}

export default pullPalette
