import express from 'express';
import DepartamentoController from '../controllers/DepartamentoController.js';
const router = express.Router();

router.get('/read', DepartamentoController.read);
router.post('/create', DepartamentoController.create);


export default router;