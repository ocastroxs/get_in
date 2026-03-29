import express from "express";
import UserController from '../controllers/UserController.js';
const router = express.Router();

// Rota para criar um novo usuário (ADM, GERENTE, FUNCIONÁRIO)
router.get('/read', UserController.read);
router.post('/create', UserController.create);
// router.put('/update', UserController.update);
// router.delete('/delete', UserController.delete);

export default router;