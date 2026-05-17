import { Router } from 'express';

export const paymentRouter = Router();

paymentRouter.get('/', (_req, res) => {
  res.json({ ok: true, resource: 'payments' });
});
