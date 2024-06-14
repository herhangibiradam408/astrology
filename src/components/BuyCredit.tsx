import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import PaymentComponent from "./PaymentComponent";
import { useSession } from "next-auth/react";

interface BuyCreditInterface {
  showBuyCredit: any;
  setShowBuyCredit: any;
  creditCount: any;
  setCreditCount: any;
}

function BuyCredit({
  showBuyCredit,
  setShowBuyCredit,
  creditCount,
  setCreditCount,
}: BuyCreditInterface) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  return (
    <div>
      <div>
        <Dialog open={showBuyCredit}>
          <DialogContent className="sm:max-w-[425px] max-h-screen overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">
                Insert token
              </DialogTitle>
              <DialogDescription>
                <div>
                  <PaymentComponent
                    isClicked={isClicked}
                    setIsClicked={setIsClicked}
                    creditCount={creditCount}
                    setCreditCount={setCreditCount}
                    showBuyCredit={showBuyCredit}
                    setShowBuyCredit={setShowBuyCredit}
                    isScriptLoaded={isScriptLoaded}
                    setIsScriptLoaded={setIsScriptLoaded}
                  />
                </div>
                <div
                  onClick={() => {
                    setIsScriptLoaded(false);
                    setShowBuyCredit(false);
                    setIsClicked(false);
                  }}
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default BuyCredit;
