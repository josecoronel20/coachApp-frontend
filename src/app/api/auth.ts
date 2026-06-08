import { CredentialsLogin, CredentialsRegister } from "@/types/authType";
import { requireApiUrl } from "@/config/env";

export const registerUser = async ({
  email,
  password,
  name,
  confirmPassword,
  inviteToken,
}: CredentialsRegister & { inviteToken?: string }) => {
  const API_URL = requireApiUrl();
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    body: JSON.stringify({ email, password, name, confirmPassword, inviteToken }),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  return response;
};

export const loginUser = async ({ email, password }: CredentialsLogin) => {
  const API_URL = requireApiUrl();
  const response = await fetch(
    `${API_URL}/api/auth/login`,
    {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response;
};

export const logoutUser = async () => {
  const API_URL = requireApiUrl();
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  return response;
};

export const isAuthenticated = async () => {
  const API_URL = requireApiUrl();
  const response = await fetch(`${API_URL}/api/auth/isAuthenticated`, {
    method: "GET",
    credentials: "include",
  });

  return response;
};