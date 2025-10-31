import {
  Dialog,
  DialogContent,
} from "@/shared/components/ui/dialog";

export const ImageModal = ({ showModal, setShowModal, subImages = [] }) => {
  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-5xl p-6">
        <div className="flex flex-wrap gap-4 justify-center items-center">
          {subImages.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`sub-${index}`}
              className="w-48 h-48 object-cover rounded-xl shadow-md hover:scale-105 transition-transform duration-300 ease-in-out"
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
