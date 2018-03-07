FROM node:9.7-alpine

MAINTAINER syuchan1005 <syuchan.dev@gmail.com>

COPY * /CamelCloud/

WORKDIR /CamelCloud/

RUN cd Client && npm install \
	&& cd ../Server && npm install

VOLUME /CamelCloud/config.js
ENV PORT=80
EXPOSE $PORT

CMD cd Client && npm build \
	cd ../Server && npm build \
	npm start