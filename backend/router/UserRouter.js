import express from "express";
import UserController from '../controllers/UserController.js';
const router = express.Router();

// Rota para criar um novo usuário (ADM, GERENTE, FUNCIONÁRIO)
router.get('/read', UserController.Read);
router.get('/read/:id', UserController.ReadId);
router.get('/read/name/:id', UserController.ReadName);
router.get('/read/cpf/:id', UserController.ReadCpf);
router.post('/create', UserController.Create);
router.put('/update/:id', UserController.Update);
router.delete('/delete/:id', UserController.Delete);
export default router;