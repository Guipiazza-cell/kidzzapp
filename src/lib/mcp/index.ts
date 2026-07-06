import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listChildren from "./tools/list-children";
import listRecentQuestions from "./tools/list-recent-questions";
import listMemories from "./tools/list-memories";
import saveMemory from "./tools/save-memory";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "kidzz-mcp",
  title: "Kidzz MCP",
  version: "0.1.0",
  instructions:
    "Tools for the Kidzz parenting app. Read the signed-in parent's children, recent questions, and family memories; save new memories. All data is scoped to the authenticated user via Supabase RLS.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listChildren, listRecentQuestions, listMemories, saveMemory],
});
