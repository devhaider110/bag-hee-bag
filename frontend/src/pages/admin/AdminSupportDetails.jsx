import {
  useEffect,
  useState,
} from "react";

import {
  addSupportInternalNote,
  getAdminSupportTicket,
  replyToAdminSupportTicket,
  updateSupportTicketPriority,
  updateSupportTicketStatus,
} from "../../services/supportService";

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

const AdminSupportDetails = () => {
  const ticketId =
    window.location.pathname.split(
      "/"
    )[3];

  const [ticket, setTicket] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [reply, setReply] =
    useState("");

  const [note, setNote] =
    useState("");

  const [savingReply, setSavingReply] =
    useState(false);

  const [savingNote, setSavingNote] =
    useState(false);

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
    setLoading(true);
    setError("");

    try {
      const response =
        await getAdminSupportTicket(
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

  const handleStatusChange =
    async (event) => {
      try {
        const response =
          await updateSupportTicketStatus(
            ticketId,
            event.target.value
          );

        setTicket(
          response?.ticket ||
            ticket
        );
      } catch (err) {
        setError(
          err?.response?.data
            ?.message ||
            err?.message ||
            "Failed to update status."
        );
      }
    };

  const handlePriorityChange =
    async (event) => {
      try {
        const response =
          await updateSupportTicketPriority(
            ticketId,
            event.target.value
          );

        setTicket(
          response?.ticket ||
            ticket
        );
      } catch (err) {
        setError(
          err?.response?.data
            ?.message ||
            err?.message ||
            "Failed to update priority."
        );
      }
    };

  const handleReply = async (
    event
  ) => {
    event.preventDefault();

    if (!reply.trim()) {
      return;
    }

    setSavingReply(true);
    setError("");

    try {
      const response =
        await replyToAdminSupportTicket(
          ticketId,
          reply.trim()
        );

      setTicket(
        response?.ticket ||
          ticket
      );

      setReply("");
    } catch (err) {
      setError(
        err?.response?.data
          ?.message ||
          err?.message ||
          "Failed to send reply."
      );
    } finally {
      setSavingReply(false);
    }
  };

  const handleNote = async (
    event
  ) => {
    event.preventDefault();

    if (!note.trim()) {
      return;
    }

    setSavingNote(true);
    setError("");

    try {
      const response =
        await addSupportInternalNote(
          ticketId,
          note.trim()
        );

      setTicket(
        response?.ticket ||
          ticket
      );

      setNote("");
    } catch (err) {
      setError(
        err?.response?.data
          ?.message ||
          err?.message ||
          "Failed to save internal note."
      );
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] p-10 text-center text-sm text-white/50">
        Loading support ticket...
      </main>
    );
  }

  if (!ticket) {
    return (
      <main className="min-h-screen bg-[#080808] px-4 py-16 text-white">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/[0.025] p-10 text-center">
          <h1 className="text-xl font-bold">
            Ticket not found
          </h1>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/support"
              )
            }
            className="mt-5 rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-bold text-black"
          >
            Back to Support
          </button>
        </div>
      </main>
    );
  }

  const customer =
    ticket.customer ||
    ticket.customerSnapshot ||
    {};

  const order =
    ticket.order || null;

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">

        <button
          type="button"
          onClick={() =>
            navigate(
              "/admin/support"
            )
          }
          className="mb-6 text-sm text-white/45 hover:text-[#d4af37]"
        >
          ← Back to Support Dashboard
        </button>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">

          {/* MAIN */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.025]">

            {/* HEADER */}

            <div className="border-b border-white/10 p-5 sm:p-8">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                <div>
                  <p className="text-xs text-[#d4af37]">
                    {
                      ticket.ticketNumber
                    }
                  </p>

                  <h1 className="mt-2 text-2xl font-black sm:text-3xl">
                    {ticket.subject}
                  </h1>

                  <p className="mt-2 text-xs text-white/30">
                    Created{" "}
                    {formatDate(
                      ticket.createdAt
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <select
                    value={
                      ticket.status
                    }
                    onChange={
                      handleStatusChange
                    }
                    className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-xs outline-none"
                  >
                    <option value="NEW">
                      New
                    </option>

                    <option value="IN_PROGRESS">
                      In Progress
                    </option>

                    <option value="RESOLVED">
                      Resolved
                    </option>

                    <option value="CLOSED">
                      Closed
                    </option>
                  </select>

                  <select
                    value={
                      ticket.priority
                    }
                    onChange={
                      handlePriorityChange
                    }
                    className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-xs outline-none"
                  >
                    <option value="LOW">
                      Low
                    </option>

                    <option value="MEDIUM">
                      Medium
                    </option>

                    <option value="HIGH">
                      High
                    </option>

                    <option value="URGENT">
                      Urgent
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* CONVERSATION */}

            <div className="space-y-4 p-5 sm:p-8">
              {(ticket.messages || []).map(
                (
                  item,
                  index
                ) => {
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
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-3xl rounded-2xl border p-4 ${
                          isAdmin
                            ? "border-[#d4af37]/20 bg-[#d4af37]/5"
                            : "border-white/10 bg-black/20"
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <span className="text-xs font-bold text-[#d4af37]">
                            {isAdmin
                              ? "Admin"
                              : item.senderName ||
                                "Customer"}
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

            {/* ADMIN REPLY */}

            {ticket.status !==
              "CLOSED" && (
              <form
                onSubmit={
                  handleReply
                }
                className="border-t border-white/10 p-5 sm:p-8"
              >
                <label className="mb-2 block text-xs font-semibold text-white/60">
                  Reply to Customer
                </label>

                <textarea
                  value={reply}
                  onChange={(event) =>
                    setReply(
                      event.target.value
                    )
                  }
                  rows={5}
                  placeholder="Write your response..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#d4af37]/60"
                />

                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={
                      savingReply ||
                      !reply.trim()
                    }
                    className="rounded-xl bg-[#d4af37] px-6 py-3 text-sm font-bold text-black disabled:opacity-40"
                  >
                    {savingReply
                      ? "Sending..."
                      : "Send Reply"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* SIDEBAR */}

          <aside className="space-y-6">

            {/* CUSTOMER */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">
                Customer
              </p>

              <h2 className="mt-3 text-lg font-bold">
                {customer.name ||
                  customer.username ||
                  "Customer"}
              </h2>

              <div className="mt-4 space-y-2 text-xs text-white/50">
                <p>
                  Email:{" "}
                  {customer.email ||
                    "—"}
                </p>

                <p>
                  Phone:{" "}
                  {customer.phone ||
                    "—"}
                </p>
              </div>
            </div>

            {/* ORDER */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">
                Order
              </p>

              {order ? (
                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <p className="text-white/30">
                      Order ID
                    </p>

                    <p className="mt-1 break-all">
                      {
                        order._id
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-white/30">
                      Order Status
                    </p>

                    <p className="mt-1">
                      {
                        order.orderStatus
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-white/30">
                      Payment
                    </p>

                    <p className="mt-1">
                      {
                        order.paymentStatus ||
                        "—"
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-white/30">
                      Total
                    </p>

                    <p className="mt-1 text-[#d4af37]">
                      ₹
                      {Number(
                        order.totalAmount ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-white/40">
                  No order linked.
                </p>
              )}
            </div>

            {/* INTERNAL NOTE */}

            <div className="rounded-2xl border border-orange-400/10 bg-orange-400/[0.03] p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-orange-300">
                Internal Note
              </p>

              <form
                onSubmit={
                  handleNote
                }
                className="mt-4"
              >
                <textarea
                  value={note}
                  onChange={(event) =>
                    setNote(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Only admins can see this..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-xs outline-none focus:border-orange-300/40"
                />

                <button
                  type="submit"
                  disabled={
                    savingNote ||
                    !note.trim()
                  }
                  className="mt-3 w-full rounded-xl border border-orange-300/20 bg-orange-300/10 px-4 py-3 text-xs font-semibold text-orange-200 disabled:opacity-40"
                >
                  {savingNote
                    ? "Saving..."
                    : "Add Internal Note"}
                </button>
              </form>

              {(ticket.internalNotes ||
                []).length > 0 && (
                <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                  {ticket.internalNotes.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={
                          item._id ||
                          index
                        }
                        className="rounded-xl border border-orange-300/10 bg-black/20 p-3"
                      >
                        <p className="text-xs leading-5 text-orange-100/70">
                          {
                            item.message
                          }
                        </p>

                        <p className="mt-2 text-[9px] text-white/25">
                          {
                            item.senderName
                          }{" "}
                          ·{" "}
                          {formatDate(
                            item.createdAt
                          )}
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* HISTORY */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">
                Ticket History
              </p>

              <div className="mt-5 space-y-4">
                {(ticket.history ||
                  []).map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={
                          item._id ||
                          index
                        }
                        className="border-l border-[#d4af37]/30 pl-4"
                      >
                        <p className="text-xs font-semibold text-white/70">
                          {
                            item.description
                          }
                        </p>

                        <p className="mt-1 text-[9px] text-white/25">
                          {item.performedByName ||
                            "System"}{" "}
                          ·{" "}
                          {formatDate(
                            item.createdAt
                          )}
                        </p>
                      </div>
                    )
                  )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default AdminSupportDetails;