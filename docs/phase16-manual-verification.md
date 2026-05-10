# Phase-16 Manual Verification (Live Event Emitters)

This checklist validates that live ERP transactions trigger workflow automation safely.

## 1) Create sample workflow rules

Use `POST /api/workflows/rules` and create sample active rules:

- `SALES + quotation_created` -> `CREATE_NOTIFICATION`
- `SALES + sales_invoice_posted` -> `CREATE_NOTIFICATION`
- `PROCUREMENT + pr_submitted` -> `CREATE_NOTIFICATION`
- `PROCUREMENT + po_created` -> `CREATE_NOTIFICATION`
- `PROCUREMENT + grn_received` -> `CREATE_NOTIFICATION`
- `ACCOUNTS + customer_payment_posted` -> `CREATE_NOTIFICATION`
- `ACCOUNTS + supplier_payment_posted` -> `CREATE_NOTIFICATION`
- `LOGISTICS + shipment_status_updated` -> `CREATE_NOTIFICATION`
- `APPROVALS + approval_requested` -> `CREATE_NOTIFICATION`
- `COMMUNICATION + message_sent` -> `CREATE_NOTIFICATION`

## 2) Run transaction checks

Perform one transaction in each domain and confirm:

- transaction succeeds even if workflow has no matching rule
- `/api/workflows/executions` has a new row (`SUCCESS` or `SKIPPED`)
- `/api/workflows/notifications` has new rows when rule action is `CREATE_NOTIFICATION`

Coverage transactions:

- Sales: quotation create/send, PI create/paid, order allocation create/cancel, sales invoice post/cancel
- Procurement: PR submit/approve/reject, PO create/approve, GRN receive/cancel
- Accounts: customer payment post/cancel, supplier payment post/cancel, ageing report for overdue detect
- Logistics: shipment create/update, delivered tracking update, delayed shipment case
- Approvals: pending approval paths + approval decision
- Communication: thread create, message send, portal token create/validate

## 3) Safety checks

- Force rule action error (bad template data), rerun transaction, verify main transaction still commits.
- Confirm warning only appears in server log (`[workflow] trigger failed...`) and no API rollback.

