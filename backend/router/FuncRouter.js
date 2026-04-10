import express from 'express';
const router = express.Router();

import FuncController from '../controllers/FuncController.js';

router.get('/read', FuncController.Read);
router.get('/read/:id', FuncController.ReadId);
router.post('/create', FuncController.Create);
router.put('/update/:id', FuncController.Update);
router.delete('/delete/:id', FuncController.Delete);

export default router;
