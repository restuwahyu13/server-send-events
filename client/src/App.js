import React, { useEffect, useState } from 'react';
import { createParser } from 'eventsource-parser';
import { ToastContainer, toast, Slide } from 'react-toastify';

function App() {
  const [notification, setNotification] = useState(undefined);

  function onEvent(event) {
    const data = JSON.parse(event.data);
    if (data) {
      setNotification(data);
    }
  }

  const fetchStream = async () => {
    const url = 'http://localhost:4000/notification';
    const response = await fetch(url, {
      headers: {
        Accept: 'text/event-stream',
        Authorization: 'Bearer abc123',
      },
    });

    const parser = createParser({ onEvent });
    const textDecoderStream = new TextDecoderStream();
    const reader = response.body.pipeThrough(textDecoderStream).getReader();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      parser.feed(value);
    }
  };

  useEffect(() => {
    fetchStream();
  }, []);

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
        <strong>Server-Sent Events (SSE)</strong> adalah teknologi di JavaScript
        yang memungkinkan server untuk mengirim pembaruan ke klien (biasanya
        browser) secara satu arah (unidirectional) melalui koneksi HTTP yang
        persisten. Ini berguna ketika Anda ingin server secara otomatis mengirim
        data ke klien tanpa klien perlu terus-menerus meminta (polling) data
        tersebut.
      </p>
    </>
  );
}

export default App;
