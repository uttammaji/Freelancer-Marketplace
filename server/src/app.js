import express from "express";

const app = express();


//urlencoded data handle and limit set
app.use(express.urlencoded({ extended: true }));


//static file serve
app.use(express.static("public"));

export { app };