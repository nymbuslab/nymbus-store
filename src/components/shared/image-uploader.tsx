"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  deleteProductImageAction,
  registerProductImageAction,
  reorderProductImagesAction,
} from "@/modules/catalog/products/actions";
import { cn } from "@/lib/utils";

export type UploadedImage = {
  id: string;
  url: string;
  storagePath: string | null;
  position: number;
};

type Props = {
  storeId: string;
  productId: string;
  initialImages: UploadedImage[];
  maxImages?: number;
};

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export function ImageUploader({
  storeId,
  productId,
  initialImages,
  maxImages = 8,
}: Props) {
  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  const [uploading, setUploading] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const uploadOne = useCallback(
    async (file: File) => {
      if (!ACCEPTED.includes(file.type)) {
        throw new Error(`${file.name}: formato inválido`);
      }
      if (file.size > MAX_SIZE) {
        throw new Error(`${file.name}: máximo 5 MB`);
      }
      const ext =
        file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
            ? "webp"
            : "jpg";
      const random = Math.random().toString(36).slice(2, 8);
      const path = `${storeId}/${productId}/${Date.now()}-${random}.${ext}`;

      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw new Error(`${file.name}: ${upErr.message}`);

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);

      const result = await registerProductImageAction({
        productId,
        url: urlData.publicUrl,
        storagePath: path,
      });
      if ("error" in result) {
        // tenta limpar o arquivo órfão
        await supabase.storage.from("product-images").remove([path]);
        throw new Error(result.error);
      }
      return {
        id: result.id,
        url: urlData.publicUrl,
        storagePath: path,
        position: result.position,
      } satisfies UploadedImage;
    },
    [productId, storeId],
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const list = Array.from(files);
      const slots = maxImages - images.length;
      if (slots <= 0) {
        setError(`Máximo de ${maxImages} imagens por produto`);
        return;
      }
      const queue = list.slice(0, slots);
      setUploading((n) => n + queue.length);

      const uploaded: UploadedImage[] = [];
      for (const file of queue) {
        try {
          const img = await uploadOne(file);
          uploaded.push(img);
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        } finally {
          setUploading((n) => n - 1);
        }
      }
      if (uploaded.length > 0) {
        setImages((prev) => [...prev, ...uploaded]);
      }
    },
    [images.length, maxImages, uploadOne],
  );

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      void handleFiles(event.dataTransfer.files);
      event.dataTransfer.clearData();
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((i) => i.id === active.id);
    const newIndex = images.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(images, oldIndex, newIndex);
    setImages(next);
    startTransition(() => {
      void reorderProductImagesAction(
        productId,
        next.map((i) => i.id),
      );
    });
  }

  function handleRemove(image: UploadedImage) {
    if (!window.confirm("Remover esta imagem?")) return;
    setImages((prev) => prev.filter((i) => i.id !== image.id));
    startTransition(() => {
      void deleteProductImageAction({
        productId,
        imageId: image.id,
        storagePath: image.storagePath,
      });
    });
  }

  const canAdd = images.length < maxImages && uploading === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          Galeria{" "}
          <span className="text-xs text-muted-foreground">
            ({images.length}/{maxImages})
          </span>
        </p>
        {images.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            Arraste para reordenar. A primeira é a imagem principal.
          </p>
        ) : null}
      </div>

      {images.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((i) => i.id)}
            strategy={horizontalListSortingStrategy}
          >
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {images.map((img, index) => (
                <SortableImageTile
                  key={img.id}
                  image={img}
                  isPrimary={index === 0}
                  onRemove={() => handleRemove(img)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : null}

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/20 px-6 py-8 text-sm text-muted-foreground transition-colors cursor-pointer",
          isDragOver && "border-primary bg-primary/5 text-foreground",
          !canAdd && "opacity-50 cursor-not-allowed",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          multiple
          disabled={!canAdd}
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="sr-only"
        />
        {uploading > 0 ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            <p>Enviando {uploading} arquivo(s)...</p>
          </>
        ) : (
          <>
            <Upload className="size-5" aria-hidden />
            <p>
              Arraste imagens aqui ou{" "}
              <span className="font-medium text-foreground underline underline-offset-4">
                escolha arquivos
              </span>
            </p>
            <p className="text-xs">PNG, JPEG ou WebP · até 5 MB cada</p>
          </>
        )}
      </label>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SortableImageTile({
  image,
  isPrimary,
  onRemove,
}: {
  image: UploadedImage;
  isPrimary: boolean;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: image.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-md border bg-muted",
        isDragging && "shadow-lg",
      )}
    >
      <Image
        src={image.url}
        alt=""
        fill
        sizes="(max-width: 768px) 50vw, 200px"
        className="object-cover"
      />
      {isPrimary ? (
        <span className="absolute left-1 top-1 rounded bg-success px-1.5 py-0.5 text-[10px] font-medium text-success-foreground">
          Principal
        </span>
      ) : null}
      <button
        type="button"
        aria-label="Arrastar"
        className="absolute left-1 bottom-1 rounded bg-background/80 p-1 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3" />
      </button>
      <Button
        type="button"
        size="icon-sm"
        variant="destructive"
        onClick={onRemove}
        aria-label="Remover"
        className="absolute right-1 top-1"
      >
        <X className="size-3" />
      </Button>
    </li>
  );
}
