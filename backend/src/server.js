import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./sockets/socket.manager.js";
import { initMessageCleanupScheduler } from "./jobs/messageCleanup.job.js";

const server = http.createServer(app);

const PORT = process.env.PORT;

connectDB();
initSocket(server);

server.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
    // initMessageCleanupScheduler();   // 👈 Activates the scheduler
});