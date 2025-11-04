import express from 'express';
import protect from '../middlewares/auth';
const router=express.Router();
router.get("/profile",protect);