#!/bin/sh

if [ -e /data/config.js ]
then
  cp /data/config.js config.js
else
  if [ ! -e config.js ]
  then
    cp ./template.config.js ./config.js
  fi
fi

if [ ! -e Client/dist ]
then
  cd Client && npm run build && cd ../
fi

if [ ! -e Server/dist ]
then
  cd Server && npm run build && cd ../
fi

cd Server && npm run start
