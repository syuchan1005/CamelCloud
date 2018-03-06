import path from 'path';
import Config from '../../config';

class Util {
  static dirPath(user, folderType) {
    const userDir = typeof user === 'object' ? user.dirName : user;
    return path.posix.normalize(`../${Config.storage}/${userDir}/${folderType || ''}`);
  }
}

export default Util;
