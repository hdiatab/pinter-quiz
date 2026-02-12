import React, { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { Upload, Check, Eye, EyeOff } from "lucide-react";

import store from "@/store/store";
import { setUser as updateUser } from "@/store/auth/authSlice";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input, InputError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import DEFAULT_COVER from "@/assets/subtle-prism.svg";
import { AccountStats } from "@/components/account-stats";

type Inputs = {
  name: string;
  email: string;
  bio?: string;

  // reset password section
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

/* ===== password rules (copy from your register) ===== */
const hasLowercase = (v: string) => /[a-z]/.test(v);
const hasUppercase = (v: string) => /[A-Z]/.test(v);
const hasNumber = (v: string) => /\d/.test(v);
const hasSpecial = (v: string) => /[@$!%*?&]/.test(v);
const hasMinLen = (v: string) => v.length >= 8;

function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n);
}

function formatLastPlayed(ts?: number) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "—";
  }
}

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

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  // cover & avatar
  const [coverImage, setCoverImage] = useState<string>(DEFAULT_COVER);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // show/hide password
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, submitCount },
  } = useForm<Inputs>();

  const loggedInUserId = useMemo(() => {
    return localStorage.getItem("loggedInUser") || sessionStorage.getItem("loggedInUser");
  }, []);

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const found = users.find((u: { id: string }) => u.id === loggedInUserId);
    if (!found) return;

    setUser(found);
    setProfileImage(found?.profileImage || null);
    setCoverImage(found?.coverImage || DEFAULT_COVER);

    reset({
      name: found?.name ?? "",
      email: found?.email ?? "",
      bio: found?.bio ?? "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }, [loggedInUserId, reset]);

  const handleImageUpload = (setter: (v: string) => void) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  const newPasswordValue = watch("newPassword") || "";

  const rules = useMemo(() => {
    return {
      lower: hasLowercase(newPasswordValue),
      upper: hasUppercase(newPasswordValue),
      number: hasNumber(newPasswordValue),
      special: hasSpecial(newPasswordValue),
      minLen: hasMinLen(newPasswordValue),
    };
  }, [newPasswordValue]);

  const showRuleErrors = submitCount > 0 && !!errors.newPassword;

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (!user) return;

    // ===== handle reset password (optional) =====
    const wantsChangePassword = !!data.currentPassword || !!data.newPassword || !!data.confirmPassword;

    if (wantsChangePassword) {
      if (!data.currentPassword) {
        toast.error("Current password is required.");
        return;
      }
      if (data.currentPassword !== user.password) {
        toast.error("Current password is incorrect.");
        return;
      }
      if (!data.newPassword) {
        toast.error("New password is required.");
        return;
      }
      if (data.newPassword !== data.confirmPassword) {
        toast.error("Confirm password does not match.");
        return;
      }
      const ok =
        hasLowercase(data.newPassword) &&
        hasUppercase(data.newPassword) &&
        hasNumber(data.newPassword) &&
        hasSpecial(data.newPassword) &&
        hasMinLen(data.newPassword);

      if (!ok) {
        toast.error(
          "Password must be at least 8 characters with one uppercase letter, one lowercase letter, one digit, and one special character."
        );
        return;
      }
    }

    const updatedUser = {
      ...user,
      name: data.name ?? user.name,
      bio: data.bio ?? user.bio,
      profileImage,
      coverImage,
      // update password only if user changes it
      password: wantsChangePassword ? data.newPassword : user.password,
    };

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const updatedUsers = users.map((u: any) => (u.id === user.id ? updatedUser : u));
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    setUser(updatedUser);
    store.dispatch(updateUser(updatedUser));

    // clear password fields after save
    reset({
      name: updatedUser.name ?? "",
      email: updatedUser.email ?? "",
      bio: updatedUser.bio ?? "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    toast.success("Profile updated successfully!");
  };

  const onCancel = () => {
    if (!user) return;

    reset({
      name: user.name ?? "",
      email: user.email ?? "",
      bio: user.bio ?? "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setProfileImage(user?.profileImage || null);
    setCoverImage(user?.coverImage || DEFAULT_COVER);
    toast.message("Changes reverted.");
  };

  const coverInputId = "cover-upload";
  const avatarInputId = "avatar-upload";

  const g = user?.game ?? {};

  const quizzesPlayed = Number(g.quizzesPlayed ?? 0);
  const totalQuestions = Number(g.totalQuestions ?? 0);
  const totalAnswered = Number(g.totalAnswered ?? 0);
  const totalCorrect = Number(g.totalCorrect ?? 0);
  const totalWrong = Number(g.totalWrong ?? 0);
  const lastPlayedAt = typeof g.lastPlayedAt === "number" ? g.lastPlayedAt : undefined;

  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header card (cover + avatar) */}
      <Card className="overflow-hidden pt-0">
        <div
          className="relative h-32 bg-muted bg-cover bg-center sm:h-40"
          style={{ backgroundImage: `url("${coverImage}")` }}
        >
          <div className="absolute inset-0 bg-black/20" />

          <div className="absolute bottom-3 right-3 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => document.getElementById(coverInputId)?.click()}
            >
              <Upload className="mr-2 size-4" />
              Change Cover
            </Button>
          </div>

          <input
            id={coverInputId}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleImageUpload((v) => setCoverImage(v))}
          />
        </div>

        <CardContent className="px-6 -mt-12 pb-0 sm:-mt-14">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            {/* Avatar + upload */}
            <div className="relative">
              <div className="relative size-24 overflow-hidden rounded-full border-4 border-card shadow-lg sm:size-28">
                {profileImage ? (
                  <img src={profileImage} alt={user?.name ?? "Profile"} className="h-full w-full object-cover" />
                ) : (
                  <div className="bg-muted flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    No photo
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute -bottom-1 -right-1 size-8 rounded-full"
                onClick={() => document.getElementById(avatarInputId)?.click()}
              >
                <Upload className="size-4" />
              </Button>

              <input
                id={avatarInputId}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleImageUpload((v) => setProfileImage(v))}
              />
            </div>

            {/* Name + email */}
            <div className="space-y-1 text-center sm:pb-1 sm:text-left">
              <h3 className="text-lg font-semibold">{user?.name ?? "—"}</h3>
              <p className="text-sm text-muted-foreground">{user?.email ?? "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Account Stats</CardTitle>
          <CardDescription>Your level progress and total XP</CardDescription>
        </CardHeader>
        <CardContent>
          <AccountStats className="w-full" />
        </CardContent>
      </Card>

      {/* Game Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Game Summary</CardTitle>
          <CardDescription>Quick overview of your quiz performance</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Top row */}
          <div className="grid gap-3 grid-cols-2">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Accuracy</p>
              <p className="text-2xl font-semibold tabular-nums">{accuracy}%</p>
            </div>

            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Quizzes Played</p>
              <p className="text-2xl font-semibold tabular-nums">{formatNumber(quizzesPlayed)}</p>
            </div>
          </div>

          {/* Detail row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Answered</p>
              <p className="text-base font-semibold tabular-nums">{formatNumber(totalAnswered)}</p>
            </div>

            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Correct</p>
              <p className="text-base font-semibold tabular-nums">{formatNumber(totalCorrect)}</p>
            </div>

            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Wrong</p>
              <p className="text-base font-semibold tabular-nums">{formatNumber(totalWrong)}</p>
            </div>

            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Total Questions</p>
              <p className="text-base font-semibold tabular-nums">{formatNumber(totalQuestions)}</p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Last played: <span className="text-foreground">{formatLastPlayed(lastPlayedAt)}</span>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>This information will be displayed on your public profile</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" {...register("name", { required: "Name is required" })} disabled={!user} />
              <InputError message={errors.name?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} readOnly />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">About</Label>
              <Textarea
                id="bio"
                rows={4}
                placeholder="Tell others about yourself"
                {...register("bio")}
                disabled={!user}
              />
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password securely <br />
              (Only fill this section if you want to update your password.)
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* CURRENT PASSWORD */}
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPass ? "text" : "password"}
                  autoComplete="current-password"
                  className="pr-10"
                  placeholder="••••••••••"
                  disabled={!user}
                  {...register("currentPassword", {
                    validate: (v) => {
                      // optional: kalau user mulai ngisi salah satu field, current wajib
                      const np = watch("newPassword") || "";
                      const cp = watch("confirmPassword") || "";
                      const wants = !!np || !!cp || !!v;
                      if (!wants) return true;
                      if (!v) return "Current password is required";
                      return true;
                    },
                  })}
                />
                <button
                  type="button"
                  aria-label={showCurrentPass ? "Hide password" : "Show password"}
                  onClick={() => setShowCurrentPass((s) => !s)}
                  className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-2 grid place-items-center"
                  tabIndex={-1}
                  disabled={!user}
                >
                  {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <InputError message={errors.currentPassword?.message} />
            </div>

            {/* NEW PASSWORD */}
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPass ? "text" : "password"}
                  autoComplete="new-password"
                  className="pr-10"
                  placeholder="••••••••••"
                  disabled={!user}
                  {...register("newPassword", {
                    validate: (v) => {
                      const cur = watch("currentPassword") || "";
                      const conf = watch("confirmPassword") || "";
                      const wants = !!cur || !!conf || !!v;
                      if (!wants) return true;

                      const ok =
                        hasLowercase(v || "") &&
                        hasUppercase(v || "") &&
                        hasNumber(v || "") &&
                        hasSpecial(v || "") &&
                        hasMinLen(v || "");
                      return (
                        ok ||
                        "Password must be 8+ chars with uppercase, lowercase, number, and special character (@$!%*?&)"
                      );
                    },
                  })}
                />
                <button
                  type="button"
                  aria-label={showNewPass ? "Hide password" : "Show password"}
                  onClick={() => setShowNewPass((s) => !s)}
                  className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-2 grid place-items-center"
                  tabIndex={-1}
                  disabled={!user}
                >
                  {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <InputError message={errors.newPassword?.message} />

              {/* Rules list (only meaningful when user is changing password) */}
              <ul className="mt-1 grid gap-1">
                <RuleItem ok={rules.minLen} label="8+ characters" showErrors={showRuleErrors} />
                <RuleItem ok={rules.lower} label="Lowercase letter" showErrors={showRuleErrors} />
                <RuleItem ok={rules.upper} label="Uppercase letter" showErrors={showRuleErrors} />
                <RuleItem ok={rules.number} label="Number" showErrors={showRuleErrors} />
                <RuleItem ok={rules.special} label="Special character" showErrors={showRuleErrors} />
              </ul>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPass ? "text" : "password"}
                  autoComplete="new-password"
                  className="pr-10"
                  placeholder="••••••••••"
                  disabled={!user}
                  {...register("confirmPassword", {
                    validate: (val) => {
                      const cur = watch("currentPassword") || "";
                      const np = watch("newPassword") || "";
                      const wants = !!cur || !!np || !!val;

                      if (!wants) return true;

                      if (!val) return "Confirm Password is required";
                      if (np !== val) return "Your passwords do not match";
                      return true;
                    },
                  })}
                />

                <button
                  type="button"
                  aria-label={showConfirmPass ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirmPass((s) => !s)}
                  className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-2 grid place-items-center"
                  tabIndex={-1}
                  disabled={!user}
                >
                  {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <InputError message={errors.confirmPassword?.message} />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={!user}>
            Cancel
          </Button>
          <Button type="submit" disabled={!user}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
