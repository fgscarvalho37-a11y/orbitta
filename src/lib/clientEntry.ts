const API_URL = "/backend";

type OpenCheckout = {
  id: number;
};

type ActiveProductCount = {
  activeProducts?: number;
};

export async function resolveClientEntryDestination() {
  const activeResponse = await fetch(
    `${API_URL}/api/client/products/count`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (
    activeResponse.status === 401 ||
    activeResponse.status === 403
  ) {
    return "/login";
  }

  if (activeResponse.ok) {
    const active:
      ActiveProductCount =
      await activeResponse.json();

    if (
      Number(
        active.activeProducts ?? 0
      ) > 0
    ) {
      return "/painel";
    }
  }

  const openResponse = await fetch(
    `${API_URL}/api/checkout/subscriptions/open`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (
    openResponse.status === 401 ||
    openResponse.status === 403
  ) {
    return "/login";
  }

  if (
    openResponse.ok &&
    openResponse.status !== 204
  ) {
    const text =
      await openResponse.text();

    if (text) {
      const checkout:
        OpenCheckout =
        JSON.parse(
          text
        );

      if (
        checkout?.id
      ) {
        return `/checkout/${checkout.id}`;
      }
    }
  }

  return "/produtos";
}
