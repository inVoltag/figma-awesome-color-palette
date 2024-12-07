import type { AppStates } from '../../ui/App'
import { palettesDbTableName, palettesStorageName } from '../../config'
import { supabase } from './authentication'

const unpublishPalette = async (
  rawData: Partial<AppStates>,
  isRemote = false
): Promise<Partial<AppStates>> => {
  if (rawData.screenshot !== null || !isRemote) {
    const { error } = await supabase.storage
      .from(palettesStorageName)
      .remove([`${rawData.userSession?.userId}/${rawData.id}.png`])

    if (error) throw error
  }

  const { error } = await supabase
    .from(palettesDbTableName)
    .delete()
    .match({ palette_id: rawData.id })

  if (!error) {
    const palettePublicationDetails = {
      id: '',
      dates: {
        publishedAt: '',
        createdAt: rawData.dates?.createdAt ?? '',
        updatedAt: rawData.dates?.updatedAt ?? '',
      },
      publicationStatus: {
        isPublished: false,
        isShared: false,
      },
      creatorIdentity: {
        creatorFullName: '',
        creatorAvatar: '',
        creatorId: '',
      },
    }

    if (!isRemote) {
      parent.postMessage(
        {
          pluginMessage: {
            type: 'SET_DATA',
            items: [
              {
                key: 'id',
                value: palettePublicationDetails.id,
              },
            ],
          },
        },
        '*'
      )
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
    }

    return palettePublicationDetails
  } else throw error
}

export default unpublishPalette
