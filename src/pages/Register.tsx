import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { v4 as uuid } from "uuid";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { LoaderCircle, Check, Eye, EyeOff } from "lucide-react";

import PageTitle from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { Input, InputError } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Inputs = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const hasLowercase = (v: string) => /[a-z]/.test(v);
const hasUppercase = (v: string) => /[A-Z]/.test(v);
const hasNumber = (v: string) => /\d/.test(v);
const hasSpecial = (v: string) => /[@$!%*?&]/.test(v);
const hasMinLen = (v: string) => v.length >= 8;

function RuleItem({ ok, label, showErrors }: { ok: boolean; label: string; showErrors: boolean }) {
  const colorClass = ok ? "text-green-600" : showErrors ? "text-red-600" : "text-muted-foreground";

  const bulletClass = ok ? "border-green-600" : showErrors ? "border-red-600" : "border-muted-foreground/40";

  return (
    <li className={`flex items-center gap-2 text-xs ${colorClass}`}>
      <span className={`grid h-4 w-4 place-items-center rounded-full border ${bulletClass}`}>
        {ok ? <Check className="h-3 w-3" /> : <span className="h-1 w-1 rounded-full bg-current" />}
      </span>
      <span>{label}</span>
    </li>
  );
}

const Register = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, submitCount },
    watch,
    reset,
  } = useForm<Inputs>();

  const passwordValue = watch("password") || "";

  const rules = useMemo(() => {
    return {
      lower: hasLowercase(passwordValue),
      upper: hasUppercase(passwordValue),
      number: hasNumber(passwordValue),
      special: hasSpecial(passwordValue),
      minLen: hasMinLen(passwordValue),
    };
  }, [passwordValue]);

  const showRuleErrors = submitCount > 0 && !!errors.password;

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");

      const isEmailExist = existingUsers.some((user: { email: string }) => user.email === data.email);
      if (isEmailExist) {
        toast.error("Email is already registered. Please use another email.");
        setIsLoading(false);
        return;
      }

      const newUser = {
        id: uuid(),
        name: data.name,
        email: data.email,
        password: data.password,
      };
      existingUsers.push(newUser);

      localStorage.setItem("users", JSON.stringify(existingUsers));

      toast.success("Registration successful!");
      setIsLoading(false);
      reset();
      navigate("/login");
    }, 2000);

    return () => clearTimeout(timer);
  };

  return (
    <>
      <PageTitle title="Register" />
      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              autoFocus
              tabIndex={1}
              placeholder="John Doe"
              {...register("name", { required: "Name is required" })}
              disabled={isLoading}
              autoComplete="name"
            />
            <InputError message={errors.name?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              tabIndex={2}
              placeholder="email@example.com"
              {...register("email", { required: "Email is required", pattern: /^\S+@\S+$/i })}
              disabled={isLoading}
              autoComplete="email"
            />
            <InputError message={errors.email?.message} />
          </div>

          {/* PASSWORD 1 */}
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
            </div>

            <div className="relative">
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                tabIndex={3}
                {...register("password", {
                  required: "Password is required",
                  validate: (v) => {
                    const ok = hasLowercase(v) && hasUppercase(v) && hasNumber(v) && hasSpecial(v) && hasMinLen(v);
                    return (
                      ok ||
                      "Password must be at least 8 characters with one uppercase letter, one lowercase letter, one digit, and one special character"
                    );
                  },
                })}
                placeholder="Password"
                disabled={isLoading}
                autoComplete="new-password"
                className="pr-10"
              />

              <button
                type="button"
                aria-label={showPass ? "Hide password" : "Show password"}
                onClick={() => setShowPass((s) => !s)}
                className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-2 grid place-items-center"
                tabIndex={-1}
                disabled={isLoading}
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <InputError message={errors.password?.message} />

            {/* Rules list */}
            <ul className="mt-1 grid gap-1">
              <RuleItem ok={rules.minLen} label="8+ characters" showErrors={showRuleErrors} />
              <RuleItem ok={rules.lower} label="Lowercase letter" showErrors={showRuleErrors} />
              <RuleItem ok={rules.upper} label="Uppercase letter" showErrors={showRuleErrors} />
              <RuleItem ok={rules.number} label="Number" showErrors={showRuleErrors} />
              <RuleItem ok={rules.special} label="Special character" showErrors={showRuleErrors} />
            </ul>
          </div>

          {/* PASSWORD 2 */}
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
            </div>

            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPass ? "text" : "password"}
                tabIndex={4}
                {...register("confirmPassword", {
                  required: "Confirm Password is required",
                  validate: (val: string) => {
                    if (passwordValue !== val) return "Your passwords do not match";
                    return true;
                  },
                })}
                placeholder="Confirm Password"
                disabled={isLoading}
                autoComplete="new-password"
                className="pr-10"
              />

              <button
                type="button"
                aria-label={showConfirmPass ? "Hide password" : "Show password"}
                onClick={() => setShowConfirmPass((s) => !s)}
                className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-2 grid place-items-center"
                tabIndex={-1}
                disabled={isLoading}
              >
                {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <InputError message={errors.confirmPassword?.message} />
          </div>

          <Button type="submit" className="mt-4 w-full" tabIndex={5} disabled={isLoading}>
            {isLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
            Create account
          </Button>
        </div>

        <div className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <Link to={"/login"} tabIndex={5} className="hover:underline">
            Log in
          </Link>
        </div>
      </form>
    </>
  );
};

export default Register;
