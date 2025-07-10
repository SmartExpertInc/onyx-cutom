with open('custom_extensions/backend/main.py', 'rb') as f:
    content = f.read()
    print(f'First 10 bytes: {content[:10]}')
    bom = b'\xef\xbb\xbf'
    print(f'Has BOM: {content.startswith(bom)}')
    
    if content.startswith(bom):
        print('Removing BOM...')
        with open('custom_extensions/backend/main.py', 'wb') as f:
            f.write(content[3:])
        print('BOM removed!')
    else:
        print('No BOM found.') 