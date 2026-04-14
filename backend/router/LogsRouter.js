import express from 'express';
const router = express.Router();

import LogsController from '../controllers/LogsController.js';

// Rotas para logs

// Leitura de logs
router.get('/', LogsController.Read);
router.get('/:id', LogsController.ReadById);
router.get('/user/:idUsuario', LogsController.ReadByUser);
router.get('/device/:idDispositivo', LogsController.ReadByDevice);
// Criar Log
router.post('/', LogsController.Create);
// Atualizar Log
router.put('/:id', LogsController.Update);
// Deletar Log
router.delete('/:id', LogsController.Delete);

export default router;
