import { Router } from 'express';
import * as testController from '../controllers/test';
export const testRouter = Router();

testRouter.get('/', testController.GetTest);
