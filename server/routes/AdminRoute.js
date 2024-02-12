import express from "express";
import bcrypt from 'bcrypt';
import {con} from "../index.js";
import fs from "fs";

const router = express.Router();

router.get('/customer', (req, res)=>{
  const sql = `SELECT * FROM ${process.env.CUSTOMER_TABLE}`;
  con.query(sql, (err, result)=>{
    if(err) return res.json({status:false, error: "Select customers error"});
    return res.json({status:true, result: result});
  });
});

router.post('/add_customer', (req, res)=>{  
  const sql = `INSERT INTO ${process.env.CUSTOMER_TABLE} (username, email, password) VALUES (?)`;
  bcrypt.hash(req.body.password, 10, (err, hash)=>{
    if(err) return res.json({status:false, error:"Query error"});
    const values = [
      req.body.username,
      req.body.email,
      hash 
    ];
    con.query(sql, [values], (err, result)=>{
      if(err) {
        return res.json({status:false, error:"Cannot insert to db"});
      }
      const folderName = "./public/customers/"+req.body.username;
      if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
      }
      return res.json({status:true, id:result.id});
    });
  })
});

router.post('/add_project', (req, res)=>{
  const sql = "INSERT INTO projects (name, user_id, type_id) VALUES (?)";
  con.query(sql, [[req.body.name, req.body.user_id, req.body.type_id]], (err, result)=>{
    if(err) return res.json({status:false, error:"Insert db error"});
    return res.json({status:true});
  });
})

router.get('/project', (req, res)=>{
  const sql = `SELECT * FROM project`;
  con.query(sql, (err, result)=>{
    if(err) return res.json({status:false, error:"Query project types error"});
    return res.json({status:true, result:result});
  });
});

router.get('/project/:id', (req, res)=>{
  let typeId = req.params.id;
  const sql = `SELECT * FROM project WHERE id=(?)`;
  con.query(sql, [typeId], (err, result)=>{
    if(err) return res.json({status:false, error:`Query project type for ID ${typeId} fails`});
    return res.json({status:true, result: result});
  });
});

export {router as adminRouter};