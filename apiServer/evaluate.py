import cv2, os
import numpy as np
import onnxruntime as ort

def letterbox(im, new_shape=(640, 640), color=(114, 114, 114), auto=True, scaleup=True, stride=32):
    # Resize and pad image while meeting stride-multiple constraints
    shape = im.shape[:2]  # current shape [height, width]
    if isinstance(new_shape, int):
        new_shape = (new_shape, new_shape)

    # Scale ratio (new / old)
    r = min(new_shape[0] / shape[0], new_shape[1] / shape[1])
    if not scaleup:  # only scale down, do not scale up (for better val mAP)
        r = min(r, 1.0)

    # Compute padding
    new_unpad = int(round(shape[1] * r)), int(round(shape[0] * r))
    dw, dh = new_shape[1] - new_unpad[0], new_shape[0] - new_unpad[1]  # wh padding

    if auto:  # minimum rectangle
        dw, dh = np.mod(dw, stride), np.mod(dh, stride)  # wh padding

    dw /= 2  # divide padding into 2 sides
    dh /= 2

    if shape[::-1] != new_unpad:  # resize
        im = cv2.resize(im, new_unpad, interpolation=cv2.INTER_LINEAR)
    top, bottom = int(round(dh - 0.1)), int(round(dh + 0.1))
    left, right = int(round(dw - 0.1)), int(round(dw + 0.1))
    im = cv2.copyMakeBorder(im, top, bottom, left, right, cv2.BORDER_CONSTANT, value=color)  # add border
    return im, r, (dw, dh)

def extract(img_list):
  detections = {}
  session = ort.InferenceSession('spvbvsc93_1211.onnx')
  for img_path in img_list:
    img0 = cv2.imread(img_path) # BGR
    img = cv2.cvtColor(img0, cv2.COLOR_BGR2RGB)
    H, W, C = img.shape
    img, ratio, dwdh = letterbox(img, auto=False)
    img = img.transpose(2, 0, 1)
    img = np.expand_dims(img, 0)
    img = np.ascontiguousarray(img)
    img = img.astype(np.float32)
    img /= 255.0  # 0 - 255 to 0.0 - 1.0
    conf_thres = 0.25
    onnx_inputs = {session.get_inputs()[0].name: img}
    onnx_outputs = session.run(None, onnx_inputs)[0]
    boxes = []
    for _, (idx, x0, y0, x1, y1, cls_id, score) in enumerate(onnx_outputs):
      score = round(float(score),3)
      if score < conf_thres: continue
      box = np.array([x0,y0,x1,y1])
      box -= np.array(dwdh*2)
      box /= ratio
      box = box.round().astype(np.int32).tolist()
      cls_id = int(cls_id)
      box = [max(0,box[0]),max(0,box[1]),min(W,box[2]),min(H,box[3]), score, cls_id]
      boxes.append(box)
  
    detections[os.path.basename(img_path)] = boxes
  return detections