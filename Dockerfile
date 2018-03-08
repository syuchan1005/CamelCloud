FROM node:9.7-alpine

MAINTAINER syuchan1005 <syuchan.dev@gmail.com>

COPY . CamelCloud/

WORKDIR CamelCloud/

RUN cd Client && npm install -D \
	&& cd ../Server && npm install -D \
	&& cd ../ && chmod 775 cmd.sh

VOLUME /data
ENV PORT=80
EXPOSE $PORT

CMD ["./cmd.sh"]