from PIL import Image
#load image
image = Image.open('input.jpg')

#inspect image
image = image.convert('RGB')
print ('Image size:', image.size)
print ('Image mode:', image.mode)

#save image unchanged
image.save('output.jpg', 'JPEG')
print ('Image saved successfully.')
