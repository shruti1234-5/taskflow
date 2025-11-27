import "./globals.css";
import { Providers } from "./providers/providers";

export const metadata = {
  title: "TaskFlow",
  description: "Admin Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* 👇 ThemeProvider will control class="dark" here */}
      <body className="bg-gray-100 dark:bg-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
