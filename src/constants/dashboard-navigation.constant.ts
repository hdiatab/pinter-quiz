import { BadgeQuestionMarkIcon, LayoutDashboardIcon, SettingsIcon, TrophyIcon, UserIcon } from "lucide-react";

const NAV_ITEMS = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Start Quiz",
    url: "/start-quiz",
    icon: BadgeQuestionMarkIcon,
  },
  {
    title: "Leaderboards",
    url: "/leaderboards",
    icon: TrophyIcon,
  },
  {
    title: "Account",
    url: "/account",
    icon: UserIcon,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: SettingsIcon,
  },
];

export { NAV_ITEMS };
