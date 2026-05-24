import socket
import sys

def find_free_port(start=5000, end=5100):
    for p in range(start, end + 1):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("0.0.0.0", p))
                return p
            except OSError:
                continue
    return 0

if __name__ == '__main__':
    port = find_free_port()
    if port:
        print(port)
        sys.exit(0)
    print(0)
    sys.exit(1)
