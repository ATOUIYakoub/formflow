"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

type FieldType = "TEXT" | "NUMBER" | "EMAIL" | "LONG_TEXT" | "SELECT" | "CHECKBOX" | "RADIO";

type Field = {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options: string[] | null;
};

export default function FormBuilderPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [form, setForm] = useState<any>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const data = await api(`/forms/${id}`);
        setForm(data);
        setFields(data.fields || []);
      } catch (err: any) {
        setError(err.message || "Failed to load form");
      } finally {
        setIsLoading(false);
      }
    };
    fetchForm();
  }, [id]);

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

  const removeField = (fieldId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFields(fields.filter((f) => f.id !== fieldId));
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  };

  const moveField = (index: number, direction: -1 | 1, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFields = [...fields];
    if (index + direction < 0 || index + direction >= newFields.length) return;
    
    // Swap
    const temp = newFields[index];
    newFields[index] = newFields[index + direction];
    newFields[index + direction] = temp;
    
    setFields(newFields);
  };

  const updateSelectedField = (updates: Partial<Field>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === selectedFieldId ? { ...f, ...updates } : f))
    );
  };

  const updateOption = (optIndex: number, newValue: string) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== selectedFieldId || !f.options) return f;
        const newOpts = [...f.options];
        newOpts[optIndex] = newValue;
        return { ...f, options: newOpts };
      })
    );
  };

  const addOption = () => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== selectedFieldId || !f.options) return f;
        return { ...f, options: [...f.options, `Option ${f.options.length + 1}`] };
      })
    );
  };

  const removeOption = (optIndex: number) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id !== selectedFieldId || !f.options) return f;
        const newOpts = f.options.filter((_, i) => i !== optIndex);
        return { ...f, options: newOpts };
      })
    );
  };

  const saveForm = async () => {
    try {
      setIsSaving(true);
      await api(`/forms/${id}/fields`, {
        method: "POST",
        body: JSON.stringify({ fields }),
      });
      alert("Form saved successfully!");
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full"></div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="p-10 text-red-600">
        <p>{error || "Not found"}</p>
        <Link href="/dashboard/forms" className="underline">&larr; Back</Link>
      </div>
    );
  }

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  return (
    <div className="h-[calc(100vh-64px)] md:h-screen flex flex-col font-sans bg-zinc-50 overflow-hidden">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-zinc-200 px-6 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/forms" className="text-zinc-400 hover:text-zinc-900 transition-colors">
            &larr;
          </Link>
          <h1 className="text-[16px] font-bold text-zinc-900 truncate max-w-sm">{form.name}</h1>
        </div>
        <button
          onClick={saveForm}
          disabled={isSaving}
          className="px-4 py-2 bg-zinc-900 text-white text-[13px] font-semibold rounded-lg hover:bg-zinc-800 disabled:opacity-50 shadow-sm"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Toolbox */}
        <div className="w-64 bg-white border-r border-zinc-200 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-zinc-100">
            <h2 className="text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Blocks</h2>
          </div>
          <div className="p-2 space-y-1">
            {[
              { type: "TEXT", label: "Short Text" },
              { type: "LONG_TEXT", label: "Long Text" },
              { type: "EMAIL", label: "Email" },
              { type: "NUMBER", label: "Number" },
              { type: "SELECT", label: "Dropdown" },
              { type: "RADIO", label: "Single Choice" },
              { type: "CHECKBOX", label: "Multiple Choice" },
            ].map((block) => (
              <button
                key={block.type}
                onClick={() => addField(block.type as FieldType)}
                className="w-full text-left px-4 py-2.5 text-[14px] font-medium text-zinc-700 rounded-lg hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              >
                + {block.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 relative" onClick={() => setSelectedFieldId(null)}>
          <div className="max-w-[600px] mx-auto space-y-4 pb-32">
            
            <div className="mb-10 text-center">
              <h1 className="text-[32px] font-bold text-zinc-900">{form.name}</h1>
              {form.description && <p className="text-[16px] text-zinc-500 mt-2">{form.description}</p>}
            </div>

            {fields.length === 0 ? (
              <div className="text-center p-12 border border-dashed border-zinc-300 rounded-2xl bg-zinc-50">
                <p className="text-[14px] text-zinc-500">Your form is empty.</p>
                <p className="text-[13px] text-zinc-400 mt-1">Click blocks on the left to add them.</p>
              </div>
            ) : (
              fields.map((field, index) => (
                <div
                  key={field.id}
                  onClick={(e) => { e.stopPropagation(); setSelectedFieldId(field.id); }}
                  className={`group relative p-6 rounded-2xl bg-white border cursor-pointer transition-all ${
                    selectedFieldId === field.id
                      ? "border-zinc-900 shadow-sm ring-1 ring-zinc-900"
                      : "border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  {/* Reorder & Delete actions */}
                  <div className={`absolute -right-4 top-1/2 -translate-y-1/2 flex-col gap-1 ${selectedFieldId === field.id ? 'flex' : 'hidden group-hover:flex'}`}>
                    <button onClick={(e) => moveField(index, -1, e)} className="w-8 h-8 bg-white border border-zinc-200 shadow-sm rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:border-zinc-400">&uarr;</button>
                    <button onClick={(e) => moveField(index, 1, e)} className="w-8 h-8 bg-white border border-zinc-200 shadow-sm rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:border-zinc-400">&darr;</button>
                    <button onClick={(e) => removeField(field.id, e)} className="w-8 h-8 bg-white border border-zinc-200 shadow-sm rounded-full flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-400 mt-2">&times;</button>
                  </div>

                  <label className="block text-[15px] font-semibold text-zinc-900 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {/* Render Mock Inputs */}
                  {(field.type === "TEXT" || field.type === "EMAIL" || field.type === "NUMBER") && (
                    <div className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 pointer-events-none"></div>
                  )}
                  {field.type === "LONG_TEXT" && (
                    <div className="h-24 w-full rounded-lg border border-zinc-200 bg-zinc-50 pointer-events-none"></div>
                  )}
                  {field.type === "SELECT" && (
                    <div className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 pointer-events-none flex items-center px-3 text-zinc-400 text-sm">Select an option...</div>
                  )}
                  {(field.type === "RADIO" || field.type === "CHECKBOX") && (
                    <div className="space-y-2 pointer-events-none">
                      {field.options?.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className={`w-4 h-4 border border-zinc-300 ${field.type === 'RADIO' ? 'rounded-full' : 'rounded'}`}></div>
                          <span className="text-[14px] text-zinc-700">{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar: Settings */}
        <div className={`w-72 bg-white border-l border-zinc-200 flex flex-col shrink-0 overflow-y-auto transition-transform ${selectedField ? 'translate-x-0' : 'translate-x-full'}`} style={{ display: selectedField ? 'flex' : 'none' }}>
          <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
            <h2 className="text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Field Settings</h2>
            <button onClick={() => setSelectedFieldId(null)} className="text-zinc-400 hover:text-zinc-900">&times;</button>
          </div>
          
          {selectedField && (
            <div className="p-5 space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-900">Label</label>
                <input
                  type="text"
                  value={selectedField.label}
                  onChange={(e) => updateSelectedField({ label: e.target.value })}
                  className="w-full text-[14px] px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-900">Type</label>
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
                  className="w-full text-[14px] px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 bg-white"
                >
                  <option value="TEXT">Short Text</option>
                  <option value="LONG_TEXT">Long Text</option>
                  <option value="EMAIL">Email</option>
                  <option value="NUMBER">Number</option>
                  <option value="SELECT">Dropdown</option>
                  <option value="RADIO">Single Choice</option>
                  <option value="CHECKBOX">Multiple Choice</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required-toggle"
                  checked={selectedField.required}
                  onChange={(e) => updateSelectedField({ required: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-300 accent-zinc-900"
                />
                <label htmlFor="required-toggle" className="text-[14px] font-medium text-zinc-900 cursor-pointer">
                  Required field
                </label>
              </div>

              {selectedField.options && (
                <div className="space-y-3 pt-4 border-t border-zinc-100">
                  <label className="text-[13px] font-semibold text-zinc-900">Options</label>
                  {selectedField.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(idx, e.target.value)}
                        className="flex-1 text-[13px] px-2 py-1.5 border border-zinc-200 rounded focus:outline-none focus:border-zinc-900"
                      />
                      <button onClick={() => removeOption(idx)} className="text-zinc-400 hover:text-red-500 p-1">&times;</button>
                    </div>
                  ))}
                  <button onClick={addOption} className="text-[13px] font-medium text-zinc-600 hover:text-zinc-900">
                    + Add option
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
