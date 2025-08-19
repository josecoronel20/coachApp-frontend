import { isAuthenticated } from "@/app/api/auth";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export const useMiddleware = () => {
const currentPath = usePathname();
const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await isAuthenticated();
      if (response.status !== 200) {
        console.log(response.status);
        if (currentPath !== "/auth/login" && currentPath !== "/auth/register") {
          router.push("/auth/login");
        }
      }
    };
    checkAuth();
  }, [currentPath, router]);
};