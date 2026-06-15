export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  // Construct target URL for Google TTS
  const targetUrl = new URL("https://translate.googleapis.com/translate_tts");
  for (const [key, value] of searchParams.entries()) {
    targetUrl.searchParams.set(key, value);
  }

  // Create a clean request to avoid forwarding referer or origin headers that Google blocks
  const targetRequest = new Request(targetUrl.toString(), {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  try {
    const response = await fetch(targetRequest);
    
    // Copy the response to modify headers
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("Access-Control-Allow-Origin", "*");
    newResponse.headers.set("Cache-Control", "public, max-age=86400");
    return newResponse;
  } catch (err) {
    return new Response("Error fetching TTS from Google: " + err.message, { status: 500 });
  }
}
