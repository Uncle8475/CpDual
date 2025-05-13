import express from 'express';
import {RegisterUser,LoginUser, DashboardUser} from "../Controller/userController.js"
import tokenHandler from '../middleware/tokenHandler.js';
const router=express.Router();


router.post("/register",RegisterUser)
router.post("/login",LoginUser)
router.get("/info",tokenHandler,DashboardUser);
export default router;