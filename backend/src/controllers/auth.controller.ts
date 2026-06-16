// controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { pool } from "../db";
import { registerSchema } from "../Validators/auth.validator";
export const register = async (req: Request, res: Response) => {
  try {
    // 1. Validation des données
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Données invalides",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { nom, prenom, email, mot_de_passe } = parsed.data;

    // 2. Vérifier que l'email n'existe pas déjà
    const [existing]: any = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Cette adresse email est déjà associée à un compte.",
      });
    }

    // 3. Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    // 4. Générer un token de vérification email
    const tokenVerification = crypto.randomBytes(32).toString("hex");

    // 5. Insérer l'utilisateur
    const [result]: any = await pool.query(
      `INSERT INTO users (nom, prenom, email, mot_de_passe, token_verification)
       VALUES (?, ?, ?, ?, ?)`,
      [nom, prenom, email, hashedPassword, tokenVerification],
    );

    const userId = result.insertId;

    // 6. Attribuer le rôle par défaut "membre_vision"
    await pool.query(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT ?, id FROM roles WHERE nom = 'membre_vision'`,
      [userId],
    );

    // 7. TODO : envoyer l'email de vérification (étape suivante)

    return res.status(201).json({
      message:
        "Compte créé avec succès. Vérifiez votre email pour activer votre compte.",
      userId,
    });
  } catch (error) {
    console.error("Erreur register:", error);
    return res
      .status(500)
      .json({ message: "Erreur serveur, veuillez réessayer." });
  }
};
