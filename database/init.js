db = db.getSiblingDB('mathquiz');

db.createUser({
    user: 'mathquiz',
    pwd: 'Jelszo1234',
    roles: [
        { role: 'readWrite', db: 'mathquiz' }
    ]
});