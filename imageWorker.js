const { parentPort } = require('worker_threads');
const sharp = require('sharp');

parentPort.on('message', async (task) => {
  try {
    // Perform image processing
    const sharpObject = sharp(task.buffer);

    /**
     * RESIZE
     */
    // If the request data specifies a size, resize the image.
    if ('size' in task.imgOptimizeParams) {
      let fitImageValue = sharp.fit.inside;
      if ('fit' in task.imgOptimizeParams) {
        switch (task.imgOptimizeParams.fit) {
          case 'cover':
            fitImageValue = sharp.fit.cover;
            break;
          case 'contain':
            fitImageValue = sharp.fit.contain;
            break;
          case 'fill':
            fitImageValue = sharp.fit.fill;
            break;
          case 'outside':
            fitImageValue = sharp.fit.outside;
            break;
        }
      }
      
      let positionOfImage ='centre';
      if ('position' in task.imgOptimizeParams) {
        positionOfImage = task.imgOptimizeParams.position;
      }

      let resizeWidth = 0;
      let resizeHeight = 0;
      if (task.imgOptimizeParams.size === 'width') {
        const metadata = await sharpObject.metadata();
        resizeWidth = resizeHeight = metadata.width;
      } else if (task.imgOptimizeParams.size === 'height') {
        const metadata = await sharpObject.metadata();
        resizeWidth = resizeHeight = metadata.height;
      } else {
        resizeWidth = parseInt(task.imgOptimizeParams.size.split('x')[0]);
        resizeHeight = parseInt(task.imgOptimizeParams.size.split('x')[1]);
      }

      sharpObject.resize(
        resizeWidth,
        resizeHeight,
        {fit: fitImageValue, position: positionOfImage}
      );
    }

    /**
     * CHANGE FORMAT
     */
    // If the request data specifies a format, convert the image to that format.
    if ('format' in task.imgOptimizeParams) {
      let quality = 100;
      if ('quality' in task.imgOptimizeParams) {
        quality = parseInt(task.imgOptimizeParams.quality);
      }
      // @TODO check formats
      sharpObject.toFormat(task.imgOptimizeParams.format, {quality: quality, lossless: true});
      this.contentType = 'image/' + sharpObject.options.formatOut;
    }

    /**
     * FLIP
     */
    if ('flip' in task.imgOptimizeParams) {
      sharpObject.flip()
    }

    /**
     * FLOP
     */
    if ('flop' in task.imgOptimizeParams) {
      sharpObject.flop()
    }

    /**
     * ROTATE
     */
    if ('rotate' in task.imgOptimizeParams) {
      sharpObject.rotate(parseInt(task.imgOptimizeParams.rotate));
    }

    /**
     * MEDIAN
     */
    if ('median' in task.imgOptimizeParams) {
      sharpObject.median(parseInt(task.imgOptimizeParams.median))
    }

    /**
     * BLUR
     */
    if ('blur' in task.imgOptimizeParams) {
      sharpObject.blur(parseFloat(task.imgOptimizeParams.blur));
    }

    /**
     * GRAYSCALE
     */
    if ('greyscale' in task.imgOptimizeParams) {
      sharpObject.greyscale()
    }

    const outputBuffer = await sharpObject.toBuffer();

    // Send processed image back to the main thread
    parentPort.postMessage({ bufferImage: outputBuffer, error: null });
  } catch (error) {
    parentPort.postMessage({ bufferImage: null, error: error.message });
  }
});
