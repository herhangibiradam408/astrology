"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

function ErrorComponent() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div>
      <Dialog open={isOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>An Error occurred</DialogTitle>
            <DialogDescription>Please try again.</DialogDescription>
            <Button
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Close
            </Button>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ErrorComponent;
