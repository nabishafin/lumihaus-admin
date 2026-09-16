import CouponForm from "../../components/coupons_banners/CouponForm";
import BannerUpload from "../../components/coupons_banners/BannerUpload";

export default function CouponsBanners() {
  return (
    <>
      <title>LumiHaus Admin · Marketing</title>
      <div className="page-heading">
        <div>
          <span className="page-kicker">GROWTH & CONFIGURATION</span>
          <h2>Marketing & storefront</h2>
          <p>Coupons, flash sales, routines, banners and customer-facing settings.</p>
        </div>
      </div>

      <div className="two-column">
        <section className="card">
          <div className="section-head">
            <div>
              <h2>Create coupon</h2>
              <p>Percentage or fixed BDT promotion</p>
            </div>
          </div>
          <CouponForm />
        </section>
        <section className="card">
          <div className="section-head">
            <div>
              <h2>Banner & flash sale</h2>
              <p>Schedule storefront campaigns</p>
            </div>
          </div>
          <BannerUpload />
        </section>
      </div>
    </>
  );
}
