#!/usr/bin/env node
import http from "http";
import fetch from "node-fetch";

const port = process.argv[2] === "--port" ? process.argv[3] : undefined;
const origin = process.argv[4] === "--origin" ? process.argv[5] : undefined;

if (!port || !origin) {
  console.log("Please provide port and origin");
  process.exit(1);
}

// Start a server on the specified port
const server = http.createServer(async (req, res) => {
  try {
    // Forward the request to the origin server
    const proxyReq = origin + req.url;
    const proxyRes = await fetch(proxyReq);

    // Get the content type from the origin server's response
    const contentType = proxyRes.headers.get("content-type");

    // Set the status code and headers from the origin server's response
    res.writeHead(proxyRes.status, proxyRes.headers);

    // If the response is JSON, parse and stringify it
    if (contentType && contentType.includes("application/json")) {
      const proxyResJson = await proxyRes.json();
      res.end(JSON.stringify(proxyResJson));
    } else {
      // For non-JSON responses, just pipe the response directly
      proxyRes.body.pipe(res);
    }
  } catch (error) {
    console.error("Error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
