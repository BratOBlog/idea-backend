import express from "express"
import User from "../models/User.js"

const router = express.Router();


//@route            POST api/auth/register
//@description      Register new user
//@access           public

router.post('/register', async (req, res, next) => {

    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400);
            throw new Error("Name, email, password are mandatory for registration")
        }


        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            res.status(400);
            throw new Error("User already exists")
        }


        const user = await User.create({ name, email, password })
        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email
        })
    } catch (err) {
        console.log(err)
        next(err)
    }
})


export default router;