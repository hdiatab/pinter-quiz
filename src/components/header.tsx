import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { HelpCircleIcon, LayoutDashboardIcon, LogOut, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useInitials } from "@/hooks/use-initials";

import { logout } from "@/store/auth/authSlice";
import { ModeToggle } from "./mode-toggle";

const Header = () => {
  const getInitials = useInitials();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector((state: any) => state.auth);

  const onClickLogout = () => {
    dispatch(logout());
    toast.info("Logout successful!");
    navigate("/");
  };

  return (
    <header className="sticky top-0 bg-background z-20 shadow dark:shadow-neutral-700">
      <div className="container mx-auto flex justify-between py-2 items-center">
        <Link aria-label="Go to homepage" to="/" className="flex items-center gap-2 hover:cursor-pointer">
          <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-full">
            <HelpCircleIcon className="size-7" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Pinter Quiz</span>
        </Link>

        <div className="justify-self-end flex gap-2 items-center relative">
          <ModeToggle />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-10 rounded-full p-1">
                  <Avatar className="size-8 overflow-hidden rounded-full">
                    <AvatarImage src={user.profileImage} alt={user.name} />
                    <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                      <AvatarImage src={user.profileImage} alt={user.name} />
                      <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link className="block w-full" to={"/home"}>
                      <LayoutDashboardIcon className="mr-2" />
                      Home
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link className="block w-full" to={"/account"}>
                      <User className="mr-2" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <button className="block w-full" onClick={() => onClickLogout()}>
                    <LogOut className="mr-2" />
                    Log out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to={"/login"}>
                <Button variant={"outline"} className="!shadow-none">
                  Login
                </Button>
              </Link>
              <Link to={"/register"}>
                <Button className="!shadow-none">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
