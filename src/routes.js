import { index, layout, route } from "@react-router/dev/routes";

export default [
  route("login", "pages/auth/Login.jsx"),
  route("forgot-password", "pages/auth/ForgotPassword.jsx"),
  route("verify-otp", "pages/auth/VerifyOtp.jsx"),
  route("reset-password", "pages/auth/ResetPassword.jsx"),
  layout("layouts/DashboardLayout.jsx", [
    index("pages/dashboard/Overview.jsx"),
    route("orders", "pages/dashboard/Orders.jsx"),
    route("products", "pages/dashboard/Products.jsx"),
    route("expenses", "pages/dashboard/Expenses.jsx"),
    route("bundles", "pages/dashboard/Routines.jsx"),
    route("categories-brands", "pages/dashboard/CategoriesBrands.jsx"),
    route("pre-orders", "pages/dashboard/PreOrders.jsx"),
    route("german-ritual", "pages/dashboard/GermanRitual.jsx"),
    route("payments-delivery", "pages/dashboard/PaymentsDelivery.jsx"),
    route("subscribers", "pages/dashboard/Subscribers.jsx"),
    route("pages/:pageSlug", "pages/dashboard/StorePageEditor.jsx"),
    route("settings", "pages/dashboard/Settings.jsx"),
  ]),
];
