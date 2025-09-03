import express from "express"
const router = express.Router();
import Idea from "../models/Idea.js";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddlewear.js";




//@route              GET /api/ideas
//@description        This will GET all ideas
//@access             Public
//@query              _limit (optional limit for idead returned)
router.get("/", async (req, res, next) => {
    try {
        const limit = parseInt(req.query._limit);
        const query = Idea.find().sort({ createdAt: -1 })


        if (!isNaN(limit)) {
            query.limit(limit)
        }

        const ideas = await query.exec();
        res.json(ideas);

    } catch (err) {
        console.log(err)
        next(err)
    }
})

//@route              GET /api/ideas/:id
//@description        This will GET a single idea
//@access             Public
router.get("/:id", async (req, res, next) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(404)
            throw new Error("Idea not found wrong objectID")
        }

        const idea = await Idea.findById(id);

        if (!idea) {
            res.status(404)
            throw new Error("Idea not found")
        }
        res.json(idea)
    } catch (err) {
        console.log(err)
        next(err)
    }
})



//@route           POST /api/ideas
//@description     Create new idea
//@access          Public (yet, but after adding aut it will be private)
router.post("/", protect, async (req, res, next) => {
    try {
        const { title, summary, description, tags } = req.body;

        if (!title?.trim() || !summary?.trim() || !description?.trim()) {
            res.status(400);
            throw new Error("Title, summary, and description are required")
        }

        const newIdea = new Idea({
            title,
            summary,
            description,
            tags: typeof tags === "string" ? tags.split(', ').map((tag) => tag.trim()).filter(Boolean) : Array.isArray(tags) ? tags : [],
            user: req.user.id,
        })

        const savedIdea = await newIdea.save();
        res.status(201).json(savedIdea)
    } catch (err) {
        console.log("THIS IS THE ERROR:", err)
        next(err)
    }
})


//@route              DELETE /api/ideas/:id
//@description        This will DELETE a single idea
//@access             Public
router.delete("/:id", protect, async (req, res, next) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(404)
            throw new Error("Idea not found wrong objectID")
        }

        const idea = await Idea.findById(id);

        if (!id) {
            res.status(404)
            throw new Error("Idea not found")
        }

        //Check if user owns the idea
        if (idea.user.toString() !== req.user._id.toString()) {
            res.status(403)
            throw new Error("Not authorized to delete this idea")
        }

        await idea.deleteOne();


        res.json({ message: "Idea deleted successfully" })
    } catch (err) {
        console.log(err)
        next(err)
    }
})


//@route              PUT /api/ideas/:id
//@description        This will UPDATE a single idea
//@access             Public
router.put("/:id", protect, async (req, res, next) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(404)
            throw new Error("Idea not found wrong objectID")
        }

        const idea = await Idea.findById(id)

        if (!id) {
            res.status(404)
            throw new Error("Idea not found")
        }

        if (idea.user.toString() !== req.user._id.toString()) {
            res.status(403)
            throw new Error("Not authorized to update this idea")
        }

        const { title, summary, description, tags } = req.body


        if (!title?.trim() || !summary?.trim() || !description?.trim()) {
            res.status(400);
            throw new Error("Title, summary, and description are required")
        }

        idea.title = title
        idea.summary = summary
        idea.description = description
        idea.tags = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : []

        const updatedIdea = await idea.save()

        res.json(updatedIdea)
    } catch (err) {
        console.log(err)
        next(err)
    }
})

export default router;