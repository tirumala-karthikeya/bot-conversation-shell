import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Chatbot } from "@/types/chatbot";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface EditChatbotDialogProps {
  chatbot: Chatbot;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedChatbot: Chatbot) => void;
}

const EditChatbotDialog: React.FC<EditChatbotDialogProps> = ({
  chatbot,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<Chatbot>({ ...chatbot });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "gradient.from" || name === "gradient.to") {
      // Handle nested gradient object
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        gradient: {
          ...formData.gradient,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate file upload - in a real app, this would upload to a server
    // and return a URL. Here we're just using a fake URL for demonstration.
    const fakeUrl = URL.createObjectURL(file);
    setFormData({
      ...formData,
      [fieldName]: fakeUrl,
    });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, this would call an API
      onUpdate(formData);
      toast.success("Chatbot updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update chatbot");
      console.error("Error updating chatbot:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white" aria-describedby="edit-chatbot-description">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Chatbot</DialogTitle>
          <DialogDescription id="edit-chatbot-description">
            Make changes to your chatbot here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Chat Logo Color */}
            <div className="space-y-2">
              <Label htmlFor="avatarColor">Chat Logo Color</Label>
              <div className="flex gap-2 items-center">
                <div 
                  className="w-8 h-8 border rounded" 
                  style={{ backgroundColor: formData.avatarColor }}
                />
                <Input
                  id="avatarColor"
                  name="avatarColor"
                  type="text"
                  value={formData.avatarColor}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Chat Logo Image */}
            <div className="space-y-2">
              <Label>Chat Logo Image</Label>
              <div className="space-y-2">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, 'chatLogoImage')} 
                />
                {formData.chatLogoImage && (
                  <div className="border rounded p-2 mt-2">
                    <p className="text-sm text-muted-foreground mb-2">Image selected</p>
                    <img 
                      src={formData.chatLogoImage} 
                      alt="Chat Logo" 
                      className="max-h-32 object-contain" 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Icon Avatar Image */}
            <div className="space-y-2">
              <Label>Icon Avatar Image</Label>
              <div className="space-y-2">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, 'iconAvatarImage')} 
                />
                {formData.iconAvatarImage && (
                  <div className="border rounded p-2 mt-2">
                    <p className="text-sm text-muted-foreground mb-2">Image selected</p>
                    <img 
                      src={formData.iconAvatarImage} 
                      alt="Icon Avatar" 
                      className="max-h-32 object-contain" 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Static Image */}
            <div className="space-y-2">
              <Label>Static Image</Label>
              <div className="space-y-2">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, 'staticImage')} 
                />
                {formData.staticImage && (
                  <div className="border rounded p-2 mt-2">
                    <p className="text-sm text-muted-foreground mb-2">Image selected</p>
                    <img 
                      src={formData.staticImage} 
                      alt="Static Image" 
                      className="max-h-32 object-contain" 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Chat Header Color */}
            <div className="space-y-2">
              <Label htmlFor="chatHeaderColor">Chat Header Color</Label>
              <div className="flex gap-2 items-center">
                <div 
                  className="w-8 h-8 border rounded" 
                  style={{ backgroundColor: formData.chatHeaderColor || '#b4c7c5' }}
                />
                <Input
                  id="chatHeaderColor"
                  name="chatHeaderColor"
                  type="text"
                  value={formData.chatHeaderColor || '#b4c7c5'}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Chat Background Gradient Start */}
            <div className="space-y-2">
              <Label htmlFor="gradient.from">Chat Background Gradient Start</Label>
              <div className="flex gap-2 items-center">
                <div 
                  className="w-8 h-8 border rounded" 
                  style={{ backgroundColor: formData.gradient?.from || '#ffffff' }}
                />
                <Input
                  id="gradient.from"
                  name="gradient.from"
                  type="text"
                  value={formData.gradient?.from || '#ffffff'}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Chat Background Gradient End */}
            <div className="space-y-2">
              <Label htmlFor="gradient.to">Chat Background Gradient End</Label>
              <div className="flex gap-2 items-center">
                <div 
                  className="w-8 h-8 border rounded" 
                  style={{ backgroundColor: formData.gradient?.to || '#6398d5' }}
                />
                <Input
                  id="gradient.to"
                  name="gradient.to"
                  type="text"
                  value={formData.gradient?.to || '#6398d5'}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Body Background Image */}
            <div className="space-y-2">
              <Label>Body Background Image</Label>
              <div className="space-y-2">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, 'bodyBackgroundImage')} 
                />
                {formData.bodyBackgroundImage && (
                  <div className="border rounded p-2 mt-2">
                    <p className="text-sm text-muted-foreground mb-2">Image selected</p>
                    <img 
                      src={formData.bodyBackgroundImage} 
                      alt="Body Background" 
                      className="max-h-32 object-contain" 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Welcome Text */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="welcomeText">Welcome Text</Label>
              <Textarea
                id="welcomeText"
                name="welcomeText"
                value={formData.welcomeText || ''}
                onChange={handleChange}
                rows={3}
              />
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">NEXT_AGI_API_KEY</Label>
              <Input
                id="apiKey"
                name="apiKey"
                value={formData.apiKey || ''}
                onChange={handleChange}
              />
            </div>

            {/* Analytics URL */}
            <div className="space-y-2">
              <Label htmlFor="analyticsUrl">Analytics URL</Label>
              <Input
                id="analyticsUrl"
                name="analyticsUrl"
                value={formData.analyticsUrl || ''}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">URL to your analytics dashboard for this chatbot</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Chatbot"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditChatbotDialog;
