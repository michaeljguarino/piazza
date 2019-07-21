import requests
import sys

def login(email, password):
  r = requests.post('http://api.piazzaapp.com/auth/login',
    data={'email': email, 'password': password},
    headers={'accept': 'application/json'}
  )
  print r.status_code
  print r.text
  print r.headers

if __name__ == '__main__':
  login(sys.argv[1], sys.argv[2])

