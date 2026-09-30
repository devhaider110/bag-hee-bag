import {
  useState,
} from "react";

import {
  createSupportTicket,
} from "../services/supportService";

const faqs = [
  {
    question:
      "How can I track my order?",
    answer:
      "Login to your BAG HEE BAG account and open My Orders. From there you can open an order and view its tracking information.",
  },
  {
    question:
      "Can I cancel my order?",
    answer:
      "If the order is still eligible for cancellation, you can request cancellation from the order details page.",
  },
  {
    question:
      "How can I request a return?",
    answer:
      "Open your order details and use the return request option if the product is eligible for return.",
  },
  {
    question:
      "How can I contact BAG HEE BAG?",
    answer:
      "You can call us, message us on WhatsApp, send an email, or create a support ticket using the contact form on this page.",
  },
  {
    question:
      "Can I mention my Order ID in a support request?",
    answer:
      "Yes. Order ID is optional, but adding it helps our support team identify your order quickly.",
  },
];

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    orderId: "",
    category: "GENERAL",
  });

  const [openFaq, setOpenFaq] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response =
        await createSupportTicket(
          form
        );

      const ticketNumber =
        response?.ticket
          ?.ticketNumber ||
        "your support ticket";

      setSuccess(
        `Your support request has been created successfully. Ticket: ${ticketNumber}`
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        orderId: "",
        category: "GENERAL",
      });
    } catch (err) {
      setError(
        err?.response?.data
          ?.message ||
          err?.message ||
          "Failed to create support ticket."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.14),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.08),transparent_35%)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#d4af37]">
            BAG HEE BAG
          </p>

          <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            How can we help?
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
            Have a question about an order,
            payment, delivery, return or
            product? Our support team is
            here to help.
          </p>
        </div>
      </section>

      {/* =====================================================
          CONTACT OPTIONS
      ===================================================== */}

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <a
            href="tel:+919876543210"
            className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-[#d4af37]/40 hover:bg-[#d4af37]/5"
          >
            <div className="mb-4 text-3xl">
              📞
            </div>

            <h2 className="font-bold">
              Call Us
            </h2>

            <p className="mt-2 text-xs leading-5 text-white/45">
              Speak directly with our support
              team.
            </p>
          </a>

          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noreferrer"
            className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-[#d4af37]/40 hover:bg-[#d4af37]/5"
          >
            <div className="mb-4 text-3xl">
              💬
            </div>

            <h2 className="font-bold">
              WhatsApp
            </h2>

            <p className="mt-2 text-xs leading-5 text-white/45">
              Message us directly on WhatsApp.
            </p>
          </a>

          <a
            href="mailto:support@bagheebag.com"
            className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-[#d4af37]/40 hover:bg-[#d4af37]/5"
          >
            <div className="mb-4 text-3xl">
              ✉️
            </div>

            <h2 className="font-bold">
              Email
            </h2>

            <p className="mt-2 text-xs leading-5 text-white/45">
              Send us your detailed query.
            </p>
          </a>

          <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 p-6">
            <div className="mb-4 text-3xl">
              🏪
            </div>

            <h2 className="font-bold">
              Physical Store
            </h2>

            <p className="mt-2 text-xs leading-5 text-white/45">
              Kothari Milestone, Shop No. 2,
              S.V. Road, Malad West,
              Mumbai.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          FORM + FAQ
      ===================================================== */}

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">

          {/* FORM */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-8">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37]">
                Support
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Contact Us
              </h2>

              <p className="mt-2 text-sm text-white/45">
                Create a support enquiry and
                our team will get back to you.
              </p>
            </div>

            {success && (
              <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">
                    Name *
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]/60"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">
                    Email *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]/60"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">
                    Phone
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]/60"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">
                    Order ID
                  </label>

                  <input
                    name="orderId"
                    value={form.orderId}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">
                    Category
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                  >
                    <option value="GENERAL">
                      General
                    </option>

                    <option value="ORDER">
                      Order
                    </option>

                    <option value="PAYMENT">
                      Payment
                    </option>

                    <option value="DELIVERY">
                      Delivery
                    </option>

                    <option value="RETURN">
                      Return
                    </option>

                    <option value="REFUND">
                      Refund
                    </option>

                    <option value="PRODUCT">
                      Product
                    </option>

                    <option value="ACCOUNT">
                      Account
                    </option>

                    <option value="OTHER">
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">
                    Subject *
                  </label>

                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    placeholder="How can we help?"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]/60"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">
                  Message *
                </label>

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={7}
                  placeholder="Describe your issue..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition focus:border-[#d4af37]/60"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#d4af37] px-5 py-3.5 text-sm font-bold text-black transition hover:bg-[#e5c85b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Creating Ticket..."
                  : "Create Support Ticket"}
              </button>
            </form>
          </div>

          {/* FAQ */}

          <div>
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37]">
                FAQ
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map(
                (
                  faq,
                  index
                ) => {
                  const isOpen =
                    openFaq === index;

                  return (
                    <div
                      key={
                        faq.question
                      }
                      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenFaq(
                            isOpen
                              ? null
                              : index
                          )
                        }
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      >
                        <span className="text-sm font-semibold">
                          {
                            faq.question
                          }
                        </span>

                        <span className="shrink-0 text-[#d4af37]">
                          {isOpen
                            ? "−"
                            : "+"}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="border-t border-white/10 px-5 py-4 text-sm leading-6 text-white/50">
                          {
                            faq.answer
                          }
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;