# @akka-bot/sdk

Akka WhatsApp Command Platform SDK — build commands for the Akka marketplace.

## Installation

```bash
npm install @akka-bot/sdk
# or
bun add @akka-bot/sdk
```

## Quick Start

Create a GitHub repository with your command code, then export a command definition as the default export:

```typescript
import { command } from "@akka/sdk";

export default command({
  name: "Echo",
  description: "Echoes back your message",
  usage: ".echo [text]",
  async handle(ctx) {
    await ctx.send(ctx.args.join(" ") || "Hello from Akka!");
  }
});
```

Then register your repository in the [Akka Developer Portal](https://akka.dev/developers).

## API

### `command(definition)`

Validates a `CommandDefinition` and returns it. Throws if required fields are missing.

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | ✅ | Display name in marketplace |
| `description` | `string` | ✅ | Short description |
| `usage` | `string` | ✅ | Usage example, e.g. `.echo [text]` |
| `handle` | `(ctx: CommandContext) => Promise<void>` | ✅ | The command handler |

### `CommandContext`

Injected into `handle(ctx)` at execution time:

| Method / Property | Signature | Description |
|---|---|---|
| `send` | `(text: string) => Promise<void>` | Send a WhatsApp message |
| `react` | `(emoji: string) => Promise<void>` | React to the user's message |
| `schedule` | `(duration: string, cb: () => Promise<void>) => Promise<void>` | Schedule delayed execution |
| `fetch` | `(url: string, opts?: RequestInit) => Promise<Response>` | HTTP request |
| `userId` | `string` (readonly) | Anonymized user ID |
| `args` | `string[]` (readonly) | Parsed arguments |
| `message` | `string` (readonly) | Full message text |
| `contactId` | `number` (readonly) | Internal contact ID |

### Duration format for `schedule()`

| Example | Meaning |
|---|---|
| `"30s"` | 30 seconds |
| `"10m"` | 10 minutes |
| `"2h"` | 2 hours |
| `"1d"` | 1 day |

## Examples

### Weather Command

```typescript
import { command } from "@akka/sdk";

export default command({
  name: "Weather",
  description: "Get current weather for any city",
  usage: ".weather [city]",
  async handle(ctx) {
    const city = ctx.args[0] ?? "London";
    const res = await ctx.fetch(`https://wttr.in/${city}?format=%C+%t`);
    const text = await res.text();
    await ctx.send(`🌤 ${city}: ${text}`);
  },
});
```

### Reminder Command

```typescript
import { command } from "@akka/sdk";

export default command({
  name: "Remind Me",
  description: "Set a reminder with natural durations",
  usage: ".remind me 10m check email",
  async handle(ctx) {
    const [duration, ...rest] = ctx.args;
    const message = rest.join(" ");

    await ctx.schedule(duration, async () => {
      await ctx.send(`⏰ Reminder: ${message}`);
    });
    await ctx.send(`✅ I'll remind you in ${duration}`);
  },
});
```

## Publishing to the Marketplace

1. Push your command code to a **public GitHub repository**.
2. Each command module must have a default export created with `command()`.
3. Register your repository in the [Akka Developer Portal](https://akka.dev/developers).
4. Akka will clone your repo, validate the command, and list it in the marketplace.

## License

MIT
