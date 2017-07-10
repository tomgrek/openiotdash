import crypto from 'crypto';

module.exports = {
  getUuid: () => {
    return (new Date().getTime()).toString(36);
  },
  getKey: (hash) => {
    return crypto.createHash('md5').update(hash).digest('hex').slice(2,16);
  },
};
