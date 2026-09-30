import React from "react";

function Returns({ navigate }) {
  return (
    <div className="min-h-screen bg-[#faf8f4] text-[#1f1a17]">
      <section className="border-b border-black/10 bg-[#17120f] px-6 py-20 text-center text-white">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#d8b27c]">
          BAG HEE BAG
        </p>

        <h1 className="text-4xl font-semibold md:text-5xl">
          Return & Refund Policy
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/70">
          Our return process and important information regarding refunds.
        </p>
      </section>

      <main className="mx-auto max-w-4xl px-6 py-14">
        <div className="space-y-10 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5 md:p-10">
          <section>
            <h2 className="text-2xl font-semibold">1. Return Eligibility</h2>
            <p className="mt-3 leading-7 text-black/65">
              Return eligibility depends on the product condition and the
              applicable return conditions associated with your order.
              Products should generally be unused and returned with their
              original packaging where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. Return Request</h2>
            <p className="mt-3 leading-7 text-black/65">
              Customers should submit a return request through the available
              order or support functionality and provide the requested reason
              and information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. Product Condition</h2>
            <p className="mt-3 leading-7 text-black/65">
              Returned products may be inspected before a return or refund is
              approved. Items that do not meet the applicable return
              requirements may be rejected.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. Refunds</h2>
            <p className="mt-3 leading-7 text-black/65">
              Once a refund is approved, the refund process will depend on the
              original payment method and applicable payment-provider
              processing timelines.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. Damaged or Incorrect Items</h2>
            <p className="mt-3 leading-7 text-black/65">
              If you receive an incorrect or visibly damaged product, contact
              BAG HEE BAG support with the relevant order information and
              supporting details as soon as possible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. Need Help?</h2>
            <p className="mt-3 leading-7 text-black/65">
              Our support team can help you with return and refund questions.
            </p>

            <button
              onClick={() => navigate("/contact")}
              className="mt-5 rounded-full bg-[#17120f] px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5"
            >
              Contact BHB
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Returns;