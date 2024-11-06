import zlib from 'zlib';
import fs from 'fs';
import * as crypto from 'node:crypto';

export abstract class SiteFileReaderService {
  private static STATIC_PATH = 'cache/crawler/';

  private static getFilePath(url: string) {
    // TODO: change path
    const safeUrl = crypto.createHash('sha256').update(url).digest('hex');
    return `${SiteFileReaderService.STATIC_PATH}${safeUrl}.gz`;
  }

  public static saveToFile(url: string, text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      zlib.gzip(text, (gzipErr, buffer) => {
        if (gzipErr) {
          reject(gzipErr); // Handle compression error
          return;
        }

        fs.writeFile(SiteFileReaderService.getFilePath(url), buffer, (writeErr) => {
          if (writeErr) {
            reject(writeErr); // Handle file write error
          } else {
            resolve(); // Resolve when write is successful
          }
        });
      });
    });
  }

  public static getFromFile(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(SiteFileReaderService.getFilePath(url), (readErr, compressedData) => {
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

  public static fileExists(url: string): Promise<boolean> {
    const filePath = this.getFilePath(url);
    return new Promise((resolve) => {
      fs.access(filePath, fs.constants.F_OK, (err) => {
        resolve(!err); // If there's no error, the file exists
      });
    });
  }

  public static getLastEditTime(url: string): Promise<Date> {
    const filePath = this.getFilePath(url);
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

  public static deleteFile(url: string): Promise<void> {
    const filePath = this.getFilePath(url);
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
}
