import express from 'express';
import dotenv from 'dotenv';
import {
  storeChunk,
  updateChunk,
  deleteChunk,
  getChunk,
  listChunks,
  searchHybridHandler,
  getContextForTaskHandler,
  getStats
} from './handlers';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

app.post('/chunks', storeChunk);
app.put('/chunks/:id', updateChunk);
app.delete('/chunks/:id', deleteChunk);
app.get('/chunks/:id', getChunk);
app.post('/chunks/list', listChunks);

app.post('/search/hybrid', searchHybridHandler);
app.post('/context/task', getContextForTaskHandler);

app.get('/stats', getStats);

app.listen(port, () => {
  console.log(`CIC Substrate Service running on port ${port}`);
});
