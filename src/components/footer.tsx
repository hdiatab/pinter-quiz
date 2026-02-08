import logo from "/fav-icon.png";
import { companyLink } from "@/constants/company.constant";
import { companySocial } from "@/constants/social.constant";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { LucideHeart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-400/0">
      <div className="container mx-auto py-8">
        <Separator />
        <div className="grid grid-cols-3 mb-4 items-center mt-8">
          <img src={logo} alt="logo" className="max-w-32 h-auto" />
          <div className="justify-self-end col-span-2 flex gap-12 text-right">
            <div>
              <h3 className="mb-4 text-xl px-3">Company</h3>
              <ul className="flex gap-2 flex-col">
                {companyLink.map((link) => (
                  <li key={link.name}>
                    <a href={link.url}>
                      <Button variant="link" size={"sm"}>
                        {link.name}
                      </Button>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-xl px-3">Social</h3>
              <ul className="flex gap-2 flex-col">
                {companySocial.map((link) => (
                  <li key={link.name}>
                    <a href={link.url}>
                      <Button variant="link" size={"sm"}>
                        {link.name}
                      </Button>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <Separator />
        <div className="flex justify-between mt-4">
          <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
          <p className="flex gap-2">
            With <LucideHeart className="text-primary" /> by HAB
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
