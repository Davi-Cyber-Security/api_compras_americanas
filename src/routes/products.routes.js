import { Router } from 'express';
import { getAll, getById, create, update, remove } from '../controllers/products.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireModification, requireAdmin } from '../middleware/permission.middleware.js';

const router = Router();

router.get('/', authMiddleware, getAll);
router.get('/:id', authMiddleware, getById);
router.post('/', authMiddleware, requireModification, create);
router.put('/:id', authMiddleware, requireModification, update);
router.delete('/:id', authMiddleware, requireAdmin, remove);

export default router;
