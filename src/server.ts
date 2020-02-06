import app from './index';

// Express Server Connection
const server = app.listen(app.get('port'), () =>
  console.log(`BillyZip App Listening on PORT ${app.get('port')}`),
);

export default server;
