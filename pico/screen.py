

header_width = 128
header_height = 20

main_padding = 2

def blit_header(header_text, header_icon, oled):
    print('test')
    with open(header_icon, 'rb') as f:
        f.readline() # Magic number
        f.readline() # Creator comment
        dimensons = f.readline() # Dimensions
    
        data = bytearray(f.read())
        print(data)
        #print(dimensions)
        #dimensions = dimensions.replace('b\'', '')
        #dimensions = dimensions.replace('\\n\'', '')
        #print(dimensions)
    #oled.blit(fbuf, 14, 0)
    #oled.show()
    
    #fbuf = framebuf.FrameBuffer(data, 100, 64, framebuf.MONO_HLSB)

    