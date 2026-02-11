import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { Upload } from "lucide-react";

import store from "@/store/store";
import { setUser as updateUser } from "@/store/auth/authSlice";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// kalau project kamu punya textarea shadcn, pakai ini:
import { Textarea } from "@/components/ui/textarea"; // <-- kalau error, hapus import ini + pakai fallback textarea di bawah

type Inputs = {
  name: string;
  email: string;
  password?: string;
  bio?: string;
};

import DEFAULT_COVER from "@/assets/subtle-prism.svg";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  // cover & avatar
  const [coverImage, setCoverImage] = useState<string>(DEFAULT_COVER);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<Inputs>();

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

    // set default values untuk form
    reset({
      name: found?.name ?? "",
      email: found?.email ?? "",
      bio: found?.bio ?? "",
      password: "",
    });
  }, [loggedInUserId, reset]);

  const handleImageUpload = (setter: (v: string) => void) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      name: data.name ?? user.name,
      bio: data.bio ?? user.bio,
      password: data.password ? data.password : user.password,
      profileImage,
      coverImage,
    };

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const updatedUsers = users.map((u: any) => (u.id === user.id ? updatedUser : u));
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    setUser(updatedUser);
    store.dispatch(updateUser(updatedUser));
    toast.success("Profile updated successfully!");
  };

  const onCancel = () => {
    if (!user) return;
    reset({
      name: user.name ?? "",
      email: user.email ?? "",
      bio: user.bio ?? "",
      password: "",
    });
    setProfileImage(user?.profileImage || null);
    setCoverImage(user?.coverImage || DEFAULT_COVER);
    toast.message("Changes reverted.");
  };

  // ids untuk input file (biar bisa trigger dari button)
  const coverInputId = "cover-upload";
  const avatarInputId = "avatar-upload";

  return (
    <div className="max-w-2xl space-y-6 w-full mx-auto">
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
              className="shadow-md"
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
                className="absolute -bottom-1 -right-1 size-8 rounded-full shadow-md"
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

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>This information will be displayed on your public profile</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" {...register("name")} disabled={!user} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} readOnly />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">About</Label>

            {/* kalau Textarea shadcn tidak ada, ganti bagian ini dengan <textarea ...> */}
            <Textarea
              id="bio"
              rows={4}
              placeholder="Tell others about yourself"
              {...register("bio")}
              disabled={!user}
            />

            <p className="text-xs text-muted-foreground">You can use markdown for formatting</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">New Password (optional)</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register("password")}
              disabled={!user}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions (bottom right like example) */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={!user}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit(onSubmit)} disabled={!user}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
