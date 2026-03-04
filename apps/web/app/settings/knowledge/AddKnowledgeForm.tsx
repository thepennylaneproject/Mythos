"use client";

import { addKnowledgeAction } from "./actions";
import { useState } from "react";

export function AddKnowledgeForm({ orgId }: { orgId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
      >
        Add Knowledge
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border rounded-xl shadow-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Add Brand Knowledge</h2>
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <form action={async (formData) => {
          await addKnowledgeAction(formData);
          setIsOpen(false);
        }} className="space-y-4">
          <input type="hidden" name="orgId" value={orgId} />
          
          <div>
            <label className="block text-sm font-medium mb-1.5">Type</label>
            <select 
              name="type" 
              className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              defaultValue="style_guide"
            >
              <option value="style_guide">Style Guide</option>
              <option value="tone">Tone of Voice</option>
              <option value="asset_context">Asset Context</option>
              <option value="past_campaign">Past Campaign</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Content</label>
            <textarea 
              name="content" 
              required
              rows={6}
              className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
              placeholder="Paste your style guide, campaign results, or brand rules here..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-secondary text-secondary-foreground px-4 py-2 rounded-md font-medium hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Add & Index
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
