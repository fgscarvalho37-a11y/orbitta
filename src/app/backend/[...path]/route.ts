import {
  NextRequest,
  NextResponse,
} from "next/server";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

const PRODUCTION_BACKEND_URL =
  "https://orbitta-api.onrender.com";

const BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? PRODUCTION_BACKEND_URL
    : process.env.ORBITTA_BACKEND_URL ??
      PRODUCTION_BACKEND_URL;

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

function buildUpstreamHeaders(
  request: NextRequest
) {
  const headers =
    new Headers();

  const forwardedHeaders = [
    "accept",
    "content-type",
    "cookie",
    "x-xsrf-token",
    "x-csrf-token",
  ];

  for (
    const name
    of forwardedHeaders
  ) {
    const value =
      request.headers.get(
        name
      );

    if (value) {
      headers.set(
        name,
        value
      );
    }
  }

  const country =
    request.headers.get(
      "x-vercel-ip-country"
    );

  // The public regional catalog respects the visitor's explicit market.
  // Other backend actions do not inherit an untrusted client market header.
  const requestedMarket = request.headers.get("x-orbitta-market")?.toUpperCase();
  const isPublicCatalog = request.nextUrl.pathname.startsWith("/backend/api/catalog/");
  const market = isPublicCatalog && requestedMarket &&
    ["BR", "US", "GB", "AU", "EU", "CA"].includes(requestedMarket)
      ? requestedMarket : (country?.toUpperCase() === "BR" ? "BR" : "US");
  headers.set("x-orbitta-market", market);

  const forwardedFor =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip");

  if (forwardedFor) {
    headers.set(
      "x-forwarded-for",
      forwardedFor
        .split(",")[0]
        .trim()
    );
  }

  headers.set(
    "x-forwarded-proto",
    "https"
  );

  return headers;
}

function normalizeSetCookie(
  value: string
) {
  return value.replace(
    /;\s*Domain=[^;]+/gi,
    ""
  );
}

function normalizeLocation(
  value: string
) {
  try {
    const backendUrl =
      new URL(BACKEND_URL);

    const target =
      new URL(
        value,
        backendUrl
      );

    if (
      target.origin ===
      backendUrl.origin
    ) {
      return (
        `/backend${target.pathname}` +
        target.search +
        target.hash
      );
    }

    return value;
  } catch {
    return value;
  }
}

async function proxyRequest(
  request: NextRequest,
  context: RouteContext
) {
  const {
    path,
  } =
    await context.params;

  const upstreamUrl =
    new URL(
      `/${path.join("/")}`,
      BACKEND_URL
    );

  upstreamUrl.search =
    request.nextUrl.search;

  const method =
    request.method.toUpperCase();

  const body =
    method === "GET" ||
    method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  let upstreamResponse:
    Response;

  try {
    upstreamResponse =
      await fetch(
        upstreamUrl,
        {
          method,
          headers:
            buildUpstreamHeaders(
              request
            ),
          body,
          cache: "no-store",
          redirect: "manual",
          signal:
            AbortSignal.timeout(
              25000
            ),
        }
      );

  } catch (
    firstError
  ) {
    /*
     * O Render pode levar alguns segundos para acordar.
     * Fazemos uma única nova tentativa antes de devolver
     * uma resposta tratada ao frontend.
     */
    try {
      await new Promise(
        (
          resolve
        ) =>
          setTimeout(
            resolve,
            900
          )
      );

      upstreamResponse =
        await fetch(
          upstreamUrl,
          {
            method,
            headers:
              buildUpstreamHeaders(
                request
              ),
            body,
            cache:
              "no-store",
            redirect:
              "manual",
            signal:
              AbortSignal.timeout(
                25000
              ),
          }
        );

    } catch (
      secondError
    ) {
      console.error(
        "[ORBITTA PROXY] Backend indisponível após nova tentativa."
      );

      return NextResponse.json(
        {
          message:
            "O servidor da Orbitta está iniciando ou temporariamente indisponível. Tente novamente em alguns segundos.",
        },
        {
          status: 503,
          headers: {
            "cache-control":
              "no-store",
            "retry-after":
              "5",
          },
        }
      );
    }
  }

  const responseBody =
    await upstreamResponse.arrayBuffer();

  const response =
    new NextResponse(
      responseBody,
      {
        status:
          upstreamResponse.status,
      }
    );

  const contentType =
    upstreamResponse.headers.get(
      "content-type"
    );

  if (contentType) {
    response.headers.set(
      "content-type",
      contentType
    );
  }

  const location =
    upstreamResponse.headers.get(
      "location"
    );

  if (location) {
    response.headers.set(
      "location",
      normalizeLocation(
        location
      )
    );
  }

  response.headers.set(
    "cache-control",
    "no-store, no-cache, must-revalidate"
  );

  const responseHeaders =
    upstreamResponse.headers as Headers & {
      getSetCookie?: () => string[];
    };

  const setCookies =
    typeof responseHeaders
      .getSetCookie === "function"
      ? responseHeaders
          .getSetCookie()
      : [];

  const cookiesToForward =
    setCookies.length > 0
      ? setCookies
      : (() => {
          const value =
            upstreamResponse
              .headers
              .get(
                "set-cookie"
              );

          return value
            ? [value]
            : [];
        })();

  for (
    const setCookie
    of cookiesToForward
  ) {
    response.headers.append(
      "set-cookie",
      normalizeSetCookie(
        setCookie
      )
    );
  }

  return response;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  return proxyRequest(
    request,
    context
  );
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  return proxyRequest(
    request,
    context
  );
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  return proxyRequest(
    request,
    context
  );
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  return proxyRequest(
    request,
    context
  );
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  return proxyRequest(
    request,
    context
  );
}

export async function OPTIONS() {
  return new NextResponse(
    null,
    {
      status: 204,
      headers: {
        "cache-control":
          "no-store",
      },
    }
  );
}
