import server from './socket';
import app from './index';

// Express Server Connection
server.listen(app.get('port'), () =>
  console.log(`BillyZip App Listening on PORT ${app.get('port')}`),
);

export default server;
