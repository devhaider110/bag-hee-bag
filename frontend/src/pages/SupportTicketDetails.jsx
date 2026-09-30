import {
  useEffect,
  useState,
} from "react";

import {
  getMySupportTicket,
  replyToSupportTicket,
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

const SupportTicketDetails = () => {
  const ticketId =
    window.location.pathname.split(
      "/"
    )[3];

  const [ticket, setTicket] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
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

  const loadTicket = async () => {
    if (!ticketId) return;

    setLoading(true);
    setError("");

    try {
      const response =
        await getMySupportTicket(
          ticketId
        );

      setTicket(
        response?.ticket || null
      );
    } catch (err) {
      setError(
        err?.response?.data
          ?.message ||
          err?.message ||
          "Failed to load ticket."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const handleReply = async (
    event
  ) => {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    setSending(true);
    setError("");

    try {
      const response =
        await replyToSupportTicket(
          ticketId,
          message.trim()
        );

      setTicket(
        response?.ticket || ticket
      );

      setMessage("");
    } catch (err) {
      setError(
        err?.response?.data
          ?.message ||
          err?.message ||
          "Failed to send reply."
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] p-10 text-center text-sm text-white/50">
        Loading ticket...
      </main>
    );
  }

  if (!ticket) {
    return (
      <main className="min-h-screen bg-[#080808] px-4 py-16 text-white">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center">
          <h1 className="text-xl font-bold">
            Support ticket not found
          </h1>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/support/tickets"
              )
            }
            className="mt-5 rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-bold text-black"
          >
            Back to Tickets
          </button>
        </div>
      </main>
    );
  }

  const canReply =
    ticket.status !== "CLOSED";

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        <button
          type="button"
          onClick={() =>
            navigate(
              "/support/tickets"
            )
          }
          className="mb-6 text-sm text-white/45 transition hover:text-[#d4af37]"
        >
          ← Back to My Tickets
        </button>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-white/[0.025]">

          {/* HEADER */}

          <div className="border-b border-white/10 p-5 sm:p-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs text-[#d4af37]">
                  {
                    ticket.ticketNumber
                  }
                </p>

                <h1 className="mt-2 text-2xl font-black sm:text-3xl">
                  {ticket.subject}
                </h1>

                <p className="mt-2 text-xs text-white/35">
                  Created{" "}
                  {formatDate(
                    ticket.createdAt
                  )}
                </p>
              </div>

              <span
                className={`self-start rounded-full border px-4 py-2 text-xs font-semibold ${statusClasses[ticket.status] || statusClasses.NEW}`}
              >
                {formatStatus(
                  ticket.status
                )}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/30">
                  Priority
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {ticket.priority}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/30">
                  Category
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {ticket.category}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/30">
                  Order
                </p>

                <p className="mt-1 break-all text-sm font-semibold">
                  {ticket.orderIdText ||
                    "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/30">
                  Last Reply
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {formatDate(
                    ticket.lastRepliedAt
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* CONVERSATION */}

          <div className="space-y-4 p-5 sm:p-8">
            {(ticket.messages || []).map(
              (item, index) => {
                const isAdmin =
                  item.senderType ===
                  "ADMIN";

                return (
                  <div
                    key={
                      item._id ||
                      index
                    }
                    className={`flex ${
                      isAdmin
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-3xl rounded-2xl border p-4 ${
                        isAdmin
                          ? "border-[#d4af37]/20 bg-[#d4af37]/5"
                          : "border-white/10 bg-white/[0.035]"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <span className="text-xs font-bold text-[#d4af37]">
                          {isAdmin
                            ? "BAG HEE BAG Support"
                            : "You"}
                        </span>

                        <span className="text-[10px] text-white/25">
                          {formatDate(
                            item.createdAt
                          )}
                        </span>
                      </div>

                      <p className="whitespace-pre-wrap text-sm leading-6 text-white/70">
                        {
                          item.message
                        }
                      </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* REPLY */}

          {canReply ? (
            <form
              onSubmit={
                handleReply
              }
              className="border-t border-white/10 p-5 sm:p-8"
            >
              <label className="mb-2 block text-xs font-semibold text-white/60">
                Reply
              </label>

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value
                  )
                }
                rows={5}
                placeholder="Write your reply..."
                className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
              />

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={
                    sending ||
                    !message.trim()
                  }
                  className="rounded-xl bg-[#d4af37] px-6 py-3 text-sm font-bold text-black transition hover:bg-[#e5c85b] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {sending
                    ? "Sending..."
                    : "Send Reply"}
                </button>
              </div>
            </form>
          ) : (
            <div className="border-t border-white/10 p-5 text-center text-sm text-white/40 sm:p-8">
              This support ticket is
              closed.
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default SupportTicketDetails;