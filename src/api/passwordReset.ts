import { endpoints } from "./endpoints";

type PasswordResetConfirmPayload = {
  uid: string;
  token: string;
  password: string;
  confirm_password: string;
};

const getResponseError = async (response: Response, fallback: string) => {
  const data = await response.json().catch(() => null);

  if (!data || typeof data !== "object") {
    return fallback;
  }

  const record = data as Record<string, string | string[]>;
  const fields = [
    record.detail,
    record.email,
    record.password,
    record.confirm_password,
    record.token,
    record.uid,
    record.non_field_errors,
  ];

  for (const field of fields) {
    if (typeof field === "string" && field) return field;
    if (Array.isArray(field) && field[0]) return field[0];
  }

  return fallback;
};

export async function requestPasswordReset(email: string, fallbackError: string) {
  const response = await fetch(endpoints.passwordReset, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(await getResponseError(response, fallbackError));
  }
}

export async function confirmPasswordReset(
  payload: PasswordResetConfirmPayload,
  fallbackError: string
) {
  const response = await fetch(endpoints.passwordResetConfirm, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getResponseError(response, fallbackError));
  }
}
