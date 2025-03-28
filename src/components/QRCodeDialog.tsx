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

  // Create absolute URL from relative URL using window.location.origin
  const getFullUrl = () => {
    // Get the current origin (protocol + hostname + port)
    const origin = window.location.origin;
    
    // Make sure the URL is properly formatted
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    
    // Return the full URL
    return `${origin}${cleanUrl}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-center">
        <DialogHeader>
          <DialogTitle>QR Code for {title}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <QRCodeCanvas
            value={getFullUrl()}
            size={256}
            level="H"
            includeMargin
            // No logo or imageSettings to keep QR code clean
          />
          <p className="mt-4 text-sm text-muted-foreground">
            Scan this QR code to open the {title} chatbot
          </p>
          <p className="text-xs text-muted-foreground break-all">
            <a href={getFullUrl()} target="_blank" rel="noopener noreferrer">
              {getFullUrl()}
            </a>
          </p>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={downloadQRCode}
          >
            Download QR Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;
