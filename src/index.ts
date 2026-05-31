/**
 * @akka-bot/sdk — Akka WhatsApp Command Platform SDK
 *
 * Build commands for the Akka marketplace.
 *
 * ## Quick Start
 *
 * ```typescript
 * import { command } from "@akka/sdk";
 *
 * export default command({
 *   name: "Echo",
 *   description: "Echoes back your message",
 *   usage: ".echo [text]",
 *   async handle(ctx) {
 *     await ctx.send(ctx.args.join(" ") || "Hello from Akka!");
 *   }
 * });
 * ```
 */

/**
 * Context object injected into your command handler at execution time.
 */
export interface CommandContext {
  /** Send a text message back to the user */
  send(text: string): Promise<void>;
  /** React with an emoji on the user's message */
  react(emoji: string): Promise<void>;
  /** Schedule a delayed callback (e.g. "10m", "2h", "30s") */
  schedule(duration: string, callback: () => Promise<void>): Promise<void>;
  /** Make HTTP requests to external APIs */
  fetch(url: string, options?: RequestInit): Promise<Response>;
  /** Anonymized user ID (not the phone number) */
  readonly userId: string;
  /** Arguments passed to the command (after the slug) */
  readonly args: string[];
  /** The full raw message text */
  readonly message: string;
  /** Internal contact identifier */
  readonly contactId: number;
}

/**
 * Definition of an Akka marketplace command.
 */
export interface CommandDefinition {
  /** Display name shown in marketplace listings */
  name: string;
  /** Short description of what the command does */
  description: string;
  /** Usage example — shown when user runs .help, e.g. ".echo [text]" */
  usage: string;
  /** The command handler. Called when a user runs this command. */
  handle(ctx: CommandContext): Promise<void>;
}

/**
 * Creates and validates a command definition.
 *
 * Use this as your module's default export. The platform reads the definition
 * at install time to register the command in the marketplace.
 *
 * @example
 * ```ts
 * export default command({
 *   name: "Weather",
 *   description: "Get the current weather",
 *   usage: ".weather [city]",
 *   async handle(ctx) {
 *     const city = ctx.args[0] ?? "London";
 *     const res = await ctx.fetch(`https://wttr.in/${city}?format=%C+%t`);
 *     const text = await res.text();
 *     await ctx.send(`🌤 ${city}: ${text}`);
 *   },
 * });
 * ```
 */
export function command(def: CommandDefinition): CommandDefinition {
  if (!def.name || typeof def.name !== "string") {
    throw new Error("Command must have a non-empty 'name' string");
  }
  if (!def.description || typeof def.description !== "string") {
    throw new Error("Command must have a non-empty 'description' string");
  }
  if (!def.usage || typeof def.usage !== "string") {
    throw new Error("Command must have a non-empty 'usage' string");
  }
  if (typeof def.handle !== "function") {
    throw new Error("Command must have a 'handle' async function");
  }
  return def;
}
// trigger publish
// v0.1.1
