// controllers/auth.controller.ts — ajoute cette fonction
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { pool } from "../db";
import { registerSchema, loginSchema } from "../Validators/auth.validator";
import jwt from 'jsonwebtoken';


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

    const { nom, prenom, mot_de_passe } = parsed.data;
    const email = parsed.data.email.toLowerCase();

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


export const login = async (req: Request, res: Response) => {
  try {
    // 1. Validation des données
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const email = parsed.data.email.toLowerCase();
    const { mot_de_passe } = parsed.data;

    // 2. Récupérer l'utilisateur par email
    const [users]: any = await pool.query(
      'SELECT id, nom, prenom, email, mot_de_passe, email_verifie FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect.',
      });
    }

    const user = users[0];

    // 3. Comparer le mot de passe avec le hash
    const motDePasseValide = await bcrypt.compare(mot_de_passe, user.mot_de_passe);

    if (!motDePasseValide) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect.',
      });
    }

    // 4. Récupérer les rôles de l'utilisateur
    const [roles]: any = await pool.query(
      `SELECT r.nom FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [user.id]
    );
    const rolesList = roles.map((r: any) => r.nom);

    // 5. Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, roles: rolesList },
      process.env.JWT_SECRET || 'secret_temporaire_a_changer',
      { expiresIn: '7d' }
    );

    // 6. Retourner le token + infos utilisateur (sans le mot de passe)
    return res.status(200).json({
      message: 'Connexion réussie.',
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        roles: rolesList,
      },
    });

  } catch (error) {
    console.error('Erreur login:', error);
    return res.status(500).json({ message: 'Erreur serveur, veuillez réessayer.' });
  }
};


