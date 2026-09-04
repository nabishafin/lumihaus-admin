import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse } from "react-router";
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
        <AdminUIProvider>
          {children}
        </AdminUIProvider>
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
