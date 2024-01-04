/**
 * This script includes a class for handling image requests.
 * It fetches an image from a given URL and returns it as a buffer.
 * The class uses the Node.js standard 'https' module for HTTP requests,
 * the 'qs' module for query string parsing, and the 'url' module for URL parsing.
 */

// Required libraries
const url = require('node:url');
const qs = require('qs');
const https = require('https');

/**
 * Class representing an image request.
 */
class ImageRequest {

  /**
   * Create an ImageRequest instance.
   * @param {object} request - The HTTP request object.
   */
  constructor(request) {
    this.request = request;
  }

  /**
   * Extracts query parameters from the request URL.
   * Mainly used to get parameters for the Sharp image optimizer.
   * @return {Promise<object>} A promise that resolves to the query parameters object.
   */
  async getQueryParams() {
    // Parse request data from URL.
    const parsedUrl = url.parse(this.request.url);
    return Promise.resolve(qs.parse(parsedUrl.query));
  }

  /**
   * Retrieves the original image from the specified URL.
   * Attempts to download the image up to a specified number of retries.
   * @param {number} maxRetries - Maximum number of retries for downloading the image.
   * @param {number} retryDelay - Delay in milliseconds between retries.
   * @return {Promise<object>} A promise that resolves to an object containing the image buffer and its content type.
   * @throws Will throw an error if the image URL is not provided or if the download fails after the maximum retries.
   */
  async getOriginalImage(maxRetries = 3, retryDelay = 250) {
    this.urlQueryParams = await this.getQueryParams();

    if (!('url' in this.urlQueryParams)) {
      throw new Error('Image is not exists.');
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.loadImage(this.urlQueryParams.url);
        return result;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  /**
   * Loads the image from the specified URL.
   * @param {string} url - The URL of the image to be downloaded.
   * @return {Promise<object>} A promise that resolves to an object containing the image buffer and its content type.
   * @throws Will throw an error if the image download fails.
   */
  loadImage(url) {
    return new Promise((resolve, reject) => {
      https.get(url, response => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }

        const chunks = [];
        response.on('data', chunk => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({ buffer, contentType: response.headers['content-type'] });
        });
      }).on('error', err => reject(err));
    });
  }
}

module.exports = ImageRequest;
