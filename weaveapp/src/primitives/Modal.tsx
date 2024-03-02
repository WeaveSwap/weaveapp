import * as Dialog from '@radix-ui/react-dialog';

interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Modal = ({ open, onOpenChange, children }: ModalProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  );
};

interface ModalPortalProps {
  container?: HTMLElement;
  children: React.ReactNode;
  closeModal?: () => void;
}

const ModalPortal = ({ container, children, closeModal }: ModalPortalProps) => {
  return (
    <Dialog.Portal
      container={container}
      // className={`${inter.variable} ${inknut.variable} font-sans`}
    >
      <Dialog.Overlay
        className="fixed inset-0 z-30 bg-bca-black-2 opacity-30 data-[state=open]:animate-overlayShow"
        onClick={closeModal}
      />
      {children}
    </Dialog.Portal>
  );
};

const ModalCover = ({ container, children }: ModalPortalProps) => {
  return <Dialog.Portal container={container}>{children}</Dialog.Portal>;
};

interface ModalTitleProps {
  children: React.ReactNode;
  className?: string;
}

const ModalTitle = ({ children, className }: ModalTitleProps) => {
  return (
    <div>
      <Dialog.Title className={className}>{children}</Dialog.Title>
    </div>
  );
};

Modal.Portal = ModalPortal;
Modal.Cover = ModalCover;
Modal.Button = Dialog.Trigger;
Modal.Content = Dialog.Content;
// Modal.Title = ModalTitle;
Modal.Title = Dialog.Title;
Modal.Close = Dialog.Close;
export default Modal;
