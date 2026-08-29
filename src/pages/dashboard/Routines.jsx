import RoutineManager from "../../components/routines/RoutineManager";

export default function Routines() {
  return (
    <>
      <title>Lumihaus Admin · Skincare Bundles</title>
      <div className="page-heading">
        <div>
          <h1>Skincare Bundles</h1>
          <p>Create and customize 3-step German beauty routine bundles displayed on the customer storefront.</p>
        </div>
      </div>

      <section className="card">
        <RoutineManager />
      </section>
    </>
  );
}
