/**
 * This script sets up an HTTP server to handle image optimization requests.
 * It leverages the ImageRequest and ImageHandler classes to process images.
 * The server listens on a specified port, receives image requests, and sends back optimized images.
 */

// Required modules and classes
const ImageRequest= require('./ImageRequest.js');
const ImageHandler= require('./ImageHandler.js')

/**
 * Retrieves the server port number from environment variables or uses a default value (.env/fly.toml file).
 */
const port = process.env.PORT || 8080;

/**
 * Creates an HTTP server.
 * The server listens for image requests, processes them, and returns optimized images.
 */
const server = require('http').createServer(async (req, res) => {
  try {
    // Skip the favicon request.
    if (req.url === '/favicon.ico') {
      res.writeHead(200, {'Content-Type': 'image/x-icon'} );
      res.end();
      return;
    }

    // Initialize ImageRequest and ImageHandler with the incoming request.
    const imageRequest = new ImageRequest(req);
    const imageHandler = new ImageHandler(imageRequest);

    // Process the image request and get the optimized image.
    const processedRequest = await imageHandler.process();

    // Set the content type header and write the optimized image to the response.
    res.writeHead(200, {
      'Content-Type': processedRequest.ContentType
    });
    res.write(processedRequest.Body);
  } catch (error) {
    // Log and send an error message in case of failure.
    console.error(error);
    res.writeHead(500);
    if (error instanceof Error) {
      res.write("Internal Server Error: " + error.message);
    } else {
      res.write("Internal Server Error: " + error.toString());
    }
  }
  // End of response.
  res.end();
});

/**
 * Start listening on the specified port.
 * The server is accessible on all network interfaces.
 */
server.listen(port, '0.0.0.0', () => {
  console.log('Server listening on port ' + port);
});
