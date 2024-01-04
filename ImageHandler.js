/**
 * This script includes a class for handling image processing requests.
 * It uses worker threads to process images, allowing image processing tasks
 * to be executed in parallel without blocking the main thread.
 * The class is designed to work with an ImageRequest instance to retrieve images.
 */

// Required libraries and classes
const ImageRequest = require('./ImageRequest');
const { Worker } = require('worker_threads');

/**
 * Class representing an image handler for processing images.
 */
class ImageHandler {

  /**
   * Create an ImageHandler instance.
   * @param {ImageRequest} request - An instance of ImageRequest to handle image fetching.
   */
  constructor(request) {
    if (!(request instanceof ImageRequest)) {
      throw new Error('Expected request of type ImageRequest');
    }
    this.request = request;
  }

  /**
   * Processes the image request and outputs a modified image.
   * This method fetches the image using the ImageRequest instance and then
   * uses a worker thread to process the image.
   * @return {Promise<object>} A promise that resolves to an object containing the processed image buffer and its content type.
   * @throws Will throw an error if there is any issue in fetching the image or processing it in the worker thread.
   */
  async process () {
    // Fetch the original image and its content type
    const { buffer, contentType } = await this.request.getOriginalImage();
    delete this.request.urlQueryParams['url'];

    return new Promise((resolve, reject) => {
      // Create a new worker thread for image processing
      const worker = new Worker(__dirname + '/imageWorker.js');

      // Post the image buffer and optimization parameters to the worker
      worker.postMessage({ buffer, imgOptimizeParams: this.request.urlQueryParams });

      // Handle messages received from the worker
      worker.on('message', (message) => {
        if (message.error) {
          reject(new Error(message.error));
        } else {
          resolve({
            Body: message.bufferImage,
            ContentType: contentType
          });
        }
      });

      // Handle any errors that occur in the worker
      worker.on('error', reject);

      // Handle worker thread exit
      worker.on('exit', (code) => {
        if (code !== 0) {
          console.error(`Worker stopped with exit code ${code}`);
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }
}

module.exports = ImageHandler;