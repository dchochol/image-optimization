FROM --platform=linux/amd64 node:current-alpine
LABEL Description="Sharp library compilation and instalation for docker Alpine"

ENV PORT ${PORT}

WORKDIR /usr/src/app

# Install app dependencies
RUN npm install -g npm@latest
RUN npm install --platform=linuxmusl sharp
RUN npm install --platform=linuxmusl nodemon --global
RUN npm install qs
RUN npm install querystring
RUN npm install parseurl

# Bundle app source
COPY . .

EXPOSE ${PORT}

# Start the server
CMD ["nodemon", "src/index.js"]

# Start the server for local debugging purposes
#CMD ["nodemon", "--inspect-brk=0.0.0.0:9229", "src/index.js"]

