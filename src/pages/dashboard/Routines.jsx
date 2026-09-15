import RoutineManager from "../../components/coupons_banners/RoutineManager";

export default function Routines() {
  return (
    <>
      <title>LumiHaus Admin · German Skin Routines</title>
      <div className="page-heading">
        <div>
          <span className="page-kicker">STOREFRONT REGIMEN BUILDER</span>
          <h2>3-Step Skin Routine Bundles</h2>
          <p>Create and customize 3-step German beauty routine sets displayed on the customer storefront.</p>
        </div>
      </div>

      <section className="card">
        <RoutineManager />
      </section>
    </>
  );
}
