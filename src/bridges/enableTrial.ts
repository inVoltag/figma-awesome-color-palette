import { trialTime, trialVersion } from '../config'

const enableTrial = async () => {
  const date = new Date().getTime()

  await figma.clientStorage
    .setAsync('trial_start_date', date)
    .then(() => figma.clientStorage.setAsync('trial_version', trialVersion))
    .then(() =>
      figma.ui.postMessage({
        type: 'ENABLE_TRIAL',
        id: figma.currentUser?.id ?? 'NC',
        date: date,
        trialTime: trialTime,
      })
    )
}

export default enableTrial
