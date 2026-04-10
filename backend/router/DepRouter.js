import express from 'express';
import DepartamentoController from '../controllers/DepartamentoController.js';
const router = express.Router();

router.get('/', DepartamentoController.read);
router.post('/', DepartamentoController.create);


export default router;