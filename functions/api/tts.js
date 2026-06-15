export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Build target URL for Google Translate TTS
  const targetUrl = new URL("https://translate.googleapis.com/translate_tts");
  for (const [key, value] of url.searchParams.entries()) {
    targetUrl.searchParams.set(key, value);
  }
  // Always force client=gtx for the API endpoint
  targetUrl.searchParams.set("client", "gtx");

  try {
    const response = await fetch(targetUrl.toString(), {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return new Response(`Google TTS returned status ${response.status}`, {
        status: response.status,
      });
    }

    // Stream the audio bytes back to the client with correct CORS headers
    const newResponse = new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "audio/mpeg",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400",
      },
    });
    return newResponse;
  } catch (err) {
    return new Response("TTS proxy error: " + err.message, { status: 502 });
  }
}
