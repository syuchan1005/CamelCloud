import nodePath from 'path';
import fs from 'fs-extra';
import crypto from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import Util from "./Util";

class Thumbnail {
  static createThumbnail(user, path, folderType) {
    return new Promise((resolve, reject) => {
      const outPath = this.getFilePath(user, path, folderType);
      fs.ensureDir(`${outPath}/../`).then(() => {
        ffmpeg()
          .input(nodePath.normalize(`${Util.dirPath(user, folderType || 'NORMAL')}/${path}`))
          .outputOption('-vframes 1')
          .videoFilter('scale=100:100:force_original_aspect_ratio=decrease,pad=100:100:(ow-iw)/2:(oh-ih)/2:white')
          .format('image2pipe')
          .outputOption('-vcodec png')
          .output(outPath)
          .on('error', reject)
          .on('end', resolve)
          .run();
      });
    });
  }

  static getFileName(path, folderType) {
    return `${this.sha256(nodePath.posix.normalize(`${folderType || 'NORMAL'}/${nodePath.posix.normalize(`/${path}`)}`))}.png`;
  }

  static getFilePath(user, path, folderType) {
    return nodePath.posix.normalize(`${Util.dirPath(user, 'THUMBNAIL')}/${Thumbnail.getFileName(path, (folderType || 'NORMAL'))}`);
  }

  static sha256(text) {
    const hash = crypto.createHash('sha256');
    hash.update(text);
    return hash.digest('hex');
  }
}

export default Thumbnail;
