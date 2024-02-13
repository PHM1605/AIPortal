import React, {useState} from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { url } from '../App';

const Upload = () => {
  const [images, setImages] = useState();
  const [thumbnails, setThumbnails] = useState([]);
  const userId = useParams().customer_id;
  const projectId = useParams().projId;

  const handleChooseImages = (event)=>{
    setImages(event.target.files);
    let tmp = [];
    for (let i=0; i<event.target.files.length; i++) {
      tmp.push(URL.createObjectURL(event.target.files[i]));
    }
    setThumbnails(tmp);
  };

  const handleSubmit = async (event) =>{
    event.preventDefault();
    const formData = new FormData();
    for(let i=0; i<images.length;i++) {
      formData.append("images", images[i]);
    }
    const result_username = await axios.get(`${url}/auth/customer/${userId}`);
    if(result_username.data.status) {
      formData.append("result_username", result_username.data.result[0].username);
    }
    
    const result = await axios.post(`${url}/customer/${userId}/project/${projectId}/images`, formData);
    if (result.data.status) {
      console.log("OK");
    } else {
      alarm(result.data.error);
    }
  }

  return (
    <div className="d-flex justify-content-center">
      <form className='col-10 vh-100 p-4' onSubmit={handleSubmit}>
        <div className='d-flex justify-content-end mb-4'>
          <input type='file' id='chooseImagesButton' hidden onChange={handleChooseImages} multiple/>
          <label htmlFor='chooseImagesButton' className='btn btn-primary border rounded me-4'>Choose Images</label>          
          <button type='submit' className='btn btn-light border rounded'>Upload Images</button>
        </div>
        <div className='d-flex flex-wrap rounded border-start border-end p-4 h-90'>
          {
            thumbnails.map((thumbnail)=>{
              return (
              <div className='m-2'>
                <img style={{width:"100px", height:"100px"}} alt="" src={thumbnail} className='border rounded'/>
              </div>
              );
            })
          }
        </div>
      </form>
      

    </div>
  )
}

export default Upload