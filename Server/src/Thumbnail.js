import nodePath from 'path';
import fs from 'fs-extra';
import crypto from 'crypto';
import ffmpeg from 'fluent-ffmpeg';

class Thumbnail {
  static createThumbnail(basePath, path, folderType) {
    return new Promise((resolve, reject) => {
      const outPath = this.getFilePath(basePath, path, folderType);
      fs.ensureDir(`${outPath}/../`).then(() => {
        ffmpeg()
          .input(nodePath.normalize(`${basePath}/${path}`))
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
    return this.sha256(nodePath.normalize(`${folderType || 'NORMAL'}/${nodePath.normalize(path)}`));
  }

  static getFilePath(basePath, path, folderType) {
    return nodePath.normalize(`${nodePath.normalize(basePath)}_thumbnail/${Thumbnail.getFileName(nodePath.normalize(path), (folderType || 'NORMAL'))}`);
  }

  static sha256(text) {
    const hash = crypto.createHash('sha256');
    hash.update(text);
    return hash.digest('hex');
  }
}

export default Thumbnail;
