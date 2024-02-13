import express from 'express';
import {con} from '../index.js';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import multer from 'multer';
import path from "path";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config()
const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null, `${process.env.TMP_LOC}`);
  },
  filename: (req, file, cb)=>{
    cb(null, file.originalname);
  }
});
const upload = multer({storage:storage});

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

router.get('/:userId/project/:projId/classes', (req, res)=>{
  const projId = req.params.projId;
  const sql = `SELECT color, name AS className FROM classes WHERE project_id=?`;
  
  con.query(sql, [projId], (err, result)=>{
    if(result) {
      return res.json({status:true, result:result});
    }
    // no classes info -> do nothing
    else {
      return res.json({status:true});
    }
  })
})

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
            {role:"customer", email: result[0].email, customer_id:result[0].id, username:result[0].username},
            process.env.SECRET_KEY,
            {expiresIn: "1d"}
          );
          res.cookie('token', token);
          return res.json({status:true, customer_id:result[0].id, username:result[0].username});
        } else {
          return res.json({status:false, error:"Wrong password"})
        }
      })
    } else {
      return res.json({status:false, error:"Wrong email or password"});
    }
  })
});

router.post("/:userId/project/:projId/images", upload.array('images'), (req, res)=>{
  const userId = req.params.userId;
  const username = req.body.result_username;
  fs.readdir(`${process.env.TMP_LOC}`, (err, files)=>{
    files.forEach(file=>{
      if (path.extname(file)===".jpg") {
        fs.rename(`${process.env.TMP_LOC}/${file}`, `public/customers/${username}/images/${file}`, err2=>{
          if(err2) return res.json({status:false, error:"Error moving file"});
        })
      }
    })
  })
  return res.json({status:true})
});

router.post("/:userId/project/:projId", (req,res)=>{
  const classes = req.body.classes
  const projId = req.params.projId;
  const values = [];
  let sql = "INSERT INTO classes (name, project_id, color) VALUES ";
  classes.forEach((cl,idx)=>{
    sql += (idx<classes.length-1) ? "(?)," : "(?)";
    values.push([cl.className, projId, cl.color]);
  });
  con.query(sql, values, (err, result)=>{
    if(err) return res.json({status:false, error:"Query insert classes table failed"});
    return res.json({status:true});
  });
});
  
router.delete('/:userId/project/:projId/classes', (req,res)=>{
  const projID = req.params.projId;
  const sql = `DELETE FROM classes WHERE project_id=(?)`;
  con.query(sql, [projID], (err, result)=>{
    return res.json({status:true});
  })
});

export {router as customerRouter};