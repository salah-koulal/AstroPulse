import { useEffect, useRef, useState } from "react";
import { Info, X } from "lucide-react";

export default function AboutAstroPulse() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function show() {
    dialog.current?.showModal();
    setOpen(true);
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === dialog.current) {
      dialog.current?.close();
    }
  }

  return (
    <>
      <button
        ref={trigger}
        className="about-trigger"
        aria-haspopup="dialog"
        aria-controls="about-astropulse"
        aria-expanded={open}
        aria-label="About AstroPulse"
        title="About AstroPulse"
        onClick={show}
      >
        <Info size={15} aria-hidden="true" />
        <span>About AstroPulse</span>
      </button>
      <dialog
        ref={dialog}
        id="about-astropulse"
        className="about-dialog"
        aria-labelledby="about-title"
        aria-describedby="about-description about-prototype"
        onClick={handleBackdropClick}
        onClose={() => {
          setOpen(false);
          trigger.current?.focus({ preventScroll: true });
        }}
      >
        <div className="about-heading">
          <h2 id="about-title">About AstroPulse</h2>
          <button
            autoFocus
            className="about-close"
            aria-label="Close About AstroPulse"
            onClick={() => dialog.current?.close()}
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>
        <p id="about-description">
          AstroPulse is a NASA Space Apps project exploring astronaut health
          through interactive 3D anatomy, body-system readings, and an AI
          assistant interface designed for voice and text.
        </p>
        <p id="about-prototype">
          This prototype uses sample health data and simulated assistant
          interactions.
        </p>
      </dialog>
    </>
  );
}
