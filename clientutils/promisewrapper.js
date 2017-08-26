export default (prom) => {
  return new Promise((resolve, reject) => {
    prom.then(r => resolve(r)).catch(e => resolve(e));
  });
};
