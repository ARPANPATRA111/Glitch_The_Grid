'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Download, FileText, Loader2 } from 'lucide-react';

interface ResumePreviewModalProps {
  resumeUrl?: string | null;
  fileName?: string;
  trigger?: React.ReactNode;
}

/**
 * Modal to preview a PDF resume
 */
export function ResumePreviewModal({ 
  resumeUrl, 
  fileName = 'Resume.pdf',
  trigger 
}: ResumePreviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setError('Failed to load PDF preview');
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setIsLoading(true);
      setError(null);
    }
  };

  if (!resumeUrl) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview Resume
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {fileName}
          </DialogTitle>
          <DialogDescription>
            Preview your uploaded resume
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 relative bg-muted rounded-lg overflow-hidden min-h-0">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <p className="text-muted-foreground text-center">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.open(resumeUrl, '_blank')}
              >
                Open in New Tab
              </Button>
            </div>
          ) : (
            <iframe
              src={`${resumeUrl}#toolbar=1&navpanes=0`}
              className="w-full h-full border-0"
              title="Resume Preview"
              onLoad={handleLoad}
              onError={handleError}
            />
          )}
        </div>
        
        <DialogFooter className="flex-row justify-end gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(resumeUrl, '_blank')}
          >
            Open in New Tab
          </Button>
          <Button asChild>
            <a href={resumeUrl} download={fileName}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ResumeUploadPreviewProps {
  file: File;
  onConfirm: () => void;
  onCancel: () => void;
  isUploading?: boolean;
}

/**
 * Modal to preview a PDF before uploading
 */
export function ResumeUploadPreview({ 
  file, 
  onConfirm, 
  onCancel,
  isUploading = false 
}: ResumeUploadPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  React.useEffect(() => {
    // Create object URL for preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Cleanup
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setError('Failed to load PDF preview');
  }, []);

  return (
    <Dialog open={true} onOpenChange={() => !isUploading && onCancel()}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Preview: {file.name}
          </DialogTitle>
          <DialogDescription>
            Review your resume before uploading. File size: {(file.size / 1024 / 1024).toFixed(2)} MB
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 relative bg-muted rounded-lg overflow-hidden min-h-0">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <p className="text-muted-foreground text-center">{error}</p>
              <p className="text-sm text-muted-foreground">
                You can still upload this file. The preview may not work in all browsers.
              </p>
            </div>
          ) : previewUrl ? (
            <iframe
              src={`${previewUrl}#toolbar=1&navpanes=0`}
              className="w-full h-full border-0"
              title="Resume Preview"
              onLoad={handleLoad}
              onError={handleError}
            />
          ) : null}
        </div>
        
        <DialogFooter className="flex-row justify-end gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Resume'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
