import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useSession } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-org";

import { Button } from "./ui/button";

interface PaymentInterface {
  creditCount: any;
  setCreditCount: any;
  showBuyCredit: any;
  setShowBuyCredit: any;
  isScriptLoaded: any;
  setIsScriptLoaded: any;
  isClicked: boolean;
  setIsClicked: any;
}
const PaymentComponent = ({
  creditCount,
  setCreditCount,
  showBuyCredit,
  setShowBuyCredit,
  isScriptLoaded,
  setIsScriptLoaded,
  isClicked,
  setIsClicked,
}: PaymentInterface) => {
  const { data: session } = useSession();
  const paypalRef = useRef<HTMLDivElement>(null);
  const [requestedCredit, setRequestedCredit] = useState(1);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);

  const addCredit = async function (requestedCredit: number) {
    if (session?.user) {
      const res = await fetch("/api/addCredit", {
        method: "POST",
        body: JSON.stringify({ userId: session?.user?.id, requestedCredit }),
      });
    }
  };
  useEffect(() => {
    if (isScriptLoaded && window.paypal && !paymentSuccessful && isClicked) {
      window.paypal
        .Buttons({
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              intent: "CAPTURE",
              purchase_units: [
                {
                  description: "token",
                  amount: {
                    currency_code: "USD",
                    value: requestedCredit,
                  },
                },
              ],
            });
          },
          onApprove: async (data: any, actions: any) => {
            const order = await actions.order.capture();
            console.log("successful order:", order);
            await addCredit(requestedCredit);
            setPaymentSuccessful(true);
          },
          onError: (err: any) => {
            console.error("PayPal Button Error:", err);
          },
        })
        .render(paypalRef.current);
    }
  }, [isClicked]);

  return (
    <div>
      <Script
        src="https://www.paypal.com/sdk/js?client-id=AcFXZ5aZULP7lieCdnSN5wX1ly1z_xWqdNyZov8wxycaBGoSWvMsQfY97gi-FkyWifHQqO9zBCS63Lgy&enable-funding=venmo&currency=USD"
        onLoad={() => {
          console.log("PayPal script loaded");
          setIsScriptLoaded(true);
        }}
      />
      {!paymentSuccessful && (
        <div>
          <div className="flex flex-col">
            <div className="flex gap-2 items-center justify-center">
              <Select
                onValueChange={(value: any) => {
                  setRequestedCredit(Number(value));
                }}
              >
                <SelectTrigger className="w-[60px]">
                  <SelectValue placeholder="1" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="7">7</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="9">9</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xl text-center my-5">
                TOKEN = ${requestedCredit}
              </p>
            </div>
            {!isClicked && (
              <Button
                onClick={() => {
                  setIsClicked(true);
                  setIsScriptLoaded(true);
                }}
                className="text-white bg-black"
              >
                BUY NOW
              </Button>
            )}
          </div>
          <div ref={paypalRef}></div>
        </div>
      )}
      <AlertDialog open={paymentSuccessful}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Payment successful</AlertDialogTitle>
            <AlertDialogDescription>
              {requestedCredit} TOKEN added to your account
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              className="bg-red-500"
              onClick={() => {
                setPaymentSuccessful(false);
                setCreditCount(creditCount + requestedCredit);
                setShowBuyCredit(false);
                setIsScriptLoaded(false);
              }}
            >
              Continue
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PaymentComponent;
