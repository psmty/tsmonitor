
const INTERVAL_TIMEOUT = 10 * 1000;

self.onmessage = (event: MessageEvent) => {
  const postMessage = () => {
    self.postMessage('');

    setTimeout(postMessage, INTERVAL_TIMEOUT)
  }

  postMessage();
}
