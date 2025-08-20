const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const updatePaymentDate = async (id: string, paymentDate: string) => {
  const response = await fetch(`${API_URL}/api/protected/updatePaymentDate`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ paymentDate, id }),
  });
  return response;
};
