import fs from 'fs';
import * as crypto from 'node:crypto';
import { parseHtmlString, type ParsedData } from '../../services';

const STATIC_PATH = 'cache/crawler/';

const getFilePath = (url: string) => {
  // TODO: change path
  const safeUrl = crypto.createHash('sha256').update(url).digest('hex');
  return `${STATIC_PATH}${safeUrl}.txt`;
}


export const saveToFile = (url: string, text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.writeFile(getFilePath(url), text, (writeErr) => {
      if (writeErr) {
        reject(writeErr); // Handle file write error
      } else {
        resolve(); // Resolve when write is successful
      }
    });
  });
}

export const getFromFile = (url: string): Promise<ParsedData|null>  => {
  const filePath = getFilePath(url);
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', async (readErr, text) => {
      if (readErr) {
        reject(readErr); // Handle file read error
        return;
      }
      const data = parseHtmlString(text);
      try {
        const lastEditedSite = await getLastEditTime(filePath);
        data.updatedAt = lastEditedSite.toISOString();
      } catch (e) {
        //
      }
      resolve(data); // Resolve with decompressed data
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

const getLastEditTime = (filePath: string): Promise<Date>  => {
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