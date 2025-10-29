import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import AppLogo from "@/components/AppLogo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/lib/React Query/auth";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const signInFormSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string(),
});

export default function SigninPage() {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof signInFormSchema>>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutateAsync: login, isPending: isLoggingIn } = useLogin();

  async function onSubmit(values: z.infer<typeof signInFormSchema>) {
    await login(values);
  }

  return (
    <div className="w-full h-screen flex items-center justify-center">
      {/* form container */}
      <div className="w-3/4 bg-slate-100 rounded-md border border-slate-300 shadow px-16 py-16 space-y-4 md:w-2/4 xl:w-2/5">
        {/* logo and app name */}
        <AppLogo />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="md:text-base">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      {...field}
                      className="text-sm md:text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className="md:text-base">Password</FormLabel>
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...field}
                      className="text-sm md:text-base"
                    />
                  </FormControl>

                  {!showPassword ? (
                    <Eye
                      className="size-4 md:size-5 text-black absolute right-2 bottom-[10px] md:bottom-[8px]"
                      onClick={() => setShowPassword(true)}
                    />
                  ) : (
                    <EyeOff
                      className="size-4 md:size-5 text-black absolute right-2 bottom-[10px] md:bottom-[8px]"
                      onClick={() => setShowPassword(false)}
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-center">
              <Button
                type="submit"
                className="bg-sky-500 text-sm px-8 hover:bg-sky-600 md:text-base disabled:bg-slate-300"
                disabled={isLoggingIn}
              >
                Login
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
