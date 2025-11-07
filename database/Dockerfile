FROM mongodb/mongodb-community-server:7.0-ubuntu2204

COPY ./init-mongo.js /docker-entrypoint-initdb.d/

EXPOSE 27017

ENV MONGO_INITDB_ROOT_USERNAME=mathquiz
ENV MONGO_INITDB_ROOT_PASSWORD=$eWyO6B$