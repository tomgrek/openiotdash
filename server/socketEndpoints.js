let _io;
import { Datasink } from '../models';

const subscribeUser = (socket, userId) => {
  // TODO: Right now it's subscribing the client to all their datasinks, should just be the ones used in the dash they have open
  // (so move this code into dash/_id and show/_id rather than Header)
  Datasink.findAll({ attributes: [
      'title',
    ],
    where: {
      user: userId,
    },
  }).then(dss => {
    for (let sink of dss) {
      socket.join(sink.title);
    }
  }).catch(console.log);
};

const sendMsg = (toChannel, msg) => {
  _io.to(toChannel).emit(toChannel, msg);
};

const init = io => _io = io;

module.exports = {
  sendMsg,
  init,
  subscribeUser,
};
