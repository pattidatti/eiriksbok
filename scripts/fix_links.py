
import os
import json
import re

CONTENT_DIR = "public/content"
# The prefix found in the bad links
# Note: The case might vary effectively, but based on the grep it seems consistent.
# We will look for "file:///" and then see if it matches the pattern of our content dir.

def fix_links_in_content(content):
    """
    Recursively traverse JSON content (list or dict) and fix string values containing file:/// links.
    """
    if isinstance(content, dict):
        return {k: fix_links_in_content(v) for k, v in content.items()}
    elif isinstance(content, list):
        return [fix_links_in_content(v) for v in content]
    elif isinstance(content, str):
        return fix_link_string(content)
    else:
        return content

def fix_link_string(text):
    """
    Finds markdown links [Label](URL) and standard hrefs that use file:/// 
    and converts them to relative web paths if they point to content.
    """
    # Regex to find markdown links: [Label](URL)
    # We want to capture the URL part.
    
    # We'll use a callback to process each match
    def replace_match(match):
        full_match = match.group(0)
        label = match.group(1)
        url = match.group(2)
        
        new_url = transform_url(url)
        if new_url != url:
            print(f"      Fixed link: {url} -> {new_url}")
            return f"[{label}]({new_url})"
        return full_match

    # Simple regex for markdown links. 
    # Note: This might be simplistic for nested brackets but usually sufficient for these files.
    # Pattern: [text](url)
    modified_text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', replace_match, text)
    
    return modified_text

def transform_url(url):
    if not url.startswith("file:///"):
        return url
    
    # Check if it looks like it points to our content directory
    # The user has: c:/Users/Eirik/Documents/Eiriksbok/Eiriksbok/public/content/...
    # or potentially lowercase.
    
    # Normalize to forward slashes and lowercase for checking
    lower_url = url.replace('\\', '/').lower()
    
    marker = "/public/content/"
    if marker in lower_url:
        # Extract everything after /public/content/
        idx = lower_url.find(marker)
        relative_path = lower_url[idx + len(marker):]
        
        # Remove .json extension if present
        if relative_path.endswith(".json"):
            relative_path = relative_path[:-5]
        
        # Ensure it starts with /
        if not relative_path.startswith("/"):
            relative_path = "/" + relative_path
            
        return relative_path

    return url

def main():
    count = 0
    for root, dirs, files in os.walk(CONTENT_DIR):
        for file in files:
            if file.endswith(".json"):
                path = os.path.join(root, file)
                
                # Skip manifest or global logs if needed (though they shouldn't have these links probably)
                # But let's process everything just in case.
                
                with open(path, 'r', encoding='utf-8') as f:
                    try:
                        data = json.load(f)
                    except json.JSONDecodeError:
                        print(f"Skipping invalid JSON: {path}")
                        continue
                
                # Process the data
                # We need to serialize to string to easily regex replace across the whole structure?
                # Or traverse? Traversing is safer to preserve structure.
                # However, the previous 'fix_links_in_content' only handled strings in the structure.
                # Let's try to be smart. Text content is usually in specific fields.
                # But a "replace everywhere" approach isn't bad if we are careful.
                
                # Actually, traversing is better.
                new_data = fix_links_in_content(data)
                
                if new_data != data:
                    print(f"Fixing file: {path}")
                    with open(path, 'w', encoding='utf-8') as f:
                        json.dump(new_data, f, indent=4, ensure_ascii=False)
                    count += 1

    print(f"Finished. Updated {count} files.")

if __name__ == "__main__":
    main()
