import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            richColors
            closeButton
            theme="light"
            toastOptions={{
              classNames: {
                toast:
                  "rounded-xl border border-pst-steel-200 bg-white text-pst-navy-800 shadow-[var(--shadow-pst-card)]",
                title: "font-semibold",
                description: "text-pst-steel-500",
                actionButton: "bg-pst-navy-800 text-white",
                cancelButton: "bg-pst-steel-100 text-pst-navy-800",
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
