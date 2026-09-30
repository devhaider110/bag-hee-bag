import React from "react";

function PrivacyPolicy({ navigate }) {
  return (
    <div className="min-h-screen bg-[#faf8f4] text-[#1f1a17]">
      <section className="border-b border-black/10 bg-[#17120f] px-6 py-20 text-center text-white">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#d8b27c]">
          BAG HEE BAG
        </p>

        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Privacy Policy
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/70">
          Your privacy matters to us. This page explains how BAG HEE BAG
          collects, uses and protects your information.
        </p>
      </section>

      <main className="mx-auto max-w-4xl px-6 py-14">
        <div className="space-y-10 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5 md:p-10">
          <section>
            <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
            <p className="mt-3 leading-7 text-black/65">
              When you create an account, place an order, contact us or use
              our services, we may collect information such as your name,
              email address, phone number, delivery address and order details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
            <p className="mt-3 leading-7 text-black/65">
              Your information may be used to process orders, provide
              customer support, manage your account, communicate important
              order updates and improve the BAG HEE BAG shopping experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. Payment Information</h2>
            <p className="mt-3 leading-7 text-black/65">
              Payment transactions may be processed through third-party
              payment providers. BAG HEE BAG does not intentionally store
              sensitive payment credentials such as complete card numbers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. Cookies</h2>
            <p className="mt-3 leading-7 text-black/65">
              We may use cookies and similar technologies to maintain sessions,
              remember preferences and understand how visitors use our website.
              See our Cookie Policy for more information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. Data Security</h2>
            <p className="mt-3 leading-7 text-black/65">
              We use reasonable technical and organizational measures to help
              protect information handled through our website. However, no
              online service can guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. Your Choices</h2>
            <p className="mt-3 leading-7 text-black/65">
              You may contact BAG HEE BAG regarding your account information,
              communication preferences or privacy-related questions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">7. Contact Us</h2>
            <p className="mt-3 leading-7 text-black/65">
              For privacy-related questions, please contact BAG HEE BAG through
              our Contact page.
            </p>

            <button
              onClick={() => navigate("/contact")}
              className="mt-5 rounded-full bg-[#17120f] px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-black"
            >
              Contact BHB
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}

export default PrivacyPolicy;