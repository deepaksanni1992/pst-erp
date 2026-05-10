/**
 * Toast helper — thin wrapper around sonner so the rest of the app
 * never imports sonner directly. This way we can swap the underlying
 * library or theme tokens in one place.
 */
import { toast as sonnerToast } from "sonner";

export const toast = {
  success: (msg, opts) => sonnerToast.success(msg, opts),
  error:   (msg, opts) => sonnerToast.error(msg, opts),
  info:    (msg, opts) => sonnerToast.message(msg, opts),
  warning: (msg, opts) => sonnerToast.warning?.(msg, opts) ?? sonnerToast(msg, opts),
  loading: (msg, opts) => sonnerToast.loading(msg, opts),
  promise: (p, msgs)   => sonnerToast.promise(p, msgs),
  dismiss: (id)        => sonnerToast.dismiss(id),
};

export default toast;
