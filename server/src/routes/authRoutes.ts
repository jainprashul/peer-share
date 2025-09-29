import { Router } from "express";
import { login, profile, registerUser } from "../managers/authController";
import passport from "passport";


const router = Router();

//REgister new user
router.post("/register", registerUser);

router.post("/login", login);

//Google Oauth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get("/cb/google", passport.authenticate("google", { failureRedirect: "/", session: false }), login);

//profile 
router.get("/profile", passport.authenticate("jwt", { session: false }), profile);


export default router;
