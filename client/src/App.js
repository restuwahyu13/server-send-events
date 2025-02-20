import React, { useEffect, useState } from 'react'
import { Slide, ToastContainer, toast } from 'react-toastify'

import { fetchEventSource } from '@microsoft/fetch-event-source'

function App() {
  const url = 'http://localhost:4000'
  const [notification, setNotification] = useState(undefined)
  const [login, setLogin] = useState(undefined)
  const [token, setToken] = useState(undefined)

  if (notification) {
    const message = notification?.content?.description || notification?.error

    if (notification?.type === 'info') {
      toast.success(message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
        transition: Slide,
      })
    } else if (notification?.type === 'error') {
      toast.error(message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
        transition: Slide,
      })
    }

    setNotification(undefined)
  }

  function onEvent(event, feTokenId) {
    const res = JSON.parse(event.data)
    const beTokenId = res?.data?.metadata?.token

    console.log('[DEBUG DATA]', res?.data)
    console.log(`[DEBUG MATCH TOKEN]: ${beTokenId} === ${feTokenId}`, beTokenId === feTokenId)

    if (beTokenId === feTokenId) {
      setNotification(res?.data)
    }
  }

  const fetchSourceStream = (accessToken) => {
    const feTokenId = token.substring(token?.length - 10, token?.length)

    fetchEventSource(`${url}/notification/${feTokenId}`, {
      method: 'POST',
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'POST',
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        'accept': 'text/event-stream',
        'authorization': `Bearer ${accessToken}`,
      },
      keepalive: true,
      onmessage(event) {
        onEvent(event, feTokenId)
      },
      onerror(err) {
        console.error('SSE event error', err)
      },
    })
  }

  const generateToken = async () => {
    try {
      const email = prompt('Masukan email ?')
      const password = prompt('Masukan password ?')

      setLogin({ email: email, password: password })
      console.log('[DEBUG LOGIN BODY]', login)

      if (login) {
        const response = await fetch(`${url}/v1/auth/login`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(login),
        })

        const result = await response.json()
        console.log('[DEBUG LOGIN]', result)

        localStorage.setItem('accessToken', result?.data?.accessToken)
        setToken(result?.data?.accessToken)
      }
    } catch (e) {
      console.error('[ERROR LOGIN]', e)
    }
  }

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')

    if (accessToken) {
      console.log('[DEBUG ACCESS TOKEN]', accessToken)
      setToken(accessToken)
    }

    if (token) {
      fetchSourceStream(token)
    }
  }, [token])

  return (
    <>
      <ToastContainer />
      <div style={{ display: 'flex', flexDirection: 'row', padding: '5px' }}>
        <button onClick={generateToken}>Generate Token</button>
        <p style={{ padding: '10px' }}>Access Token: {token}</p>
      </div>
      <h1
        style={{
          textAlign: 'center',
          fontSize: '3em',
          position: 'relative',
          top: 50,
          fontWeight: 'bold',
        }}
      >
        Server Send Events With Backend Server
      </h1>
      <p
        style={{
          textAlign: 'center',
          fontSize: '1.2em',
          position: 'relative',
          top: 50,
          fontWeight: 'lighter',
          wordBreak: 'break-word',
        }}
      >
        <strong>Server-Sent Events (SSE)</strong> adalah teknologi di JavaScript yang memungkinkan server untuk mengirim pembaruan ke klien (biasanya
        browser) secara satu arah (unidirectional) melalui koneksi HTTP yang persisten. Ini berguna ketika Anda ingin server secara otomatis mengirim
        data ke klien tanpa klien perlu terus-menerus meminta (polling) data tersebut.
      </p>
    </>
  )
}

export default App
