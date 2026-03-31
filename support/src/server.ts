import express from 'express';
import { paymentRouter } from './routes/payments';
import { webhookRouter } from './routes/webhooks';
import { healthRouter } from './routes/health';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/payments', paymentRouter);
app.use('/api/webhooks', webhookRouter);
app.use('/health', healthRouter);

app.listen(PORT, () => {
  console.log(`NovaPay API running on port ${PORT}`);
});
