'use client'

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  RotateCcw, 
  RotateCw, 
  ZoomIn, 
  ZoomOut 
} from "lucide-react";
import { useCallback, useRef } from "react";
import { 
  Cropper as ReactCropper, 
  CircleStencil,
  RectangleStencil,
  CropperRef, 
  ImageRestriction 
} from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';

type CropperProps = {
  image: string;
  onCrop: (file: File | null) => void;
  onCancel: () => void;
  className?: string;
  quality?: number;
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
  cropType?: 'profile' | 'banner';
}

const MOVEMENT_STEP = 50;
const ZOOM_FACTOR = 2;
const ZOOM_OUT_FACTOR = 0.5;
const ROTATION_ANGLE = 90;
const DEFAULT_QUALITY = 0.8;
const OUTPUT_FILENAME = 'cropped-image';

// Banner aspect ratio (e.g., 16:9 or 3:1 for wide banners)
const BANNER_ASPECT_RATIO = 16 / 5;

export default function Cropper({ 
  image,
  onCrop,
  onCancel,
  className = "",
  quality = DEFAULT_QUALITY,
  outputFormat = 'image/jpeg',
  cropType = 'profile'
}: CropperProps) {
  const cropperRef = useRef<CropperRef>(null);
  
  const handleCrop = useCallback(async () => {
    const cropper = cropperRef.current;
    if (!cropper) return;
    
    const canvas = cropper.getCanvas();
    if (!canvas) return;
    
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          onCrop(null);
          return;
        }

        const extension = outputFormat.split('/')[1];
        const file = new File([blob], `${OUTPUT_FILENAME}.${extension}`, {
          type: outputFormat,
          lastModified: Date.now()
        });
        
        onCrop(file);
      }, 
      outputFormat, 
      quality
    );
  }, [onCrop, outputFormat, quality]);

  const handleRotate = useCallback((angle: number) => {
    cropperRef.current?.rotateImage(angle);
  }, []);

  const handleZoom = useCallback((zoomFactor: number) => {
    cropperRef.current?.zoomImage(zoomFactor);
  }, []);

  const handleMove = useCallback((x: number, y: number) => {
    cropperRef.current?.moveImage(x, y);
  }, []);

  const controls = [
    {
      icon: RotateCcw,
      action: () => handleRotate(-ROTATION_ANGLE),
      label: "Rotate counterclockwise"
    },
    {
      icon: RotateCw,
      action: () => handleRotate(ROTATION_ANGLE),
      label: "Rotate clockwise"
    },
    {
      icon: ZoomIn,
      action: () => handleZoom(ZOOM_FACTOR),
      label: "Zoom in"
    },
    {
      icon: ZoomOut,
      action: () => handleZoom(ZOOM_OUT_FACTOR),
      label: "Zoom out"
    },
    {
      icon: ArrowLeft,
      action: () => handleMove(-MOVEMENT_STEP, 0),
      label: "Move left"
    },
    {
      icon: ArrowRight,
      action: () => handleMove(MOVEMENT_STEP, 0),
      label: "Move right"
    },
    {
      icon: ArrowUp,
      action: () => handleMove(0, -MOVEMENT_STEP),
      label: "Move up"
    },
    {
      icon: ArrowDown,
      action: () => handleMove(0, MOVEMENT_STEP),
      label: "Move down"
    }
  ];

  const getStencilProps = () => {
    if (cropType === 'banner') {
      return {
        aspectRatio: {
          minimum: BANNER_ASPECT_RATIO,
          maximum: BANNER_ASPECT_RATIO
        }
      };
    } else {
      // circular
      return {
        aspectRatio: {
          minimum: 1,
          maximum: 1
        }
      };
    }
  };

  const StencilComponent = cropType === 'banner' ? RectangleStencil : CircleStencil;
  
  return (
    <div className={cn(
      "w-full space-y-4 max-w-full overflow-hidden",
      className
    )}>
      <div className="flex flex-row gap-2 flex-wrap">
        {controls.map(({ icon: Icon, action, label }, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={action}
            aria-label={label}
            title={label}
          >
            <Icon size={16} />
          </Button>
        ))}
      </div>
      
      <div className={cn(
        "w-full max-w-full overflow-hidden rounded-lg border",
        cropType === 'banner' ? "h-[250px] sm:h-[300px]" : "h-[300px] sm:h-[350px]"
      )}>
        <ReactCropper
          src={image}
          ref={cropperRef}            
          className="cropper w-full h-full max-w-full"
          stencilComponent={StencilComponent}
          stencilProps={getStencilProps()}
          imageRestriction={ImageRestriction.stencil}
        />
      </div>
      
      <div className="flex justify-start md:justify-end gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCrop}  
        >
          Crop
        </Button>
      </div>
    </div>
  );
}