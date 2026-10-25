import dotenv from 'dotenv';
dotenv.config();


import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
import path from 'path';
import authRoutes from "./routes/auth.routes";
import domaineRouter from './routes/domaine.routes';
import ressourceRoutes from './routes/resource.routes';
import adhesionRoutes from './routes/adhesion.routes';
import projetRoutes from './routes/projet.routes';
import materielRoutes from './routes/materiel.routes';
import evenementRoutes from './routes/evenement.routes';



const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Sert le dossier uploads/ statiquement
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes API
app.use("/api", authRoutes);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("disconnect", () => console.log("User disconnected"));
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`Backend TS sur http://localhost:${PORT}`),
);

// Route domaine
app.use('/api', domaineRouter);

// Route liste de tous les ressources
app.use('/api', ressourceRoutes);


app.use('/api', adhesionRoutes);


app.use('/api', projetRoutes);


app.use('/api/materiels', materielRoutes);


app.use('/api/evenements', evenementRoutes);

