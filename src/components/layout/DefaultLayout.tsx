import { Header } from "./Header";
import { Footer } from "./Footer";

/**
 * Базовая обёртка витрины: стандартная шапка + контент + стандартный футер.
 */
export function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
