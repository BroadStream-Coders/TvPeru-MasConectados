import type { Metadata } from "next";
import { Libre_Franklin, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const libreFranklin = Libre_Franklin({
  variable: "--font-libre-franklin",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Más Conectados",
  description: "Colector y juego De Par en Par de Más Conectados, TV Perú.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${libreFranklin.variable} h-full`}
    >
      <body className="flex min-h-full flex-col tracking-[-0.006em]">
        {children}
      </body>
    </html>
  );
}
