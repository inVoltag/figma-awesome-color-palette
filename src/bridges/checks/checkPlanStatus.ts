import { oldTrialTime, trialTime, trialVersion } from '../../utils/config'

const checkPlanStatus = async () => {
  // figma.clientStorage.deleteAsync('trial_start_date')
  // figma.clientStorage.deleteAsync('trial_version')
  // figma.clientStorage.setAsync(
  //   'trial_start_date',
  //   new Date().getTime() - 72 * 60 * 60 * 1000
  // )
  // figma.payments?.setPaymentStatusInDevelopment({
  //   type: 'UNPAID',
  // })

  const trialStartDate: number | undefined =
      await figma.clientStorage.getAsync('trial_start_date'),
    currentTrialVersion: string =
      (await figma.clientStorage.getAsync('trial_version')) ?? trialVersion

  let consumedTime = 0,
    trialStatus = 'UNUSED'

  if (trialStartDate !== undefined) {
    consumedTime = (new Date().getTime() - trialStartDate) / 1000 / (60 * 60)

    if (consumedTime <= oldTrialTime && currentTrialVersion !== trialVersion)
      trialStatus = 'PENDING'
    else if (consumedTime >= trialTime) trialStatus = 'EXPIRED'
    else trialStatus = 'PENDING'
  }

  figma.ui.postMessage({
    type: 'CHECK_PLAN_STATUS',
    data: {
      planStatus:
        trialStatus === 'PENDING' ? 'PAID' : figma.payments?.status.type,
      trialStatus: trialStatus,
      trialRemainingTime: Math.ceil(
        currentTrialVersion !== trialVersion
          ? oldTrialTime - consumedTime
          : trialTime - consumedTime
      ),
    },
  })
}

export default checkPlanStatus
