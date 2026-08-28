"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type FieldType = "TEXT" | "NUMBER" | "EMAIL" | "LONG_TEXT" | "SELECT" | "CHECKBOX" | "RADIO" | "FILE";

type Field = {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options: string[] | null;
};

type RuleOperator = "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "GREATER_THAN" | "LESS_THAN" | "IS_EMPTY" | "IS_NOT_EMPTY";
type RuleAction = "SHOW" | "HIDE";

type Rule = {
  id: string;
  sourceFieldId: string;
  operator: RuleOperator;
  value?: any;
  action: RuleAction;
  targetFieldId: string;
};

const OPERATOR_LABELS: Record<RuleOperator, string> = {
  EQUALS: "is equal to",
  NOT_EQUALS: "is not equal to",
  CONTAINS: "contains",
  GREATER_THAN: "is greater than",
  LESS_THAN: "is less than",
  IS_EMPTY: "is empty",
  IS_NOT_EMPTY: "is not empty",
};

const COMPARISON_OPERATORS: RuleOperator[] = ["EQUALS", "NOT_EQUALS", "CONTAINS", "GREATER_THAN", "LESS_THAN"];

// --- Sortable Item Component ---
function SortableField({
  field,
  isSelected,
  onSelect,
  onRemove,
}: {
  field: Field;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: (e: React.MouseEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`group relative p-6 rounded-2xl bg-white border cursor-pointer transition-colors flex gap-4 items-start ${
        isSelected ? "border-zinc-900 shadow-sm ring-1 ring-zinc-900" : "border-zinc-200 hover:border-zinc-300"
      } ${isDragging ? "opacity-50 shadow-xl border-zinc-900" : ""}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="mt-1 flex items-center justify-center text-zinc-300 hover:text-zinc-600 cursor-grab active:cursor-grabbing p-1 -ml-2 rounded"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 4.625C6.12132 4.625 6.625 4.12132 6.625 3.5C6.625 2.87868 6.12132 2.375 5.5 2.375C4.87868 2.375 4.375 2.87868 4.375 3.5C4.375 4.12132 4.87868 4.625 5.5 4.625ZM9.5 4.625C10.1213 4.625 10.625 4.12132 10.625 3.5C10.625 2.87868 10.1213 2.375 9.5 2.375C8.87868 2.375 8.375 2.87868 8.375 3.5C8.375 4.12132 8.87868 4.625 9.5 4.625ZM10.625 7.5C10.625 8.12132 10.1213 8.625 9.5 8.625C8.87868 8.625 8.375 8.12132 8.375 7.5C8.375 6.87868 8.87868 6.375 9.5 6.375C10.1213 6.375 10.625 6.87868 10.625 7.5ZM5.5 8.625C6.12132 8.625 6.625 8.12132 6.625 7.5C6.625 6.87868 6.12132 6.375 5.5 6.375C4.87868 6.375 4.375 6.87868 4.375 7.5C4.375 8.12132 4.87868 8.625 5.5 8.625ZM10.625 11.5C10.625 12.1213 10.1213 12.625 9.5 12.625C8.87868 12.625 8.375 12.1213 8.375 11.5C8.375 10.8786 8.87868 10.375 9.5 10.375C10.1213 10.375 10.625 10.8786 10.625 11.5ZM5.5 12.625C6.12132 12.625 6.625 12.1213 6.625 11.5C6.625 10.8786 6.12132 10.375 5.5 10.375C4.87868 10.375 4.375 10.8786 4.375 11.5C4.375 12.1213 4.87868 12.625 5.5 12.625Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
      </div>

      <div className="flex-1 min-w-0">
        <label className="block text-[15px] font-semibold text-zinc-900 mb-2">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>

        {/* Render Mock Inputs */}
        {(field.type === "TEXT" || field.type === "EMAIL" || field.type === "NUMBER") && (
          <div className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 pointer-events-none"></div>
        )}
        {field.type === "LONG_TEXT" && (
          <div className="h-24 w-full rounded-lg border border-zinc-200 bg-zinc-50 pointer-events-none"></div>
        )}
        {field.type === "FILE" && (
          <div className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 pointer-events-none flex items-center gap-3 px-3 text-zinc-400 text-sm">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 3H7.5L6.5 2H3C2.44772 2 2 2.44772 2 3V12C2 12.5523 2.44772 13 3 13H12C12.5523 13 13 12.5523 13 12V4.5L12.5 3ZM3 3V12H12V7H8V3H3Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            <span>Drag & drop or click to upload</span>
          </div>
        )}
        {field.type === "SELECT" && (
          <div className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 pointer-events-none flex items-center justify-between px-3 text-zinc-400 text-sm">
            <span>Select an option...</span>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
          </div>
        )}
        {(field.type === "RADIO" || field.type === "CHECKBOX") && (
          <div className="space-y-3 pointer-events-none mt-3">
            {field.options?.map((opt, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-4 h-4 border border-zinc-300 ${field.type === "RADIO" ? "rounded-full" : "rounded"}`}></div>
                <span className="text-[14px] text-zinc-700">{opt}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete action */}
      <button
        onClick={onRemove}
        className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        title="Delete field"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4H3.5C3.22386 4 3 3.77614 3 3.5ZM5 4V12H10V4H5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
      </button>
    </div>
  );
}

// --- Main Page Component ---
export default function FormBuilderPage() {
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<"Saved" | "Saving..." | "Unsaved changes">("Saved");
  const isFirstRender = useRef(true);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const data = await api(`/forms/${id}`);
        setForm(data);
        setFields(data.fields || []);
        setRules(data.rules || []);
      } catch (err: any) {
        setSyncStatus("Unsaved changes");
      } finally {
        setIsLoading(false);
      }
    };
    fetchForm();
  }, [id]);

  // Debounced Auto-save
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    setSyncStatus("Unsaved changes");
    const timer = setTimeout(async () => {
      try {
        setSyncStatus("Saving...");
        await api(`/forms/${id}/fields`, {
          method: "POST",
          body: JSON.stringify({ fields }),
        });
        setSyncStatus("Saved");
      } catch (err) {
        setSyncStatus("Unsaved changes");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [fields, id]);

  const addField = (type: FieldType) => {
    const newField: Field = {
      id: crypto.randomUUID(),
      type,
      label: "New Field",
      required: false,
      options: ["SELECT", "CHECKBOX", "RADIO"].includes(type) ? ["Option 1", "Option 2"] : null,
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateSelectedField = (updates: Partial<Field>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === selectedFieldId ? { ...f, ...updates } : f))
    );
  };

  // --- Rule management ---
  const addRule = () => {
    if (!selectedField) return;
    const other = fields.find((f) => f.id !== selectedField.id);
    setRules((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sourceFieldId: selectedField.id,
        operator: "EQUALS",
        value: "",
        action: "SHOW",
        targetFieldId: other?.id || "",
      },
    ]);
  };

  const updateRule = (ruleId: string, updates: Partial<Rule>) => {
    setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)));
  };

  const removeRule = (ruleId: string) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  const updateFormMeta = (updates: { name?: string; description?: string }) => {
    setForm((prev: any) => (prev ? { ...prev, ...updates } : prev));
  };

  // Debounced Auto-save for title / description
  const isMetaFirstRender = useRef(true);
  useEffect(() => {
    if (!form) return;
    if (isMetaFirstRender.current) {
      isMetaFirstRender.current = false;
      return;
    }

    setSyncStatus("Unsaved changes");
    const timer = setTimeout(async () => {
      try {
        setSyncStatus("Saving...");
        await api(`/forms/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ name: form.name, description: form.description || null }),
        });
        setSyncStatus("Saved");
      } catch (err) {
        setSyncStatus("Unsaved changes");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [form?.name, form?.description, id]);

  // Debounced Auto-save for rules
  const isRulesFirstRender = useRef(true);
  useEffect(() => {
    if (isRulesFirstRender.current) {
      isRulesFirstRender.current = false;
      return;
    }

    setSyncStatus("Unsaved changes");
    const timer = setTimeout(async () => {
      try {
        setSyncStatus("Saving...");
        await api(`/forms/${id}/rules`, {
          method: "POST",
          body: JSON.stringify({
            rules: rules.map(({ id: _id, sourceFieldId, operator, value, action, targetFieldId }) => ({
              sourceFieldId,
              operator,
              value,
              action,
              targetFieldId,
            })),
          }),
        });
        setSyncStatus("Saved");
      } catch (err) {
        setSyncStatus("Unsaved changes");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [rules, id]);

  const handlePublish = async () => {
    try {
      const updatedForm = await api(`/forms/${id}/publish`, { method: "POST" });
      setForm(updatedForm);
    } catch (err: any) {
      alert("Failed to publish: " + err.message);
    }
  };

  const handleUnpublish = async () => {
    try {
      const updatedForm = await api(`/forms/${id}/unpublish`, { method: "POST" });
      setForm(updatedForm);
    } catch (err: any) {
      alert("Failed to unpublish: " + err.message);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/f/${form.slug}`);
    alert("Link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-50">
        <div className="animate-spin w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full"></div>
      </div>
    );
  }

  const selectedField = fields.find((f) => f.id === selectedFieldId);
  const isPublished = form?.status === "PUBLISHED";

  return (
    <div className="h-screen flex flex-col font-sans bg-[#F9F9F9] overflow-hidden">
      {/* Top Header */}
      <header className="h-14 bg-white border-b border-zinc-200 px-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/forms" className="w-8 h-8 flex items-center justify-center rounded hover:bg-zinc-100 text-zinc-500 transition-colors">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
          </Link>
          <div className="h-4 w-[1px] bg-zinc-200"></div>
          <div className="flex items-center gap-2">
            <h1 className="text-[14px] font-semibold text-zinc-900 truncate max-w-[200px]">{form?.name}</h1>
            {isPublished ? (
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide">Published</span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-500 text-[10px] font-bold uppercase tracking-wide">Draft</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Sync Status */}
          <div className="flex items-center gap-2">
            <span className={`text-[12px] font-medium transition-colors ${syncStatus === 'Unsaved changes' ? 'text-amber-600' : 'text-zinc-400'}`}>
              {syncStatus}
            </span>
            <div className="h-2 w-2 rounded-full bg-zinc-200 flex items-center justify-center">
               <div className={`h-1.5 w-1.5 rounded-full ${syncStatus === 'Saved' ? 'bg-emerald-500' : syncStatus === 'Saving...' ? 'bg-blue-500 animate-pulse' : 'bg-amber-500'}`}></div>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-zinc-200"></div>

          {/* Nav */}
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/forms/${id}`}
              className="px-3 py-1.5 bg-zinc-900 text-white text-[13px] font-semibold rounded-md shadow-sm"
            >
              Builder
            </Link>
            <Link
              href={`/dashboard/forms/${id}/submissions`}
              className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-[13px] font-semibold rounded-md shadow-sm transition-colors"
            >
              Submissions{form?._count?.submissions ? ` (${form._count.submissions})` : ""}
            </Link>
          </div>

          <div className="h-4 w-[1px] bg-zinc-200"></div>

          {/* Publish Actions */}
          <div className="flex items-center gap-2">
            {isPublished ? (
              <>
                <button
                  onClick={copyLink}
                  className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-[13px] font-semibold rounded-md shadow-sm transition-colors"
                >
                  Copy Link
                </button>
                <button
                  onClick={handleUnpublish}
                  className="px-3 py-1.5 text-zinc-500 hover:text-red-600 text-[13px] font-medium transition-colors"
                >
                  Unpublish
                </button>
              </>
            ) : (
              <button
                onClick={handlePublish}
                className="px-3 py-1.5 bg-zinc-900 text-white hover:bg-zinc-800 text-[13px] font-semibold rounded-md shadow-sm transition-colors"
              >
                Publish Form
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Toolbox */}
        <div className="w-[240px] bg-white border-r border-zinc-200 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-5 space-y-6">
            <div>
              <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Basic Inputs</h2>
              <div className="space-y-1">
                {[
                  { type: "TEXT", label: "Short Text", icon: "T" },
                  { type: "LONG_TEXT", label: "Long Text", icon: "¶" },
                  { type: "EMAIL", label: "Email", icon: "@" },
                  { type: "NUMBER", label: "Number", icon: "#" },
                  { type: "FILE", label: "File Upload", icon: "📎" },
                ].map((block) => (
                  <button key={block.type} onClick={() => addField(block.type as FieldType)} className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-zinc-700 rounded-lg hover:bg-zinc-100 hover:text-zinc-900 transition-colors">
                    <span className="w-6 h-6 flex items-center justify-center bg-zinc-100 rounded text-zinc-500 text-[11px]">{block.icon}</span>
                    {block.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Choices</h2>
              <div className="space-y-1">
                {[
                  { type: "SELECT", label: "Dropdown", icon: "▼" },
                  { type: "RADIO", label: "Single Choice", icon: "○" },
                  { type: "CHECKBOX", label: "Multiple Choice", icon: "☑" },
                ].map((block) => (
                  <button key={block.type} onClick={() => addField(block.type as FieldType)} className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-zinc-700 rounded-lg hover:bg-zinc-100 hover:text-zinc-900 transition-colors">
                    <span className="w-6 h-6 flex items-center justify-center bg-zinc-100 rounded text-zinc-500 text-[11px]">{block.icon}</span>
                    {block.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 overflow-y-auto p-8 md:p-16 relative" onClick={() => setSelectedFieldId(null)}>
          <div className="max-w-[640px] mx-auto pb-40">
            
            <div className="mb-12">
              <input
                 type="text"
                 value={form?.name || ""}
                 onChange={(e) => updateFormMeta({ name: e.target.value })}
                 className="w-full text-[40px] font-bold text-zinc-900 bg-transparent outline-none placeholder:text-zinc-300 mb-2 rounded-lg px-2 -mx-2 hover:bg-zinc-100/70 focus:bg-white focus:ring-1 focus:ring-zinc-900 transition-colors"
                 placeholder="Form Title"
              />
              <textarea
                 value={form?.description || ""}
                 onChange={(e) => updateFormMeta({ description: e.target.value })}
                 className="w-full text-[16px] text-zinc-500 bg-transparent outline-none resize-none placeholder:text-zinc-300 rounded-lg px-2 -mx-2 py-1 hover:bg-zinc-100/70 focus:bg-white focus:ring-1 focus:ring-zinc-900 transition-colors"
                 placeholder="Add a description..."
                 rows={2}
              />
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={fields} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {fields.length === 0 ? (
                    <div className="text-center p-12 border-2 border-dashed border-zinc-200 rounded-2xl">
                      <p className="text-[14px] text-zinc-500">This form is empty.</p>
                      <p className="text-[13px] text-zinc-400 mt-1">Click a block on the left to add it here.</p>
                    </div>
                  ) : (
                    fields.map((field) => (
                      <SortableField
                        key={field.id}
                        field={field}
                        isSelected={selectedFieldId === field.id}
                        onSelect={() => setSelectedFieldId(field.id)}
                        onRemove={(e) => {
                          e.stopPropagation();
                          setFields(fields.filter((f) => f.id !== field.id));
                          setRules((prev) =>
                            prev.filter(
                              (r) => r.sourceFieldId !== field.id && r.targetFieldId !== field.id
                            )
                          );
                          if (selectedFieldId === field.id) setSelectedFieldId(null);
                        }}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </DndContext>
            
          </div>
        </div>

        {/* Right Sidebar: Settings */}
        <div className={`w-[320px] bg-white border-l border-zinc-200 flex flex-col shrink-0 overflow-y-auto transition-all ${selectedField ? 'translate-x-0 border-l' : 'translate-x-[320px] border-transparent'} absolute right-0 top-14 bottom-0 z-20 shadow-xl md:shadow-none md:static md:translate-x-0`} style={{ display: selectedField ? 'flex' : 'none' }}>
          <div className="h-14 border-b border-zinc-100 flex justify-between items-center px-5 shrink-0">
            <h2 className="text-[13px] font-bold text-zinc-900">Properties</h2>
            <button onClick={() => setSelectedFieldId(null)} className="text-zinc-400 hover:text-zinc-900">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.557 2.99385 11.193 2.99385 10.9684 3.2184L7.49999 6.68682L4.03157 3.2184C3.80702 2.99385 3.44295 2.99385 3.2184 3.2184C2.99385 3.44295 2.99385 3.80702 3.2184 4.03157L6.68682 7.49999L3.2184 10.9684C2.99385 11.193 2.99385 11.557 3.2184 11.7816C3.44295 12.0062 3.80702 12.0062 4.03157 11.7816L7.49999 8.31316L10.9684 11.7816C11.193 12.0062 11.557 12.0062 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31316 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            </button>
          </div>
          
          {selectedField && (
            <div className="p-5 space-y-6">
              
              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Field Label</label>
                <textarea
                  value={selectedField.label}
                  onChange={(e) => updateSelectedField({ label: e.target.value })}
                  className="w-full text-[14px] px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Field Type</label>
                <select
                  value={selectedField.type}
                  onChange={(e) => {
                    const newType = e.target.value as FieldType;
                    const needsOptions = ["SELECT", "CHECKBOX", "RADIO"].includes(newType);
                    updateSelectedField({ 
                      type: newType,
                      options: needsOptions ? (selectedField.options || ["Option 1", "Option 2"]) : null
                    });
                  }}
                  className="w-full text-[14px] px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 bg-white"
                >
                  <option value="TEXT">Short Text</option>
                  <option value="LONG_TEXT">Long Text</option>
                  <option value="EMAIL">Email</option>
                  <option value="NUMBER">Number</option>
                  <option value="FILE">File Upload</option>
                  <option value="SELECT">Dropdown</option>
                  <option value="RADIO">Single Choice</option>
                  <option value="CHECKBOX">Multiple Choice</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="required-toggle"
                  checked={selectedField.required}
                  onChange={(e) => updateSelectedField({ required: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                />
                <label htmlFor="required-toggle" className="text-[14px] font-medium text-zinc-900 cursor-pointer select-none">
                  Make this field required
                </label>
              </div>

              {selectedField.options && (
                <div className="space-y-3 pt-6 border-t border-zinc-100">
                  <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Options</label>
                  <div className="space-y-2">
                    {selectedField.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2 group/opt">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...selectedField.options!];
                            newOpts[idx] = e.target.value;
                            updateSelectedField({ options: newOpts });
                          }}
                          className="flex-1 text-[13px] px-3 py-1.5 border border-zinc-200 rounded-md focus:outline-none focus:border-zinc-900"
                        />
                        <button onClick={() => {
                          const newOpts = selectedField.options!.filter((_, i) => i !== idx);
                          updateSelectedField({ options: newOpts });
                        }} className="text-zinc-400 hover:text-red-500 opacity-0 group-hover/opt:opacity-100 transition-opacity p-1">
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => {
                    updateSelectedField({ options: [...selectedField.options!, `Option ${selectedField.options!.length + 1}`] });
                  }} className="text-[13px] font-semibold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-md transition-colors w-full text-left">
                    + Add option
                  </button>
                </div>
              )}

              {/* Conditional Logic */}
              {fields.length > 1 && (
                <div className="space-y-3 pt-6 border-t border-zinc-100">
                  <label className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">Conditional Logic</label>
                  {rules.filter((r) => r.sourceFieldId === selectedField.id).map((rule) => (
                    <div key={rule.id} className="p-3 bg-zinc-50 rounded-xl space-y-2 border border-zinc-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-zinc-400 uppercase">IF</span>
                        <button
                          onClick={() => removeRule(rule.id)}
                          className="text-zinc-400 hover:text-red-500 p-1"
                          title="Delete rule"
                        >
                          &times;
                        </button>
                      </div>
                      <p className="text-[12px] text-zinc-500 truncate">answer to <span className="font-semibold text-zinc-800">{selectedField.label}</span></p>
                      <div className="flex gap-2">
                        <select
                          value={rule.operator}
                          onChange={(e) => updateRule(rule.id, { operator: e.target.value as RuleOperator })}
                          className="flex-1 text-[12px] px-2 py-1.5 border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-zinc-900"
                        >
                          {(Object.keys(OPERATOR_LABELS) as RuleOperator[]).map((op) => (
                            <option key={op} value={op}>{OPERATOR_LABELS[op]}</option>
                          ))}
                        </select>
                        {COMPARISON_OPERATORS.includes(rule.operator) && (
                          <input
                            type={selectedField.type === "NUMBER" ? "number" : "text"}
                            value={rule.value ?? ""}
                            onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                            placeholder="value"
                            className="w-24 text-[12px] px-2 py-1.5 border border-zinc-200 rounded-md focus:outline-none focus:border-zinc-900"
                          />
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-zinc-400 uppercase pt-1">THEN</p>
                      <div className="flex gap-2">
                        <select
                          value={rule.action}
                          onChange={(e) => updateRule(rule.id, { action: e.target.value as RuleAction })}
                          className="text-[12px] px-2 py-1.5 border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-zinc-900"
                        >
                          <option value="SHOW">Show</option>
                          <option value="HIDE">Hide</option>
                        </select>
                        <select
                          value={rule.targetFieldId}
                          onChange={(e) => updateRule(rule.id, { targetFieldId: e.target.value })}
                          className="flex-1 text-[12px] px-2 py-1.5 border border-zinc-200 rounded-md bg-white focus:outline-none focus:border-zinc-900"
                        >
                          <option value="" disabled>Select field...</option>
                          {fields.filter((f) => f.id !== selectedField.id).map((f) => (
                            <option key={f.id} value={f.id}>{f.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addRule}
                    className="text-[13px] font-semibold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-md transition-colors w-full text-left"
                  >
                    + Add rule
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
