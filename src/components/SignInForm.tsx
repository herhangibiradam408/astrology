import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Spinner from "./Spinner";
import { X } from "lucide-react";
import { z } from "zod";
interface SignInFormProps {
  showForm: any;
  setShowForm: any;
}
const emailSchema = z.object({
  email: z.string().email(),
});
function SignInForm({ showForm, setShowForm }: SignInFormProps) {
  const [emailAddress, setEmailAddress] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isCustomLoading, setIsCustomLoading] = useState(false);
  const validateEmailWithZod = (email: string) => {
    try {
      emailSchema.parse({ email });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("email", {
      email: emailAddress,
      redirect: false,
    });
    if (result?.ok) {
      setIsDisabled(true);
      setIsButtonDisabled(true);
    }
  };

  const handleCustomEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmailWithZod(emailAddress)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setIsCustomLoading(true);
    const result = await signIn("email", {
      email: emailAddress,
      redirect: false,
    });

    if (result?.ok) {
      setIsCustomLoading(false);
      setIsSent(true);
    } else {
      setIsCustomLoading(false);
      setEmailError("Failed to send the magic link.");
    }
  };
  return (
    <div>
      {!isSent ? (
        <div>
          <Dialog open={showForm}>
            <DialogContent className="sm:max-w-[425px] max-h-min overflow-auto text-xl">
              <DialogHeader>
                <DialogTitle className="text-center tracking-wide text-2xl">
                  <p className="font-bold">Are You HUMAN?</p>
                  Please Verify.
                </DialogTitle>
                <DialogDescription>
                  <div className="mt-6 tracking-wide">
                    <form onSubmit={handleEmailSignIn}>
                      <div className="mb-4">
                        <label
                          htmlFor="email"
                          className="block font-medium text-gray-700 text-xl"
                        >
                          Email Address
                        </label>
                        <div className="mt-1">
                          <Input
                            id="email"
                            type="email"
                            value={emailAddress}
                            onChange={(e) => {
                              setEmailAddress(e.target.value);
                            }}
                            placeholder="name@example.com"
                            className="w-full border-gray-300 rounded-md shadow-sm text-xl focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={!isSent && isCustomLoading}
                        onClick={handleCustomEmailSignIn}
                        className="w-full tracking-wide text-xl bg-[#FF0000] text-white py-2 px-4 rounded-md hover:bg-[#FF0000] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        {isCustomLoading ? <Spinner /> : "Sign in with Email"}
                      </Button>
                    </form>
                    <div className="mt-3">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Button
                          onClick={() => {
                            signIn("google");
                            setShowForm(false);
                          }}
                          className="w-full bg-[#FF0000] text-gray-600 py-2 px-4 border border-gray-300 rounded-md hover:bg-[#FF0000] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <div className="flex text-xl items-center justify-center tracking-wide text-white">
                            Continue with google
                          </div>
                        </Button>
                        <div
                          onClick={() => setShowForm(false)}
                          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                        >
                          <span className="sr-only">Close</span>
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() => setShowForm(false)}
                      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div>
          <Dialog open={showForm}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-center text-2xl">
                  <p className="font-bold">Are You HUMAN?</p>
                  Please Verify.
                </DialogTitle>
                <DialogDescription>
                  <div className="text-xl">
                    Link has been sent. Please check your e-mail.
                  </div>
                  <div
                    onClick={() => setShowForm(false)}
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
      )}
    </div>
  );
}

export default SignInForm;
