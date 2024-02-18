import React, {useState, useEffect, useRef} from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { url } from '../App';

const Analyze = () => {
  const [results, setResults] = useState([]);
  const userId = useParams().customer_id;
  const projectId = useParams().projId;

  const handleSubmit = async (event)=>{
    event.preventDefault();

    // delete existing results
    const customerInfo = await axios.get(`${url}/customer/${userId}`);
    const projectInfo = await axios.get(`${url}/customer/${userId}/projects/${projectId}`);
    let values = {
      username: customerInfo.data.result[0].username,
      projName: projectInfo.data.result[0].name
    };
    const deleteResult = await axios.delete(`${url}/customer/${userId}/projects/${projectId}/results`, {data: values})
    if (deleteResult.status) {
      console.log("Delete result successfully")
    }

    const imagesResult = await axios.get(`${url}/customer/${userId}/projects/${projectId}/images`)
    const classes = await axios.get(`${url}/customer/${userId}/projects/${projectId}/classes`)
    let tmpImagesPaths = imagesResult.data.result.map(img=>img.path);    
    const tmpResults = await axios.post(`${url}/api/get_result`, {
      imagesPaths: tmpImagesPaths, 
      classes:classes.data.result
    });
    setResults(tmpResults.data.result);
  }

  return (
    <div className="d-flex justify-content-center">
      <form className='col-10 vh-100 p-4' onSubmit={handleSubmit} >
        <div className='d-flex justify-content-end mb-4'>         
          <button type='submit' className={`btn btn-light border rounded `}>Analyze Images</button>
        </div>
        <div className='d-flex flex-wrap rounded border-start border-end p-4 h-90'>
          { 
            results.map((resultPath, idx)=>{
              return (
                <div id={idx} key={idx} className='m-2'>
                  <img style={{width:"100px", height:"100px"}} alt="" src={`${url}/${resultPath}`} className='border rounded'/>
                </div>
              );
            })
          } 
        </div>
      </form>
    </div>
  )
}

export default Analyze