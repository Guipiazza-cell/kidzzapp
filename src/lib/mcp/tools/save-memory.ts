import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "save_memory",
  title: "Save family memory",
  description: "Save a new family memory (achievement, moment, note) for a child.",
  inputSchema: {
    crianca_id: z.string().uuid().describe("Target child id (from list_children)."),
    title: z.string().trim().min(1).describe("Short memory title."),
    content: z.string().optional().describe("Optional longer description."),
    type: z.string().optional().describe("Memory type, e.g. achievement, moment, note."),
    is_special: z.boolean().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ crianca_id, title, content, type, is_special }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("memories")
      .insert({
        user_id: ctx.getUserId(),
        crianca_id,
        title,
        content: content ?? null,
        type: type ?? "moment",
        is_special: is_special ?? false,
      })
      .select("id, title, type, crianca_id, created_at")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Saved memory ${data.id}` }],
      structuredContent: { memory: data },
    };
  },
});
