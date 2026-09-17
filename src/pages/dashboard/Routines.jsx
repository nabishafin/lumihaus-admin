import RoutineManager from "../../components/coupons_banners/RoutineManager";

export default function Routines() {
  return (
    <>
      <title>LumiHaus Admin · Skincare Bundles</title>
      <div className="page-heading">
        <div>
          <span className="page-kicker">STOREFRONT REGIMEN & BUNDLES</span>
          <h2>Skincare Bundles</h2>
          <p>Create and customize 3-step German beauty routine bundles displayed on the customer storefront.</p>
        </div>
      </div>

      <section className="card">
        <RoutineManager />
      </section>
    </>
  );
}
