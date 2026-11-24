import { useState, useCallback } from "react";
import ConfirmModal from "../components/alerts/ConfirmModal.jsx";

export default function useConfirm() {
  const [options, setOptions] = useState(null);
  const [resolver, setResolver] = useState(null);
  const [loading, setLoading] = useState(false);

  const confirm = useCallback((config = {}) => {
    return new Promise((resolve) => {
      setOptions(config);
      setResolver(() => resolve);
      setLoading(false);
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (loading || !resolver) return;

    try {
      setLoading(true);

      await options?.onConfirm?.();

      resolver(true);
    } catch (error) {
      options?.onError?.(error);
    } finally {
      setOptions(null);
      setResolver(null);
      setLoading(false);
    }
  }, [loading, resolver, options]);

  const handleClose = useCallback(() => {
    if (loading) return;

    resolver?.(false);

    setOptions(null);
    setResolver(null);
  }, [loading, resolver]);

  const ConfirmDialog = (
    <ConfirmModal
      open={Boolean(options)}
      title={options?.title}
      message={options?.message}
      confirmLabel={options?.confirmLabel}
      cancelLabel={options?.cancelLabel}
      onConfirm={handleConfirm}
      onClose={handleClose}
      loading={loading}
    />
  );

  return { confirm, ConfirmDialog };
}
