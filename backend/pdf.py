from pdfminer.high_level import extract_pages
from pdfminer.layout import LTTextContainer

def extract_text_from_pdf(filename,page_number=None,min_line_length=1):
    '''从PDF文件中提取文本内容。'''
    paragraphs = []
    buffer =''
    full_text = ''
    for i, page_layout in enumerate(extract_pages(filename)):
        if page_number is not None and page_layout.pageid != page_number:
            continue
        for element in page_layout:
            if isinstance(element, LTTextContainer):
                full_text = element.get_text().strip() + '\n'
        lines = full_text.split('\n')
        for text in lines:
            if len(text.strip()) >= min_line_length:
                buffer += (' '+text.strip()) if text.endswith('-') else text.strip('-')
            elif buffer:
                paragraphs.append(buffer.strip())
                buffer = ''
        if buffer:
            paragraphs.append(buffer)
        return paragraphs
