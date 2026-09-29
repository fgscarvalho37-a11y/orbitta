const apiUrl =
  (
    process.env.ORBITTA_API_URL ||
    "https://orbitta-api.onrender.com"
  ).replace(/\/$/, "");

const secret =
  process.env.ORBITTA_RENEWAL_CRON_SECRET;

if (!secret) {
  throw new Error(
    "ORBITTA_RENEWAL_CRON_SECRET is required."
  );
}

const response = await fetch(
  `${apiUrl}/api/internal/renewal-emails/run`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      Accept: "application/json",
    },
  }
);

const body = await response.text();

console.log(
  `Renewal email scan: ${response.status} ${body}`
);

if (!response.ok) {
  process.exitCode = 1;
}
