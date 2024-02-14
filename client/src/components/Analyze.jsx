import React, {useState, useEffect} from 'react'

const Analyze = () => {
  const [resultImages, setResultImages] = useState([]);
  return (
    <div className='d-flex flex-wrap rounded border-start border-end p-4 h-90'>
      {
        resultImages.map(resultImage=>{
          return (
            <div id={resultImage.id} key={resultImage.id} className='m-2'>
              <img style={{width:"100px", height:"100px"}} alt="" src={resultImage.content} className='border rounded'/>
            </div>
          );
        })
      }
    </div>
  )
}

export default Analyze