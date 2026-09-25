import {
  NextRequest,
  NextResponse,
} from "next/server";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

const BACKEND_URL =
  process.env.ORBITTA_BACKEND_URL ??
  "https://orbitta-api.onrender.com";

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
        "[ORBITTA PROXY] Backend indisponível:",
        firstError,
        secondError
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

  for (
    const name
    of [
      "content-type",
      "location",
    ]
  ) {
    const value =
      upstreamResponse
        .headers
        .get(
          name
        );

    if (value) {
      response.headers.set(
        name,
        value
      );
    }
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

  response.headers.set(
    "x-orbitta-backend-proxy",
    "active"
  );

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
