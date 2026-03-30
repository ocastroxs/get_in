import express from 'express';
import CrachaController from '../controllers/CrachaController.js';
const router = express.Router();

router.post('/create', CrachaController.create);


export default router;