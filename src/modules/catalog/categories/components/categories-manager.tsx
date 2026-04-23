"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCategoryAction,
  deleteCategoryAction,
  reorderCategoriesAction,
  toggleCategoryActiveAction,
  updateCategoryAction,
  type CategoryActionState,
} from "@/modules/catalog/categories/actions";
import type { CategoryRow } from "@/modules/catalog/categories/queries";
import { cn } from "@/lib/utils";

const initialState: CategoryActionState = {};

export function CategoriesManager({
  initialCategories,
}: {
  initialCategories: CategoryRow[];
}) {
  const [items, setItems] = useState<CategoryRow[]>(initialCategories);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const [, startTransition] = useTransition();

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    startTransition(() => {
      void reorderCategoriesAction(next.map((c) => c.id));
    });
  }

  return (
    <div className="space-y-6">
      <CreateCategoryCard />
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">
          {items.length === 0
            ? "Nenhuma categoria cadastrada"
            : `${items.length} categoria${items.length > 1 ? "s" : ""}`}
        </h2>
        {items.length === 0 ? (
          <p className="rounded-md border border-dashed bg-muted/20 px-6 py-8 text-center text-sm text-muted-foreground">
            Crie a primeira categoria no formulário acima.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-2">
                {items.map((category) => (
                  <CategoryRowItem key={category.id} category={category} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </section>
    </div>
  );
}

function CreateCategoryCard() {
  const [state, formAction] = useActionState(createCategoryAction, initialState);

  return (
    <form
      action={formAction}
      className="rounded-md border p-4 space-y-3"
      noValidate
    >
      <div className="grid gap-3 sm:grid-cols-[1fr,auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="new-category-name">Nova categoria</Label>
          <Input
            id="new-category-name"
            name="name"
            placeholder="Ex: Bebidas, Higiene"
            required
            aria-invalid={!!state.fieldErrors?.name}
          />
          {state.fieldErrors?.name ? (
            <p className="text-sm text-destructive">{state.fieldErrors.name}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked
              className="size-4 accent-primary"
            />
            Ativa
          </label>
          <CreateSubmit />
        </div>
      </div>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function CreateSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Criando..." : "Adicionar"}
    </Button>
  );
}

function CategoryRowItem({ category }: { category: CategoryRow }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const [editing, setEditing] = useState(false);

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
        "rounded-md border bg-background p-3",
        isDragging && "shadow-md",
      )}
    >
      {editing ? (
        <EditCategoryForm category={category} onDone={() => setEditing(false)} />
      ) : (
        <DisplayCategoryRow
          category={category}
          onEdit={() => setEditing(true)}
          dragHandleProps={{ ...attributes, ...listeners }}
        />
      )}
    </li>
  );
}

function DisplayCategoryRow({
  category,
  onEdit,
  dragHandleProps,
}: {
  category: CategoryRow;
  onEdit: () => void;
  dragHandleProps: React.HTMLAttributes<HTMLButtonElement>;
}) {
  const [, startTransition] = useTransition();

  function onToggle() {
    startTransition(() => {
      void toggleCategoryActiveAction(category.id, !category.is_active);
    });
  }

  function onDelete() {
    if (!window.confirm(`Excluir "${category.name}"? Produtos desta categoria ficarão sem categoria.`)) {
      return;
    }
    startTransition(() => {
      void deleteCategoryAction(category.id);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="Arrastar para reordenar"
        className="touch-none cursor-grab text-muted-foreground hover:text-foreground"
        {...dragHandleProps}
      >
        <GripVertical className="size-4" />
      </button>
      <span className="flex-1 font-medium">{category.name}</span>
      <span className="text-xs text-muted-foreground hidden sm:inline">
        /{category.slug}
      </span>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={category.is_active}
          onChange={onToggle}
          className="size-4 accent-primary"
          aria-label={category.is_active ? "Inativar categoria" : "Ativar categoria"}
        />
        {category.is_active ? "Ativa" : "Inativa"}
      </label>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onEdit}
        aria-label="Editar"
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
        aria-label="Excluir"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

function EditCategoryForm({
  category,
  onDone,
}: {
  category: CategoryRow;
  onDone: () => void;
}) {
  const boundAction = updateCategoryAction.bind(null, category.id);
  const [state, formAction] = useActionState(boundAction, initialState);

  return (
    <form
      action={(fd) => {
        formAction(fd);
        onDone();
      }}
      className="flex flex-wrap items-center gap-2"
      noValidate
    >
      <Input
        name="name"
        defaultValue={category.name}
        required
        aria-invalid={!!state.fieldErrors?.name}
        className="flex-1 min-w-40"
      />
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={category.is_active}
          className="size-4 accent-primary"
        />
        Ativa
      </label>
      <Button type="submit" size="sm" aria-label="Salvar">
        <Check className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onDone}
        aria-label="Cancelar"
      >
        <X className="size-4" />
      </Button>
      {state.fieldErrors?.name ? (
        <p className="w-full text-sm text-destructive">{state.fieldErrors.name}</p>
      ) : null}
      {state.error ? (
        <p className="w-full text-sm text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
