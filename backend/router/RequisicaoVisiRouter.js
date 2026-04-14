import express from 'express';
const router = express.Router();

import reqVisi from '../controllers/RequisicaoVisitanteController.js';


router.get('/', reqVisi.Read);
router.get('/:id', reqVisi.ReadById);
router.get('/visi/:id', reqVisi.ReadByVisi);
router.get('/dep/:id', reqVisi.ReadByDepartamento);
router.post('/', reqVisi.Create);
router.put('/:id', reqVisi.Update);
router.delete('/:id', reqVisi.Delete);

export default router;