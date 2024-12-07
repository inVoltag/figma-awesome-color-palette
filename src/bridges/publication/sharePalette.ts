import { palettesDbTableName } from '../../config'
import { supabase } from './authentication'

const sharePalette = async (id: string, isShared: boolean): Promise<void> => {
  const now = new Date().toISOString()

  const { error } = await supabase
    .from(palettesDbTableName)
    .update([
      {
        is_shared: isShared,
        published_at: now,
        updated_at: now,
      },
    ])
    .match({ palette_id: id })

  if (!error) return
  else throw error
}

export default sharePalette
