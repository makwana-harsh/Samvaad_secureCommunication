import dotenv from "dotenv";
dotenv.config();
import app from './app.js';
import connectDB from "./config/db.js";


const PORT = process.env.PORT;
connectDB();

app.listen(PORT, ()=>{
    console.log(`http://localhost:${PORT}`);
});