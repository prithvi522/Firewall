#!/usr/bin/env python3
import sys
from pathlib import Path
import requests

def main():
    if len(sys.argv) < 2:
        print('Usage: scan.py <file-path>')
        sys.exit(1)

    path = Path(sys.argv[1])
    if not path.exists():
        print('File not found:', path)
        sys.exit(1)

    url = 'http://localhost:5000/api/scan/upload'
    with path.open('rb') as fh:
        files = {'file': (path.name, fh)}
        resp = requests.post(url, files=files)
        print(resp.text)

if __name__ == '__main__':
    main()
