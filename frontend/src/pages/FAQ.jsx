import React, { useState } from "react";

const faqItems = [
  {
    question: "How can I place an order?",
    answer:
      "Browse the available bags, open the product you want, add it to your cart and continue through checkout to complete your order.",
  },
  {
    question: "Can I track my order?",
    answer:
      "When tracking information is available, you can use the order tracking functionality to view the current status of your shipment.",
  },
  {
    question: "What payment methods are available?",
    answer:
      "Available payment methods are displayed during checkout. The available options may depend on the current configuration of BAG HEE BAG.",
  },
  {
    question: "Can I return a product?",
    answer:
      "Returns are subject to the applicable return conditions for the order. Please review the Return & Refund Policy before submitting a request.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Delivery time depends on the destination, courier availability and other logistical factors. Estimated information is shown where available.",
  },
  {
    question: "What should I do if I receive a damaged item?",
    answer:
      "Please contact BAG HEE BAG support as soon as possible and provide your order information along with relevant details about the issue.",
  },
  {
    question: "Can I update my delivery address?",
    answer:
      "Address changes may depend on the current order status. Contact support as soon as possible if you need to correct delivery information.",
  },
  {
    question: "How can I contact BAG HEE BAG?",
    answer:
      "You can reach BAG HEE BAG through the Contact page available from the website footer and navigation.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen bg-[#faf8f4] text-[#1f1a17]">
      <section className="border-b border-black/10 bg-[#17120f] px-6 py-20 text-center text-white">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#d8b27c]">
          BAG HEE BAG
        </p>

        <h1 className="text-4xl font-semibold md:text-5xl">
          Frequently Asked Questions
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/70">
          Find answers to some of the most common BAG HEE BAG questions.
        </p>
      </section>

      <main className="mx-auto max-w-4xl px-6 py-14">
        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                >
                  <span className="text-base font-semibold">
                    {item.question}
                  </span>

                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#17120f] text-lg text-white transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-black/5 px-6 pb-6 pt-5">
                    <p className="leading-7 text-black/65">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default FAQ;