import express from 'express';
const router = express.Router();

import AuthController from '../controllers/AuthController.js';

router.post('/criar', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);


export default router;