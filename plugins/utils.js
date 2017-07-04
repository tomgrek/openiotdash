module.exports = {
  getUuid: () => {
    return (new Date().getTime()).toString(36);
  },
};
