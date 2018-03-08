#!/bin/bash

if [ ! -e config.js ]
then
  cp template.config.js config.js
fi

if [ ! -e Client/dist ]
then
  cd Client && npm build && cd ../
fi

if [ ! -e Server/dist ]
then
  cd Server && npm build && cd ../
fi

cd Server && npm start
