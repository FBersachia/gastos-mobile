import 'dotenv/config';

import { createApp } from './server.js';

const port = Number(process.env.PORT ?? 3000);
const app = createApp();

app.listen(port, () => {
  console.log(`Premium backend listening on port ${port}`);
});
