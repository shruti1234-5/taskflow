"use client";

import { ThemeProvider } from "next-themes";
import { SnackbarProvider } from "notistack";

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} autoHideDuration={3000}>
        {children}
      </SnackbarProvider>
    </ThemeProvider>
  );
}
