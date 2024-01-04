# Image Optimization Service

## Description
The Image Optimization Service is used to optimize images using the Sharp node.js module (https://sharp.pixelplumbing.com/). The service is dockerized and can be run either as a docker on a local or another server, or as a project on the fly.io platform.

## Installation
### On fly.io platform
* Clone the git repository to the local machine
```
git clone git@gitlab.codeblocks.sk:tools/image-optimization.git
```
* Change `fly.toml` file to your project settings
* Deploy documentation: https://fly.io/docs/languages-and-frameworks/dockerfile/

### On local/server machine
* Clone the git repository to the local machine
```
git clone git@gitlab.codeblocks.sk:tools/image-optimization.git
```
* Change PORT in `.env` file
* Run
```
docker-compose up -d
```

The service is started listening on the set port (e.g. 127.0.0.1:3050)

## Usage
When the project is started, image optimization is called using the parameters in the URL:
E.g.:
https://image-optimize-service.fly.dev/?url=https://www.codeblocks.sk/pelikan.png&size=500x500&format=webp&quality=80
http://127.0.0.1:3050/?url=https://www.codeblocks.sk/pelikan.png&size=500x500&format=webp&quality=80

URL params:
* `url` - url address of the image to be optimized
* `size` - width x height of result image (e.g. 500x500). Image will be fitted inside: preserving aspect ratio, resize the image to be as large as possible while ensuring its dimensions are less than or equal to both those specified.
* `format` - the format of the resulting image (e.g. jpeg, webp, png)
* `quality` - quality of result image, integer 1-100
More params: https://docs.topankovo.sk/books/rfcs/page/rfc-image-optimization

## Roadmap
Extend the service with additional functions from Sharp module