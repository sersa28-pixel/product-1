export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const apiKey = env.FREEPIK_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing Freepik API key" }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }

  const url = new URL(request.url);
  const term = (url.searchParams.get("term") || "lotto").trim();
  const limitRaw = parseInt(url.searchParams.get("limit") || "8", 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 24) : 8;

  const apiUrl = new URL("https://api.freepik.com/v1/resources");
  apiUrl.searchParams.set("term", term);
  apiUrl.searchParams.set("limit", String(limit));
  apiUrl.searchParams.set("order", "relevance");

  const resp = await fetch(apiUrl.toString(), {
    headers: {
      "x-freepik-api-key": apiKey,
      "Accept-Language": "ko-KR"
    }
  });

  const data = await resp.json().catch(() => ({}));

  return new Response(JSON.stringify(data), {
    status: resp.status,
    headers: {
      "content-type": "application/json",
      "cache-control": "max-age=300"
    }
  });
}
