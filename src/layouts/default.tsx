import Footer from "@/components/footer";
import Header from "@/components/header";
import { Outlet } from "react-router";

const DefaultLayout = () => {
  return (
    <>
      <Header />
      <main className="grow pt-8">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default DefaultLayout;
