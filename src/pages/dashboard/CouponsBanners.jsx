import BannerUpload from "../../components/coupons_banners/BannerUpload";

export default function CouponsBanners() {
  return (
    <>
      <title>LumiHaus Admin · Marketing & Banners</title>
      <div className="page-heading">
        <div>
          <span className="page-kicker">GROWTH & CAMPAIGNS</span>
          <h2>Marketing & Campaigns</h2>
          <p>Homepage banners, flash sales, and customer-facing promotions.</p>
        </div>
      </div>

      <div className="max-w-3xl">
        <section className="card">
          <div className="section-head">
            <div>
              <h2>Banner & Flash Sale Campaign</h2>
              <p>Schedule storefront hero banners and promotional flash sale timers.</p>
            </div>
          </div>
          <BannerUpload />
        </section>
      </div>
    </>
  );
}
