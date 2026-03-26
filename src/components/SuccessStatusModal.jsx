import React from "react";
import { Button, Modal } from "./ui";

export default function SuccessStatusModal({
  show,
  onClose,
  title,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}) {
  return (
    <Modal
      show={show}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <>
          {secondaryLabel && onSecondary && (
            <Button variant="outline" onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          )}
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={onPrimary}>
            {primaryLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 text-green-600"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <p>{description}</p>
      </div>
    </Modal>
  );
}
