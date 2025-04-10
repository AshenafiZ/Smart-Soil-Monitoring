import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode; // Accept any form or content inside
}

const UIModal: React.FC<ModalProps> = ({ isOpen, onClose, title, description, children }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children} {/* Accepts any form */}
        <DialogClose asChild>
          <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Cancel</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default UIModal;
