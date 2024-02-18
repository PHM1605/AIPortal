import cv2

def hex2int(hex_str):
  return (int(hex_str[1:3], 16), int(hex_str[3:5], 16), int(hex_str[5:7], 16))

def extract_image(imgPath, detection, classes):
  classList = [cl['className'] for cl in classes]
  colorList = [cl['color'] for cl in classes]
  img = cv2.imread(imgPath)
  for det in detection:
    color = hex2int(colorList[det[-1]])
    img = cv2.rectangle(img, (det[0], det[1]), (det[2], det[3]), color, 2) 
    img = cv2.putText(img, classList[det[-1]], (det[0], det[1]), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2, cv2.LINE_AA)
  return img