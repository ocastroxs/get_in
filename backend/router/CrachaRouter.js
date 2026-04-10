import express from 'express';
import CrachaController from '../controllers/CrachaController.js';
const router = express.Router();

router.post('/create', CrachaController.create);
router.post('/read', CrachaController.read);
router.post('/read/:id', CrachaController.readById);
router.post('/read/status/:id', CrachaController.readByStatus);
router.post('/update/:id', CrachaController.update);
router.post('/delete/:id', CrachaController.delete);



export default router;