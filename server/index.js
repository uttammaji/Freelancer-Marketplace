/// this is the entry point of backend work

import connectDB from "./src/database/dbConnection.js";
import dotenv from "dotenv";
import { app } from "./src/app.js";

dotenv.config({
    path: "./.env"
});



connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`http://localhost:${process.env.PORT || 3000}`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    });