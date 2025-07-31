import re

# Read the file
with open('main.py', 'r') as f:
    content = f.read()

# First, add ImageBlock class before the first AnyContentBlockValue
imageblock_class = '''class ImageBlock(BaseContentBlock):
    type: str = "image"
    src: str
    alt: Optional[str] = None
    caption: Optional[str] = None
    width: Optional[Union[int, str]] = None
    height: Optional[Union[int, str]] = None
    alignment: Optional[str] = "center"
    borderRadius: Optional[str] = "8px"
    maxWidth: Optional[str] = "100%"

'''

# Find the first occurrence of AnyContentBlockValue and insert ImageBlock before it
first_union_pos = content.find('AnyContentBlockValue = Union[')
if first_union_pos != -1:
    content = content[:first_union_pos] + imageblock_class + content[first_union_pos:]

# Now update all AnyContentBlockValue union types to include ImageBlock
content = re.sub(
    r'AnyContentBlockValue = Union\[\s*HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock, AlertBlock, SectionBreakBlock, TableBlock\s*\]',
    'AnyContentBlockValue = Union[\n    HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock, AlertBlock, SectionBreakBlock, TableBlock, ImageBlock\n]',
    content,
    flags=re.MULTILINE
)

# Write back to file
with open('main.py', 'w') as f:
    f.write(content)

print('✅ Successfully added ImageBlock to main.py')
print('✅ Updated all AnyContentBlockValue union types') 