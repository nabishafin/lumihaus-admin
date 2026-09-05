import { index, layout, route } from "@react-router/dev/routes";

export default [
  route("login", "pages/auth/Login.jsx"),
  route("forgot-password", "pages/auth/ForgotPassword.jsx"),
  route("verify-otp", "pages/auth/VerifyOtp.jsx"),
  route("reset-password", "pages/auth/ResetPassword.jsx"),
  layout("layouts/DashboardLayout.jsx", [
    index("pages/dashboard/Overview.jsx"),
    route("products", "pages/dashboard/Products.jsx"),
    route("categories-brands", "pages/dashboard/CategoriesBrands.jsx"),
    route("orders", "pages/dashboard/Orders.jsx"),
    route("pre-orders", "pages/dashboard/PreOrders.jsx"),
    route("customers", "pages/dashboard/Customers.jsx"),
    route("payments-delivery", "pages/dashboard/PaymentsDelivery.jsx"),
    route("coupons-banners", "pages/dashboard/CouponsBanners.jsx"),
    route("reports", "pages/dashboard/Reports.jsx"),
    route("settings", "pages/dashboard/Settings.jsx"),
  ]),
];
