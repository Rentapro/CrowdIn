import socket
import sys

def test_dns(host):
    try:
        ip = socket.gethostbyname(host)
        print(f"[+] DNS OK: {host} -> {ip}")
    except socket.gaierror:
        print(f"[!] DNS ERROR: No se pudo resolver {host}")

print("--- DIAGNOSTICO DE RED SNIPER ---")
test_dns("google.com")
test_dns("duckduckgo.com")
test_dns("bing.com")
test_dns("github.com")
