from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn, os, cv2
from typing import List
from pydantic import BaseModel
from evaluate import extract
from utils import extract_image

class ImagesInfo(BaseModel):
    paths: List[str]
    classes: List[dict]

app = FastAPI()
origins = ["*"]
app.add_middleware(CORSMiddleware, 
                   allow_origins=origins, 
                   allow_credentials=True, 
                   allow_methods=["*"],
                   allow_headers=["*"])


@app.get("/")
async def root():
    return {"message": "Inner ML API"}

serverPath = 'D:/Minh/Projects/AIPortal/server/public/'

@app.post('/result')
async def get_result(imagesInfo: ImagesInfo):
    imgList = [serverPath+p for p in imagesInfo.paths]
    classes = imagesInfo.classes
    detections = extract(imgList)
    for i, currImgPath in enumerate(imgList):
        imgName = os.path.basename(currImgPath)
        img = extract_image(currImgPath, detections[imgName], classes)
        outputPath = os.path.join(os.path.dirname(os.path.dirname(currImgPath)), 'results', imgName)
        cv2.imwrite(outputPath, img)

    return {"result":[path.replace('images', 'results') for path in imagesInfo.paths]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0",port=8000)