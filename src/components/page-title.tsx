import { useEffect } from "react";

const PageTitle = ({ title }: { title: string }) => {
  useEffect(() => {
    document.title = title + " | Pinter Quiz";
  }, [title]);

  return null;
};

export default PageTitle;
