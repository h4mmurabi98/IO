import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import SupporterOffer from "../models/SupporterOffer";
import User from "../models/User";
import auth, { AuthRequest } from "../middleware/auth";
import { calcLevel } from "../utils/levels";

const router = Router();

type PopulatedUser = {
  _id: unknown;
  username: string;
  level: number;
  points: number;
  avatar: string;
};

const formatOffer = (o: any) => ({
  id: String(o._id),
  title: o.title,
  description: o.description,
  categories: o.categories,
  location: o.location,
  offerDate: o.offerDate ?? null,
  difficulty: o.difficulty,
  durationMinutes: o.durationMinutes,
  pointValue: o.pointValue,
  status: o.status,
  createdAt: o.createdAt,
  createdBy: {
    id: String((o.createdBy as PopulatedUser)._id),
    username: (o.createdBy as PopulatedUser).username,
    level: (o.createdBy as PopulatedUser).level,
    points: (o.createdBy as PopulatedUser).points,
    avatar: (o.createdBy as PopulatedUser).avatar,
  },
  assignedTo: o.assignedTo
    ? {
        id: String((o.assignedTo as any)._id),
        username: (o.assignedTo as any).username,
      }
    : null,
  acceptMessage: o.acceptMessage ?? "",
});

router.get("/", async (_req: Request, res: Response) => {
  try {
    const offers = await SupporterOffer.find({ status: "active" })
      .sort({ createdAt: -1 })
      .populate("createdBy", "username level points avatar")
      .populate("assignedTo", "username");

    res.json(offers.map(formatOffer));
  } catch {
    res.status(500).json({ message: "Serverfehler" });
  }
});

router.post("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      categories,
      location,
      difficulty,
      durationMinutes,
    } = req.body;

    if (!title || !description) {
      res
        .status(400)
        .json({ message: "Titel und Beschreibung sind erforderlich" });
      return;
    }
    if (!location || !String(location).trim()) {
      res.status(400).json({ message: "Ort ist erforderlich" });
      return;
    }
    if (!difficulty || difficulty < 1 || difficulty > 5) {
      res
        .status(400)
        .json({ message: "Schwierigkeit muss zwischen 1 und 5 liegen" });
      return;
    }
    if (!durationMinutes || durationMinutes < 1) {
      res
        .status(400)
        .json({ message: "Dauer muss mindestens 1 Minute betragen" });
      return;
    }

    const offer = await SupporterOffer.create({
      title,
      description,
      categories: Array.isArray(categories) ? categories : [],
      location: location || "",
      offerDate: req.body.offerDate ? new Date(req.body.offerDate) : null,
      difficulty,
      durationMinutes,
      createdBy: req.userId,
    });

    await offer.populate("createdBy", "username level points avatar");

    res.status(201).json(formatOffer(offer));
  } catch {
    res.status(500).json({ message: "Serverfehler" });
  }
});

router.put("/:id/assign", auth, async (req: AuthRequest, res: Response) => {
  try {
    const offer = await SupporterOffer.findById(req.params.id);
    if (!offer) {
      res.status(404).json({ message: "Hilfsangebot nicht gefunden" });
      return;
    }
    if (String(offer.createdBy) === req.userId) {
      res
        .status(400)
        .json({ message: "Eigene Angebote können nicht angenommen werden" });
      return;
    }
    if (offer.assignedTo) {
      res.status(400).json({ message: "Angebot wurde bereits angenommen" });
      return;
    }
    if (offer.status === "done") {
      res.status(400).json({ message: "Angebot ist bereits abgeschlossen" });
      return;
    }

    offer.assignedTo = new mongoose.Types.ObjectId(req.userId);
    offer.acceptMessage =
      typeof req.body.message === "string" ? req.body.message.trim() : "";
    await offer.save();

    res.json({ message: "Hilfsangebot angenommen" });
  } catch {
    res.status(500).json({ message: "Serverfehler" });
  }
});

router.put("/:id/done", auth, async (req: AuthRequest, res: Response) => {
  try {
    const offer = await SupporterOffer.findById(req.params.id);
    if (!offer) {
      res.status(404).json({ message: "Hilfsangebot nicht gefunden" });
      return;
    }
    if (String(offer.createdBy) !== req.userId) {
      res.status(403).json({ message: "Keine Berechtigung" });
      return;
    }
    if (offer.status === "done") {
      res.status(400).json({ message: "Bereits abgeschlossen" });
      return;
    }

    offer.status = "done";
    await offer.save();

    const pointsEarned = offer.pointValue;
    const user = await User.findById(req.userId);
    if (user) {
      user.points += pointsEarned;
      user.level = calcLevel(user.points);
      await user.save();
      res.json({
        message: "Hilfsangebot abgeschlossen",
        pointsEarned,
        newPoints: user.points,
      });
      return;
    }

    res.json({ message: "Hilfsangebot abgeschlossen" });
  } catch {
    res.status(500).json({ message: "Serverfehler" });
  }
});

router.delete("/:id", auth, async (req: AuthRequest, res: Response) => {
  try {
    const offer = await SupporterOffer.findById(req.params.id);
    if (!offer) {
      res.status(404).json({ message: "Hilfsangebot nicht gefunden" });
      return;
    }
    if (String(offer.createdBy) !== req.userId) {
      res.status(403).json({ message: "Keine Berechtigung" });
      return;
    }
    await offer.deleteOne();
    res.json({ message: "Hilfsangebot gelöscht" });
  } catch {
    res.status(500).json({ message: "Serverfehler" });
  }
});

export default router;
