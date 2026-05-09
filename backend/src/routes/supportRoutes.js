import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { findById, findWhere, insertOne, updateOne, readCollection } from "../db/dataLake.js";
import { apiSuccess, apiError, nowIso, paginate, createId } from "../utils.js";

const router = express.Router();

// User routes
router.post("/tickets", requireAuth, requireRole("CLIENT"), (req, res) => {
  const { subject, category, description } = req.body;
  if (!subject || !category || !description) {
    return res.status(400).json(apiError("MISSING_FIELDS", "Subject, category, and description are required"));
  }

  const priority = (category === "LOAN_ISSUE" || category === "REPAYMENT_ISSUE") ? "HIGH" : "MEDIUM";

  const ticket = insertOne("support_tickets.json", {
    id: createId(),
    userId: req.user.sub,
    subject,
    category,
    description,
    status: "OPEN",
    priority,
    messages: [
      { id: createId(), senderId: req.user.sub, senderRole: "USER", message: description, createdAt: nowIso() }
    ],
    assignedTo: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    resolvedAt: null
  });

  res.status(201).json(apiSuccess({ ticket }));
});

router.get("/tickets/my", requireAuth, requireRole("CLIENT"), (req, res) => {
  const tickets = findWhere("support_tickets.json", t => t.userId === req.user.sub);
  res.json(apiSuccess(tickets));
});

router.get("/tickets/:id", requireAuth, (req, res) => {
  const ticket = findById("support_tickets.json", req.params.id);
  if (!ticket) return res.status(404).json(apiError("TICKET_NOT_FOUND", "Ticket not found"));

  if (req.user.role === "CLIENT" && ticket.userId !== req.user.sub) {
    return res.status(403).json(apiError("FORBIDDEN", "You do not have access to this ticket"));
  }

  res.json(apiSuccess({ ticket }));
});

router.post("/tickets/:id/message", requireAuth, (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json(apiError("MISSING_MESSAGE", "Message is required"));

  const ticket = findById("support_tickets.json", req.params.id);
  if (!ticket) return res.status(404).json(apiError("TICKET_NOT_FOUND", "Ticket not found"));

  if (req.user.role === "CLIENT" && ticket.userId !== req.user.sub) {
    return res.status(403).json(apiError("FORBIDDEN", "You do not have access to this ticket"));
  }

  const newMessage = {
    id: createId(),
    senderId: req.user.sub,
    senderRole: req.user.role === "ADMIN" ? "ADMIN" : "USER",
    message,
    createdAt: nowIso()
  };

  const updatedTicket = updateOne("support_tickets.json", req.params.id, {
    messages: [...ticket.messages, newMessage],
    updatedAt: nowIso()
  });

  res.json(apiSuccess({ ticket: updatedTicket }));
});

// Admin routes
router.get("/admin/tickets", requireAuth, requireRole("ADMIN"), (req, res) => {
  const { status, priority, category, page, limit } = req.query;
  let tickets = readCollection("support_tickets.json");

  if (status) tickets = tickets.filter(t => t.status === status);
  if (priority) tickets = tickets.filter(t => t.priority === priority);
  if (category) tickets = tickets.filter(t => t.category === category);

  tickets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  res.json(apiSuccess(paginate(tickets, page, limit)));
});

router.put("/admin/tickets/:id/status", requireAuth, requireRole("ADMIN"), (req, res) => {
  const { status } = req.body;
  const updates = { status, updatedAt: nowIso() };
  if (status === "RESOLVED" || status === "CLOSED") updates.resolvedAt = nowIso();

  const ticket = updateOne("support_tickets.json", req.params.id, updates);
  if (!ticket) return res.status(404).json(apiError("TICKET_NOT_FOUND", "Ticket not found"));
  res.json(apiSuccess({ ticket }));
});

router.put("/admin/tickets/:id/priority", requireAuth, requireRole("ADMIN"), (req, res) => {
  const { priority } = req.body;
  const ticket = updateOne("support_tickets.json", req.params.id, { priority, updatedAt: nowIso() });
  if (!ticket) return res.status(404).json(apiError("TICKET_NOT_FOUND", "Ticket not found"));
  res.json(apiSuccess({ ticket }));
});

router.put("/admin/tickets/:id/assign", requireAuth, requireRole("ADMIN"), (req, res) => {
  const ticket = updateOne("support_tickets.json", req.params.id, { assignedTo: req.user.sub, updatedAt: nowIso() });
  if (!ticket) return res.status(404).json(apiError("TICKET_NOT_FOUND", "Ticket not found"));
  res.json(apiSuccess({ ticket }));
});

export default router;
