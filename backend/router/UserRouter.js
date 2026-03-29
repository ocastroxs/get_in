import express from "express";
import UserController from '../controllers/UserController.js';
const router = express.Router();

// Rota para criar um novo usuário (ADM, GERENTE, FUNCIONÁRIO)
router.get('/read', UserController.read);
router.get('/read/id/:id', UserController.readId);
router.get('/read/name/:id', UserController.readName);
router.get('/read/cpf/:id', UserController.readCpf);
router.post('/create', UserController.create);
router.put('/update/:id', UserController.update);
router.delete('/delete/:id', UserController.delete);

export default router;