import {
  useEffect,
  useState,
} from "react";

import {
  getMySupportTickets,
} from "../services/supportService";

const statusClasses = {
  NEW:
    "border-blue-400/20 bg-blue-400/10 text-blue-300",

  IN_PROGRESS:
    "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",

  RESOLVED:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",

  CLOSED:
    "border-neutral-400/20 bg-neutral-400/10 text-neutral-300",
};

const formatStatus = (
  status
) =>
  String(status || "")
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(
    date
  ).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const MySupportTickets = () => {
  const [tickets, setTickets] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [status, setStatus] =
    useState("");

  const navigate = (path) => {
    window.history.pushState(
      {},
      "",
      path
    );

    window.dispatchEvent(
      new PopStateEvent(
        "popstate"
      )
    );
  };

  const loadTickets = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await getMySupportTickets({
          status,
          page: 1,
          limit: 50,
        });

      setTickets(
        response?.tickets || []
      );
    } catch (err) {
      setError(
        err?.response?.data
          ?.message ||
          err?.message ||
          "Failed to load support tickets."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [status]);

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37]">
              Support
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              My Support Tickets
            </h1>

            <p className="mt-2 text-sm text-white/45">
              Track your enquiries and
              conversations with BAG HEE BAG.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/contact")
            }
            className="rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#e5c85b]"
          >
            New Support Request
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {[
            ["", "All"],
            ["NEW", "New"],
            [
              "IN_PROGRESS",
              "In Progress",
            ],
            ["RESOLVED", "Resolved"],
            ["CLOSED", "Closed"],
          ].map(
            ([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setStatus(value)
                }
                className={`rounded-full border px-4 py-2 text-xs transition ${
                  status === value
                    ? "border-[#d4af37] bg-[#d4af37] text-black"
                    : "border-white/10 text-white/50 hover:border-[#d4af37]/40 hover:text-white"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center text-sm text-white/45">
            Loading support tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-12 text-center">
            <div className="text-4xl">
              💬
            </div>

            <h2 className="mt-4 text-lg font-bold">
              No support tickets
            </h2>

            <p className="mt-2 text-sm text-white/40">
              You have not created any
              support request yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {tickets.map(
              (ticket) => (
                <button
                  key={ticket._id}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/support/tickets/${ticket._id}`
                    )
                  }
                  className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-left transition hover:-translate-y-1 hover:border-[#d4af37]/40 hover:bg-[#d4af37]/5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#d4af37]">
                        {
                          ticket.ticketNumber
                        }
                      </p>

                      <h2 className="mt-2 text-lg font-bold">
                        {
                          ticket.subject
                        }
                      </h2>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${statusClasses[ticket.status] || statusClasses.NEW}`}
                    >
                      {formatStatus(
                        ticket.status
                      )}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-white/30">
                        Priority
                      </p>

                      <p className="mt-1 text-white/70">
                        {ticket.priority}
                      </p>
                    </div>

                    <div>
                      <p className="text-white/30">
                        Created
                      </p>

                      <p className="mt-1 text-white/70">
                        {formatDate(
                          ticket.createdAt
                        )}
                      </p>
                    </div>
                  </div>

                  {ticket.orderIdText && (
                    <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-xs">
                      <span className="text-white/30">
                        Order ID:{" "}
                      </span>

                      <span className="text-white/65">
                        {
                          ticket.orderIdText
                        }
                      </span>
                    </div>
                  )}

                  <div className="mt-5 text-xs font-semibold text-[#d4af37]">
                    View conversation →
                  </div>
                </button>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default MySupportTickets;