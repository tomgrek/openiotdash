const check = (req, res, next) => {
    if (req.ip === '127.0.0.1' && !req.headers['x-forwarded-for']) {
      return next();
    }
    return res.json({status: 'bad', message: 'No token supplied, you need to be logged in to request this resource'});
};

module.exports = {
  check,
};
