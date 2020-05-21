# Spaced out API

Node.js/Express server for the Spaced out client.

[Click here for the client repo](https://github.com/thinkful-ei-macaw/spaced-repetition-IJ)

## Technology used

- `React` (front-end)
- `Node.js`
- `Express`
- `PostgreSQL`
- `Mocha/Chai`

## API Info

### POST /api/user

Request to create a new user account. All fields are required. On succes it will respond with the user `id`, user `name` (display name), and the `username`.

Example request:

```
{
	"name": "User Name",
	"username": "myUserName",
	"password": "Password123!"
}
```

Example response:

```
{
  "id": 7,
  "name": "User Name",
  "username": "myUserName"
}
```

### POST /api/auth/token

Use this route to request a new authentication token. Upon success an `authToken` will be sent back.

Example request:

```
{
	"username": "admin",
	"password": "pass"
}
```

Example response:

```
{
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJuYW1lIjoiRHVuZGVyIE1pZmZsaW4gQWRtaW4iLCJpYXQiOjE1ODk5MjE4NzgsImV4cCI6MTU4OTkzMjY3OCwic3ViIjoiYWRtaW4ifQ.oe9unaCeE-rs5RZl3WeqYbshrhtzsuYqi0yBocZ0mdI"
}
```

### GET /api/language

Responds with a list of the current user's language, total score, and words (with word scores).

Example response:

```
{
  "language": {
    "id": 2,
    "name": "Afrikaans",
    "user_id": 2,
    "head": 13,
    "total_score": 10
  },
  "words": [
    {
      "id": 13,
      "language_id": 2,
      "original": "vertaal",
      "translation": "translate",
      "next": 10,
      "memory_value": 2,
      "correct_count": 1,
      "incorrect_count": 2
    },
    {
      "id": 10,
      "language_id": 2,
      "original": "goeie more",
      "translation": "good morning",
      "next": 9,
      "memory_value": 4,
      "correct_count": 2,
      "incorrect_count": 2
    },
  ]
}
```

### GET /api/language/head

Gets the next word for the user to guess (at the head of the list).

Example response:

```
{
  "nextWord": "vertaal",
  "totalScore": 10,
  "wordCorrectCount": 1,
  "wordIncorrectCount": 2
}
```

### POST /api/language/guess

Used to guess the word given from the `/api/language/head` route. Will respond with feedback as to whether the user was correct as well as with information on the next word to guess.

Example request:

```
{
   "guess": "translate"
}
```

Example response:

```
{
  "nextWord": "goeie more",
  "totalScore": 11,
  "wordCorrectCount": 2,
  "wordIncorrectCount": 2,
  "answer": "translate",
  "isCorrect": true
}
```

## Local dev setup

If using postgres user `postgres`:

```bash
mv example.env .env
createdb -U postgres spaced-repetition
createdb -U psotgres spaced-repetition-test
```

If your `postgres` user has a password be sure to set it in `.env` for all appropriate fields. Or if using a different user, update appropriately.

```bash
npm install
npm run migrate
env MIGRATION_DB_NAME=spaced-repetition-test npm run migrate
```

And `npm test` should work at this point

## Configuring Postgres

For tests involving time to run properly, configure your Postgres database to run in the UTC timezone.

1. Locate the `postgresql.conf` file for your Postgres installation.
   1. E.g. for an OS X, Homebrew install: `/usr/local/var/postgres/postgresql.conf`
   2. E.g. on Windows, _maybe_: `C:\Program Files\PostgreSQL\11.2\data\postgresql.conf`
   3. E.g on Ubuntu 18.04 probably: '/etc/postgresql/10/main/postgresql.conf'
2. Find the `timezone` line and set it to `UTC`:

```conf
# - Locale and Formatting -

datestyle = 'iso, mdy'
#intervalstyle = 'postgres'
timezone = 'UTC'
#timezone_abbreviations = 'Default'     # Select the set of available time zone
```

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests mode `npm test`

Run the migrations up `npm run migrate`

Run the migrations down `npm run migrate -- 0`
