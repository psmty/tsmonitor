import zlib from 'zlib';
import fs from 'fs';
import * as crypto from 'node:crypto';

const STATIC_PATH = 'cache/crawler/';

const getFilePath = (url: string) => {
  // TODO: change path
  const safeUrl = crypto.createHash('sha256').update(url).digest('hex');
  return `${STATIC_PATH}${safeUrl}.gz`;
}


export const saveToFile = (url: string, text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    zlib.gzip(text, (gzipErr, buffer) => {
      if (gzipErr) {
        reject(gzipErr); // Handle compression error
        return;
      }

      fs.writeFile(getFilePath(url), buffer, (writeErr) => {
        if (writeErr) {
          reject(writeErr); // Handle file write error
        } else {
          resolve(); // Resolve when write is successful
        }
      });
    });
  });
}

export const getFromFile = (url: string): Promise<string>  => {
  return new Promise((resolve, reject) => {
    fs.readFile(getFilePath(url), (readErr, compressedData) => {
      if (readErr) {
        reject(readErr); // Handle file read error
        return;
      }

      zlib.gunzip(compressedData, (unzipErr, buffer) => {
        if (unzipErr) {
          reject(unzipErr); // Handle decompression error
        } else {
          resolve(buffer.toString()); // Resolve with decompressed data
        }
      });
    });
  });
}

export const fileExists = (url: string): Promise<boolean>  => {
  const filePath = getFilePath(url);
  return new Promise((resolve) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      resolve(!err); // If there's no error, the file exists
    });
  });
}

export const getLastEditTime = (url: string): Promise<Date>  => {
  const filePath = getFilePath(url);
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err); // Handle error, e.g., file not found
      } else {
        resolve(stats.mtime); // `mtime` is the last modified time
      }
    });
  });
}

export const deleteFile = (url: string): Promise<void> => {
  const filePath = getFilePath(url);
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err); // Handle error if file deletion fails
      } else {
        resolve(); // Resolve if deletion is successful
      }
    });
  });
}