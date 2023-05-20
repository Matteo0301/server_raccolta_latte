db = db.getSiblingDB('raccolta_latte');

db.createCollection('utenti');
db.createCollection('raccolta');

db.createUser(
    {
        user: "user",
        pwd: "password",  // or cleartext password
        roles: [
            { role: "readWrite", db: "raccolta_latte" }
        ]
    }
)
