type SecureFetchInit =
  RequestInit & {
    skipCsrf?: boolean;
  };

type CsrfPayload = {
  token: string;
  headerName: string;
};

const SAFE_METHODS =
  new Set([
    "GET",
    "HEAD",
    "OPTIONS",
  ]);

export async function secureFetch(
  input: RequestInfo | URL,
  init: SecureFetchInit = {}
) {
  const method =
    (
      init.method ??
      "GET"
    ).toUpperCase();

  if (
    SAFE_METHODS.has(
      method
    ) ||
    init.skipCsrf
  ) {
    const {
      skipCsrf: _skipCsrf,
      ...requestInit
    } = init;

    return fetch(
      input,
      requestInit
    );
  }

  const csrfResponse =
    await fetch(
      "/backend/api/csrf",
      {
        method: "GET",
        credentials:
          "include",
        cache: "no-store",
        headers: {
          Accept:
            "application/json",
        },
      }
    );

  if (!csrfResponse.ok) {
    throw new Error(
      "Não foi possível validar a segurança da solicitação."
    );
  }

  const csrf: CsrfPayload =
    await csrfResponse.json();

  const headers =
    new Headers(
      init.headers
    );

  headers.set(
    csrf.headerName,
    csrf.token
  );

  const {
    skipCsrf: _skipCsrf,
    ...requestInit
  } = init;

  return fetch(
    input,
    {
      ...requestInit,
      credentials:
        requestInit.credentials ??
        "include",
      headers,
    }
  );
}
