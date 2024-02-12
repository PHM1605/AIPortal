import express from "express";
import https from "https";
import fs from "fs";
import cors from "cors";
import cookieParser from "cookie-parser";
import { adminRouter } from "./routes/AdminRoute.js";
import { customerRouter } from "./routes/CustomerRoute.js";
import mysql from "mysql2";
import dotenv from "dotenv";
import Jwt from "jsonwebtoken";

const app = express();
dotenv.config();
app.use(cors({
  origin: ["http://localhost:5173", "https://mintek.top"],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PWD,
  database: process.env.DB_NAME
});
con.connect((err)=>{
  if(err) {
    console.log("Database connection error", err);
  } else {
    console.log("Database connected");
  }
});

app.use(express.json());
app.use(cookieParser());
app.use('/auth', adminRouter);
app.use('/customer', customerRouter);
app.use(express.static('public'));

// Check if user is authenticated or not
const verify_user = (req, res, next) => {
  const token = req.cookies.token;
  if(token) {
    Jwt.verify(token, process.env.SECRET_KEY, (err, decoded)=>{
      if(err) return res.json({status:false, error:"Wrong token"});
      req.id = decoded.id;
      req.role = decoded.role;
      req.username = decoded.username
      next();
    })
  } else {
    return res.json({status:false, error:"Not authenticated"});
  }
};

app.get('/verify', verify_user, (req, res)=>{
  return res.json({status:true, role:req.role, customer_id:req.id, username:req.username})
})

if (process.env.ENV === 'prd') {
  app.use(express.static("../client/dist"));
  const sslServer = https.createServer({
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem')
  }, app);
  sslServer.listen(process.env.PORT, () =>
    console.log(`Example app listening on ${process.env.PUBLIC_URL}`)
  );
} else if(process.env.ENV === 'dev') {
  app.listen(process.env.PORT, ()=>console.log(`Example app listening on ${process.env.LOCAL_URL}:${process.env.PORT}`));
}

export {con};