export function validateUrl(url: string) {
  const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)(:[0-9]{1,5})?(\/.*)?$/;
  return regex.test(url);
}

export function addHttpsProtocol(url: string) {
    if (!/^https?:\/\//i.test(url)) {
        return `https://${url}`;
    }
    return url;
}
