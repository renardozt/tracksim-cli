import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import { downloadDirectory } from './config.js';

export async function downloadRemoteFile(baseUrl, filename) {
  const fileUrl = `${baseUrl}${filename}`;
  const targetFilePath = path.join(downloadDirectory, filename);

  const { data: responseData, headers: responseHeaders } = await axios({ 
    url: fileUrl, 
    method: 'GET', 
    responseType: 'stream',
    family: 4
  });
  
  const totalContentLength = parseInt(responseHeaders['content-length'], 10);
  
  const downloadProgressBar = new cliProgress.SingleBar({
    format: `${chalk.cyan('{bar}')} | {percentage}% | {filename} | {value}/{total} Bytes`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });

  downloadProgressBar.start(totalContentLength, 0, { filename });
  const fileWriterStream = fs.createWriteStream(targetFilePath);

  let currentDownloadedLength = 0;
  responseData.on('data', (chunk) => {
    currentDownloadedLength += chunk.length;
    downloadProgressBar.update(currentDownloadedLength);
  });

  responseData.pipe(fileWriterStream);

  return new Promise((resolve, reject) => {
    fileWriterStream.on('finish', () => { 
      downloadProgressBar.stop(); 
      resolve(); 
    });
    fileWriterStream.on('error', (error) => { 
      downloadProgressBar.stop(); 
      reject(error); 
    });
  });
}

/**
 * Copies a file if it exists, logging success or throwing an error.
 */
export function copyFileIfExists(sourcePath, targetPath, successMessage, errorMessage) {
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(chalk.greenBright(`✓ ${successMessage}`));
  } else if (errorMessage) {
    if (errorMessage.startsWith('Warning:')) {
      console.log(chalk.red(errorMessage));
    } else {
      throw new Error(errorMessage);
    }
  }
}

/**
 * Removes a file or directory if it exists, logging success or warning.
 */
export function removeFileOrDirIfExists(targetPath, successMessage, notFoundMessage) {
  if (fs.existsSync(targetPath)) {
    fs.removeSync(targetPath);
    console.log(chalk.greenBright(`✓ ${successMessage}`));
  } else if (notFoundMessage) {
    console.log(chalk.yellow(`- ${notFoundMessage}`));
  }
}
