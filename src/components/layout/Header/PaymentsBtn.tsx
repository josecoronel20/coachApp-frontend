"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCoachStore } from "@/store/coachStore";
import { CreditCard } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const PaymentsBtn = () => {
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const { athletesInfo } = useCoachStore();

  const overduePaymentsCount =
    athletesInfo?.filter(
      (athlete) => new Date(athlete.paymentDate) < new Date()
    ).length || 0;

  const overduePaymentsList = athletesInfo?.filter(
    (athlete) => new Date(athlete.paymentDate) < new Date()
  );

  return (
    <Dialog open={paymentsOpen} onOpenChange={setPaymentsOpen}>
      <DialogTrigger asChild className="cursor-pointer">
        <Button variant="ghost" size="sm" className="relative">
          <CreditCard className="h-4 w-4" />
          {overduePaymentsCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {overduePaymentsCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cuotas Vencidas</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {overduePaymentsCount > 0 ? (
            overduePaymentsList?.map((athlete) => (
              <div
                key={athlete.id}
                className="border p-2 rounded-md border-gray-200 flex-col justify-between items-center gap-2"
              >
                <div className="flex gap-2">
                  <p className="font-semibold">{athlete.name}</p>
                  <p className="text-sm text-red-500">{athlete.paymentDate}</p>
                </div>

                <p>
                  venció hace{" "}
                  {Math.floor(
                    (new Date().getTime() -
                      new Date(athlete.paymentDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  días
                </p>

                <Link href={`/dashboard/athlete/${athlete.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full cursor-pointer"
                  >
                    Ir al perfil
                  </Button>
                </Link>
              </div>
            ))
          ) : (
            <p>No hay cuotas vencidas</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentsBtn;
