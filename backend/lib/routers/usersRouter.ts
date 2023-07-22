import {Router} from "express";
import authUserController from "../controllers/authUserController";
import loginPageController from "../controllers/loginPageController";

const usersRouter = Router()
usersRouter.post('/auth', authUserController)
usersRouter.get('/login', loginPageController)
export default usersRouter