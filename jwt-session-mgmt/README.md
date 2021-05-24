# jwt session management

## Setup

### Run locally

```
npm install
npm run-script start-dev
```

### Run in docker

```
docker-compose up --build
```

## Endpoints

### root

```
localhost:8000/
```

Request

```curl
curl --location --request GET 'localhost:8000/' \
--header 'Content-Type: application/json'
```

Response

```json
open endpoint (no auth)
```

### login

```
localhost:8000/auth/login
```

Request

```bash
curl --location --request POST 'localhost:8000/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "username": "mat",
    "password": "foobar"
}'
```

Response

```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjJmYzI3Yi05NjdiLTRmMmEtYjk4OS0yODY5Yjc3YTg3MzkiLCJ1c2VybmFtZSI6Im1hdCIsImNsaWVudF9pZCI6Ii1ITE9CSzZkIiwiZXhwIjoxNjIxODQ2NTE0LCJpYXQiOjE2MjE4NDYyMTR9.6IlNUPP0f4221-O0rFruu8Hj6IJkYPxHDrN7HEWrRsBh3A04NaEJ5bNH6um47OQszYqFRNpk1kIOjCRten6jiw",
  "refreshToken": "YpFWkMFvvlZXSsWRBZbxQd2VL3F3n4bz",
  "tokenType": "Bearer",
  "expiresAt": 1621846514
}
```

### protected route

```
localhost:8000/protected
```

Request

```bash
curl --location --request GET 'localhost:8000/protected' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjJmYzI3Yi05NjdiLTRmMmEtYjk4OS0yODY5Yjc3YTg3MzkiLCJ1c2VybmFtZSI6Im1hdCIsImNsaWVudF9pZCI6Ii1ITE9CSzZkIiwiZXhwIjoxNjIxODQ2NTE0LCJpYXQiOjE2MjE4NDYyMTR9.6IlNUPP0f4221-O0rFruu8Hj6IJkYPxHDrN7HEWrRsBh3A04NaEJ5bNH6um47OQszYqFRNpk1kIOjCRten6jiw'
```

Response

```json
"Hello, mat!"
```

### refresh token

```
localhost:8000/auth/refresh-token
```

Request

```bash
curl --location --request POST 'localhost:8000/auth/refresh-token' \
--header 'Content-Type: application/json' \
--data-raw '{
    "refreshToken": "SznkveEY1urCcmHigVOxVJOGoUgahtwB"
}'
```

Response

```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjJmYzI3Yi05NjdiLTRmMmEtYjk4OS0yODY5Yjc3YTg3MzkiLCJ1c2VybmFtZSI6Im1hdCIsImNsaWVudF9pZCI6Inhod2xJbHZVIiwiZXhwIjoxNjIxODQ2ODU5LCJpYXQiOjE2MjE4NDY1NTl9.goK5hyIpvqxTzUwxRezq3-u_zuBnTj2lPrPiUaJ3UtSyUXdOb9BfxZRISk0WXkgmNuXx3JTiReWuohQjOlStww",
  "refreshToken": "O6CfmegbLfg439FzRoBl7yAfMQ8_FvKt",
  "tokenType": "Bearer",
  "expiresAt": 1621846859
}
```

### logout user on current device

```
localhost:8000/auth/logout/
```

Request

```bash
curl --location --request POST 'localhost:8000/auth/logout/' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjJmYzI3Yi05NjdiLTRmMmEtYjk4OS0yODY5Yjc3YTg3MzkiLCJ1c2VybmFtZSI6Im1hdCIsImNsaWVudF9pZCI6Ii1ITE9CSzZkIiwiZXhwIjoxNjIxODQ2NTE0LCJpYXQiOjE2MjE4NDYyMTR9.6IlNUPP0f4221-O0rFruu8Hj6IJkYPxHDrN7HEWrRsBh3A04NaEJ5bNH6um47OQszYqFRNpk1kIOjCRten6jiw'
```

Response

```json

```

### logout user on all devices

```
localhost:8000/auth/logout/devices/all
```

Request

```bash
curl --location --request POST 'localhost:8000/auth/logout/devices/all' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjJmYzI3Yi05NjdiLTRmMmEtYjk4OS0yODY5Yjc3YTg3MzkiLCJ1c2VybmFtZSI6Im1hdCIsImNsaWVudF9pZCI6Ii1ITE9CSzZkIiwiZXhwIjoxNjIxODQ2NTE0LCJpYXQiOjE2MjE4NDYyMTR9.6IlNUPP0f4221-O0rFruu8Hj6IJkYPxHDrN7HEWrRsBh3A04NaEJ5bNH6um47OQszYqFRNpk1kIOjCRten6jiw'
```

Response

```json

```

## Hardcoded users credentials

```
username: pat
password: foobar
```

```
username: mat
password: foobar
```
