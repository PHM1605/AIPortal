import express from 'express';
import {con} from '../index.js';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const router = express.Router();

router.get('/:id', (req, res)=>{
  const id = req.params.id;
  const sql = `SELECT * FROM ${process.env.CUSTOMER_TABLE} WHERE id=?`;
  con.query(sql, [id], (err, result)=>{
    if(err) return res.json({status:false, error:"Customer id not exist"});
    return res.json({status:true, result:result})
  })
})

router.get('/:id/project', (req, res)=>{
  const userId = req.params.id;
  const sql = `SELECT * FROM projects WHERE user_id=(?)`;
  con.query(sql, [userId], (err, result)=>{
    if(err) return res.json({status:false, error:`Query projects of customer ${userId} fails`});
    return res.json({status:true, result:result});
  });
});

router.get('/:userId/project/:projId', (req, res)=>{
  const userId = req.params.userId;
  const projId = req.params.projId;
  const sql = `SELECT * FROM projects WHERE user_id=(?) AND id=(?)`;
  con.query(sql, [userId, projId], (err, result)=>{
    if(err) return res.json({status:false, error:`Query project ${projId} of customer ${userId} fails`});
    return res.json({status:true, result:result});
  });
});

router.post('/customer_login', (req, res)=>{
  const sql = `SELECT * FROM ${process.env.CUSTOMER_TABLE} WHERE email=?`;
  con.query(sql, [req.body.email], (err, result)=>{
    if(err) {
      return res.json({status:false, error:"Query customer error"});
    }
    if(result.length > 0) {
      bcrypt.compare(req.body.password, result[0].password, (err, response)=>{
        if(err) {
          return res.json({status:false, error:"Error while comparing bcrypted passwords"});
        }
        if(response) {
          const token = jwt.sign(
            {role:"customer", email: result[0].email, id:result[0].id, username:result[0].username},
            process.env.SECRET_KEY,
            {expiresIn: "1d"}
          );
          res.cookie('token', token);
          return res.json({status:true, id:result[0].id, username:result[0].username});
        } else {
          return res.json({status:false, error:"Wrong password"})
        }
      })
    } else {
      return res.json({status:false, error:"Wrong email or password"});
    }
  })
});

export {router as customerRouter};