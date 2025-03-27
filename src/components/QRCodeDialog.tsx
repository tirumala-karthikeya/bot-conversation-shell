
import React, { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import { Download } from "lucide-react";

interface QRCodeDialogProps {
  url: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeDialog: React.FC<QRCodeDialogProps> = ({
  url,
  title,
  isOpen,
  onClose,
}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  
  const downloadQRCode = () => {
    try {
      const canvas = qrRef.current?.querySelector("canvas");
      if (!canvas) {
        throw new Error("QR Code canvas not found");
      }
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `${title.toLowerCase().replace(/\s+/g, "-")}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("QR code downloaded successfully");
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toast.error("Failed to download QR code");
    }
  };

  // Create absolute URL from relative URL
  const getFullUrl = () => {
    const baseUrl = window.location.origin;
    // Make sure the URL doesn't have a double slash
    return `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code for {title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-4">
          <div ref={qrRef} className="border p-4 rounded-lg bg-white">
            <QRCodeCanvas
              value={getFullUrl()}
              size={200}
              level="H"
              includeMargin
              // Remove the imageSettings to get rid of the Lovable logo
            />
          </div>
          
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Scan this QR code to open the {title} chatbot
          </p>
          
          <p className="text-xs break-all mt-2 text-center max-w-full overflow-hidden">
            {getFullUrl()}
          </p>
        </div>
        
        <DialogFooter className="sm:justify-center">
          <Button onClick={downloadQRCode} className="mt-2">
            <Download className="mr-2 h-4 w-4" />
            Download QR Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;
