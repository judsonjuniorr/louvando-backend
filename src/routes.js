import { Router } from 'express';
import Brute from 'express-brute';
import BruteRedis from 'express-brute-redis';
import multer from 'multer';
import multerConfig from './config/multer';

// Middlewares
import authMiddleware from './app/middlewares/auth';
import adminMiddleware from './app/middlewares/admin';

// Controllers
import FileController from './app/controllers/FileController';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import CollectionController from './app/controllers/CollectionController';
import ThemeController from './app/controllers/ThemeController';
import PraiseController from './app/controllers/PraiseController';
import LastPraiseController from './app/controllers/LastPraiseController';
import SearchPraiseController from './app/controllers/SearchPraiseController';

// Validators
import ValidateUserStore from './app/validations/UserStore';
import ValidateUserUpdate from './app/validations/UserUpdate';
import ValidateSessionStore from './app/validations/SessionStore';
import ValidateCollectionStore from './app/validations/CollectionStore';
import ValidateCollectionUpdate from './app/validations/CollectionUpdate';
import ValidateThemeStore from './app/validations/ThemeStore';
import ValidateThemeUpdate from './app/validations/ThemeUpdate';
import ValidatePraiseStore from './app/validations/PraiseStore';
import ValidatePraiseUpdate from './app/validations/PraiseUpdate';

const routes = new Router();
const upload = multer(multerConfig);

const bruteStore = new BruteRedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});
const bruteForce = new Brute(
  bruteStore,
  process.env.NODE_ENV === 'development' ? { freeRetries: 999 } : {}
);

routes.post(
  '/users',
  bruteForce.prevent,
  ValidateUserStore,
  UserController.store
);
routes.post(
  '/sessions',
  bruteForce.prevent,
  ValidateSessionStore,
  SessionController.store
);

routes.use(authMiddleware);

routes.get('/collections', CollectionController.index);
routes.get('/collections/:id', CollectionController.show);
routes.get('/themes', ThemeController.index);
routes.get('/themes/:id', ThemeController.show);
routes.get('/praises', PraiseController.index);
routes.get('/praises/last', LastPraiseController.index);
routes.get('/praises/search', SearchPraiseController.index);
routes.get('/praises/:id', PraiseController.show);

routes.post('/files', upload.single('file'), FileController.store);

routes.put(
  '/users/:id?',
  bruteForce.prevent,
  ValidateUserUpdate,
  UserController.update
);

routes.use(adminMiddleware);

routes.post(
  '/collections',
  ValidateCollectionStore,
  CollectionController.store
);
routes.put(
  '/collections/:id',
  ValidateCollectionUpdate,
  CollectionController.update
);
routes.delete('/collections/:id', CollectionController.delete);

routes.post('/themes', ValidateThemeStore, ThemeController.store);
routes.put('/themes/:id', ValidateThemeUpdate, ThemeController.update);
routes.delete('/themes/:id', ThemeController.delete);

routes.get('/users', UserController.index);
routes.get('/users/:id', UserController.show);

routes.post('/praises', ValidatePraiseStore, PraiseController.store);
routes.put('/praises/:id', ValidatePraiseUpdate, PraiseController.update);
routes.delete('/praises/:id', PraiseController.delete);

export default routes;
