import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.routes";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Routes API
app.use("/api", authRoutes);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("disconnect", () => console.log("User disconnected"));
});

const PORT = 5000;
httpServer.listen(PORT, () =>
  console.log(`Backend TS sur http://localhost:${PORT}`),
);
