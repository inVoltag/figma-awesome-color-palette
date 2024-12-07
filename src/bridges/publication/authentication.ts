import { createClient } from '@supabase/supabase-js'

import { lang, locals } from '../../content/locals'
import { authUrl, authWorkerUrl, databaseUrl } from '../../config'
import checkConnectionStatus from '../checks/checkConnectionStatus'

let isAuthenticated = false

export const supabase = createClient(
  databaseUrl,
  process.env.REACT_APP_SUPABASE_PUBLIC_ANON_KEY ?? ''
)

export const signIn = async (disinctId: string) => {
  return new Promise((resolve, reject) => {
    fetch(authWorkerUrl, {
      method: 'GET',
      cache: 'no-cache',
      credentials: 'omit',
      headers: {
        type: 'GET_PASSKEY',
        'distinct-id': disinctId,
      },
    })
      .then((response) => {
        if (response.ok) return response.json()
        else reject(new Error(locals[lang].error.badResponse))
      })
      .then((result) => {
        parent.postMessage(
          {
            pluginMessage: {
              type: 'OPEN_IN_BROWSER',
              url: `${authUrl}/?passkey=${result.passkey}`,
            },
            pluginId: '1063959496693642315',
          },
          'https://www.figma.com'
        )
        const poll = setInterval(async () => {
          fetch(authWorkerUrl, {
            method: 'GET',
            cache: 'no-cache',
            credentials: 'omit',
            headers: {
              type: 'GET_TOKENS',
              'distinct-id': disinctId,
              passkey: result.passkey,
            },
          })
            .then((response) => {
              if (response.body) return response.json()
              else reject(new Error())
            })
            .then(async (result) => {
              //console.log(result)
              if (result.message !== 'No token found') {
                isAuthenticated = true
                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'SET_ITEMS',
                      items: [
                        {
                          key: 'supabase_access_token',
                          value: result.tokens.access_token,
                        },
                        {
                          key: 'supabase_refresh_token',
                          value: result.tokens.refresh_token,
                        },
                      ],
                    },
                    pluginId: '1063959496693642315',
                  },
                  'https://www.figma.com'
                )
                checkConnectionStatus(
                  result.tokens.access_token,
                  result.tokens.refresh_token
                )
                  .then(() => {
                    clearInterval(poll)
                    resolve(result)
                  })
                  .catch((error) => {
                    clearInterval(poll)
                    reject(error)
                  })
              }
            })
            .catch((error) => {
              clearInterval(poll)
              reject(error)
            })
        }, 5000)
        setTimeout(
          () => {
            if (!isAuthenticated) {
              clearInterval(poll)
              reject(new Error('Authentication timeout'))
            }
          },
          2 * 60 * 1000
        )
      })
      .catch((error) => {
        reject(error)
      })
  })
}

export const signOut = async () => {
  parent.postMessage(
    {
      pluginMessage: {
        type: 'OPEN_IN_BROWSER',
        url: `${authUrl}/?action=sign_out`,
      },
      pluginId: '1063959496693642315',
    },
    'https://www.figma.com'
  )
  parent.postMessage(
    {
      pluginMessage: {
        type: 'DELETE_ITEMS',
        items: ['supabase_access_token'],
      },
    },
    '*'
  )
  parent.postMessage(
    {
      pluginMessage: {
        type: 'SIGN_OUT',
      },
    },
    '*'
  )

  setTimeout(async () => {
    await supabase.auth.signOut({
      scope: 'local',
    })
  }, 2000)
}
