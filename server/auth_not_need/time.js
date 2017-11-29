import { Router } from 'express';
import { Datasink } from '../../models';
const sntp = require('sntp');

var router = Router();

// endpoint to provide UTC time from NTP (pool.ntp.org) to any edge device requesting
router.get('/time', async (req, res, next) => {
  const options = {
    timeout: 2000,
  };
  let x = await sntp.time(options);
  return res.json({time: x.referenceTimestamp});
});

export default router;
