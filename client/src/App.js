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

  // function onError(err) {
  //   console.error('SSE event error', err);
  // }

  // const fetchStream = async () => {
  //   const response = await fetch(url, {
  //     headers: {
  //       accept: 'text/event-stream',
  //       'content-type': 'text/event-stream',
  //       authorization: 'Bearer abc123',
  //     },
  //   });

  //   const parser = createParser({ onEvent, onError });
  //   const textDecoderStream = new TextDecoderStream();
  //   const reader = response.body.pipeThrough(textDecoderStream).getReader();

  //   const { value, done } = await reader.read();
  //   if (done) parser.reset();
  //   parser.feed(value);
  // };

  const eventStream = () => {
    const eventSource = new EventSource(url);
    eventSource.addEventListener('notification', (event) => {
      onEvent(event);
    });

    eventSource.onerror = (err) => {
      console.error('SSE event error', err);
    };

    return eventSource;
  };

  const fetchSourceStream = () => {
    fetchEventSource(url, {
      method: 'POST',
      headers: {
        accept: 'text/event-stream',
        'content-type': 'text/event-stream',
        authorization: 'Bearer abc123',
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
    // fetchStream();
    fetchSourceStream();
    // const event = eventStream();
    // return () => {
    //   event.close();
    // };
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
