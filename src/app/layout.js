// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/client-layout";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata = {
  title: "Galaxy",
  description: "resetting the universe through an explosion",
};

// export default function RootLayout({  }) {
//   return <></>
//     // <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
//     //   <body>{children}</body>
//     // </html>
  
// }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}