import { CredentialsLogin, CredentialsRegister } from "@/types/authType";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const registerUser = async ({
  email,
  password,
  name,
  confirmPassword,
}: CredentialsRegister) => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    body: JSON.stringify({ email, password, name, confirmPassword }),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  return response;
};

export const loginUser = async ({ email, password }: CredentialsLogin) => {
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
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  return response;
};

export const isAuthenticated = async () => {
  const response = await fetch(`${API_URL}/api/auth/isAuthenticated`, {
    method: "GET",
    credentials: "include",
  });

  return response;
};