import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse } from "react-router";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./redux/store";
import { AdminUIProvider } from "./context/AdminUIContext";
import "./styles.css";

export const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" },
];

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <Meta/>
        <Links/>
      </head>
      <body>
        <Provider store={store}>
          <AdminUIProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: "#241c21",
                  color: "#f5eaee",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  fontSize: "13px",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                },
                success: {
                  iconTheme: {
                    primary: "#d96b86",
                    secondary: "#fff",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#fff",
                  },
                },
              }}
            />
          </AdminUIProvider>
        </Provider>
        <ScrollRestoration/>
        <Scripts/>
      </body>
    </html>
  );
}

export default function App() { return <Outlet />; }

export function ErrorBoundary({ error }) {
  const title = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : "Something went wrong";
  return (
    <main className="error-page">
      <h1>{title}</h1>
      <p>{error?.message || "Please return to the dashboard and try again."}</p>
      <a className="button" href="/">Back to dashboard</a>
    </main>
  );
}
