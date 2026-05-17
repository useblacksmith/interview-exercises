import { Router } from 'express';

export const webhookRouter = Router();

webhookRouter.post('/', (_req, res) => {
  res.status(501).json({ ok: false, message: 'Not implemented' });
});
