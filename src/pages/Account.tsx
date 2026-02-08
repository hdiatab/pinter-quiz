import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import store from "@/store/store";
import { setUser as updateUser } from "@/store/auth/authSlice";

type Inputs = {
  name: string;
  email: string;
  password?: string;
};

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<Inputs>();

  useEffect(() => {
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const loggedInUser = localStorage.getItem("loggedInUser") || sessionStorage.getItem("loggedInUser");
    const foundUser = existingUsers.find((user: { id: string }) => user.id === loggedInUser);

    console.log(foundUser);
    console.log(loggedInUser);
    console.log(existingUsers);
    console.log(existingUsers[0].id);

    if (loggedInUser) {
      setUser(foundUser);
      setProfileImage(foundUser?.profileImage || null);
    }
  }, [reset]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      password: data.password ? data.password : user.password,
      profileImage,
    };

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const updatedUsers = users.map((u: any) => (u.id === user.id ? updatedUser : u));
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    setUser(updatedUser);
    store.dispatch(updateUser(updatedUser));
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="max-w-lg mx-auto p-6 border-muted border">
      <h2 className="text-2xl font-bold mb-4 text-center">Profile</h2>

      <div className="flex justify-center mb-4">
        {profileImage ? (
          <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600">No Image</span>
          </div>
        )}
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" type="text" disabled value={user?.name || ""} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" disabled value={user?.email || ""} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">New Password (optional)</Label>
          <Input
            id="password"
            type="password"
            {...register("password")}
            placeholder="••••••••"
            autoComplete="password"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="profileImage">Profile Image</Label>
          <Input id="profileImage" type="file" accept="image/*" onChange={handleImageUpload} />
        </div>

        <Button type="submit" className="w-full">
          Update Profile
        </Button>
      </form>
    </div>
  );
};

export default Profile;
