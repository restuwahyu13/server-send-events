import React, { useEffect, useState } from 'react';
import { ToastContainer, toast, Slide } from 'react-toastify';
import { fetchEventSource } from '@microsoft/fetch-event-source';

function App() {
  const url = 'http://localhost:4000/notification';
  const [notification, setNotification] = useState(undefined);

  if (notification) {
    toast.success('Received notfication from server', {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'dark',
      transition: Slide,
    });

    setNotification(undefined);
  }

  function onEvent(event) {
    const data = JSON.parse(event.data);
    console.log('[DEBUG]', data);
    if (data) {
      setNotification(data);
    }
  }

  const fetchSourceStream = () => {
    fetchEventSource(url, {
      method: 'POST',
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'POST',
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        accept: 'text/event-stream',
      },
      keepalive: true,
      onmessage(event) {
        onEvent(event);
      },
      onerror(err) {
        console.error('SSE event error', err);
      },
    });
  };

  useEffect(() => {
    fetchSourceStream();
  }, []);

  return (
    <>
      <ToastContainer />
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
  );
}

export default App;
