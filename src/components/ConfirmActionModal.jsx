import React from "react";
import { Button, Modal } from "./ui";

export default function ConfirmActionModal({
  show,
  onClose,
  title,
  description,
  cancelLabel = "Batal",
  confirmLabel,
  onConfirm,
  confirmClassName = "",
  cancelDisabled = false,
  confirmDisabled = false,
}) {
  return (
    <Modal
      show={show}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={cancelDisabled}>
            {cancelLabel}
          </Button>
          <Button
            className={confirmClassName}
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{description}</p>
    </Modal>
  );
}
