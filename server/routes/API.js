import express from "express";
import axios from "axios";


const router = express.Router();

router.post('/get_result', async (req, res)=>{
  const response = await axios.post('http://127.0.0.1:8000/result', {
    paths:req.body.imagesPaths, 
    classes:req.body.classes
  });
  return res.json({status:true, result:response.data.result})
})

export {router as apiRouter};