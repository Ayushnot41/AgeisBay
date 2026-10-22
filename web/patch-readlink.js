const fs = require('fs');

const origReadlink = fs.readlink;
const origReadlinkSync = fs.readlinkSync;

fs.readlinkSync = function(path, options) {
  try {
    return origReadlinkSync.call(fs, path, options);
  } catch (err) {
    if (err && err.code === 'EISDIR') {
      err.code = 'EINVAL';
    }
    throw err;
  }
};

fs.readlink = function(path, options, callback) {
  const cb = typeof options === 'function' ? options : callback;
  const opt = typeof options === 'function' ? undefined : options;

  return origReadlink.call(fs, path, opt, (err, linkString) => {
    if (err && err.code === 'EISDIR') {
      err.code = 'EINVAL';
    }
    if (cb) cb(err, linkString);
  });
};
