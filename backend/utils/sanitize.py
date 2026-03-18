import re


def strip_html_tags(text: str) -> str:
    """Remove HTML tags from text."""
    if not text:
        return text
    return re.sub(r'<[^>]+>', '', text)


def sanitize_input(text: str, max_length: int = None) -> str:
    """Strip HTML tags and enforce max length."""
    if not text:
        return text
    text = strip_html_tags(text)
    text = text.strip()
    if max_length and len(text) > max_length:
        text = text[:max_length]
    return text
