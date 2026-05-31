import { describe, it, expect } from "bun:test";
import { command, type CommandContext, type CommandDefinition } from "../src/index";

describe("@akka/sdk", () => {
  describe("command()", () => {
    it("should accept a valid command definition", () => {
      const def = command({
        name: "Echo",
        description: "Echoes back input",
        usage: ".echo [text]",
        async handle(ctx: CommandContext) {
          await ctx.send(ctx.args.join(" ") || "Hello!");
        },
      });

      expect(def.name).toBe("Echo");
      expect(def.description).toBe("Echoes back input");
      expect(def.usage).toBe(".echo [text]");
      expect(typeof def.handle).toBe("function");
    });

    it("should throw if name is missing or empty", () => {
      expect(() =>
        command({
          name: "",
          description: "Test",
          usage: ".test",
          async handle(_ctx: CommandContext) {},
        }),
      ).toThrow("non-empty 'name'");

      expect(() =>
        command({
          description: "Test",
          usage: ".test",
          async handle(_ctx: CommandContext) {},
        } as unknown as CommandDefinition),
      ).toThrow("non-empty 'name'");
    });

    it("should throw if description is missing or empty", () => {
      expect(() =>
        command({
          name: "Test",
          description: "",
          usage: ".test",
          async handle(_ctx: CommandContext) {},
        }),
      ).toThrow("non-empty 'description'");
    });

    it("should throw if usage is missing or empty", () => {
      expect(() =>
        command({
          name: "Test",
          description: "Test",
          usage: "",
          async handle(_ctx: CommandContext) {},
        }),
      ).toThrow("non-empty 'usage'");
    });

    it("should throw if handle is missing or not a function", () => {
      expect(() =>
        command({
          name: "Test",
          description: "Test",
          usage: ".test",
        } as unknown as CommandDefinition),
      ).toThrow("'handle' async function");

      expect(() =>
        command({
          name: "Test",
          description: "Test",
          usage: ".test",
          handle: "nope" as unknown as (ctx: CommandContext) => Promise<void>,
        }),
      ).toThrow("'handle' async function");
    });
  });

  describe("CommandContext interface", () => {
    it("should satisfy the expected contract", () => {
      const ctx: CommandContext = {
        send: async () => {},
        react: async () => {},
        schedule: async () => {},
        fetch: async () => new Response(),
        userId: "anon_abc123",
        args: ["hello", "world"],
        message: ".echo hello world",
        contactId: 1,
      };

      expect(ctx.userId).toBe("anon_abc123");
      expect(ctx.args).toEqual(["hello", "world"]);
      expect(ctx.message).toBe(".echo hello world");
      expect(ctx.contactId).toBe(1);
    });
  });

  describe("CommandDefinition interface", () => {
    it("should accept a minimal valid definition", () => {
      const def: CommandDefinition = {
        name: "Minimal",
        description: "Minimal command",
        usage: ".minimal",
        async handle(_ctx: CommandContext) {},
      };

      expect(def.name).toBe("Minimal");
    });
  });
});
