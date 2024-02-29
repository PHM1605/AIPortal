import cv2, os
from PIL import Image
import numpy as np

def hex2int(hex_str):
  return (int(hex_str[1:3], 16), int(hex_str[3:5], 16), int(hex_str[5:7], 16))

def extract_image(imgPath, detection, classes):
  classList = [cl['className'] for cl in classes]
  colorList = [cl['color'] for cl in classes]
  count = [0 for _ in classList]
  img = cv2.imread(imgPath)
  for det in detection:
    cl = det[-1]
    count[cl] = count[cl] + 1
    color = hex2int(colorList[det[-1]])
    img = cv2.rectangle(img, (det[0], det[1]), (det[2], det[3]), color, 2) 
    # img = cv2.putText(img, classList[det[-1]], (det[0], det[1]), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2, cv2.LINE_AA)
  
  msgs, colors = [], []
  for i, c in enumerate(count):
    if c==0: continue
    msgs.append(f"{classList[i]}: {count[i]}")
    colors.append(colorList[i])

  for i, msg in enumerate(msgs):
    img = cv2.putText(img, msg, (20, 20*(i+1)), cv2.FONT_HERSHEY_SIMPLEX, 1/2, hex2int(colors[i]), 2, cv2.LINE_AA)

  return img

def convert_webp_to_jpg(inp_file, output_folder):
  with Image.open(inp_file) as img:
    img = img.convert('RGB')
    output_path = os.path.join(output_folder, os.path.basename(inp_file).split('.')[0] + '.jpg')
    img.save(output_path, "JPEG")
    return output_path