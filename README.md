# @akka-bot/sdk

Akka WhatsApp Command Platform SDK — build commands for the Akka marketplace.

## Installation

```bash
npm install @akka-bot/sdk
# or
bun add @akka-bot/sdk
```

## Quick Start

1. Create a GitHub repository with an `akka.yaml` manifest and your command code
2. Log in to the [Akka Developer Portal](https://akka.arkk.dev/developer)
3. Link your repository — Akka will fetch and validate your commands
4. Users can install your commands via `.marketplace`

### Example Command

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

### The `akka.yaml` Manifest

Every Akka command repository must have an `akka.yaml` file at the root. This manifest defines all commands in your repository.

**Required fields:**

- `version`: Manifest version (currently `"1"`)
- `commands`: Array of command definitions

**Command definition fields:**

- `slug`: Unique identifier within your repository (lowercase, no spaces)
- `name`: Human-readable command name
- `description`: Brief description of what the command does
- `usage`: Usage example (e.g., `".weather <city>"`)
- `entryPoint`: Path to the TypeScript file containing the command handler

**Example `akka.yaml`:**

```yaml
version: "1"
commands:
  - slug: weather
    name: Weather
    description: Get current weather for any city
    usage: ".weather <city>"
    entryPoint: weather.ts

  - slug: remind
    name: Remind Me
    description: Set a delayed reminder
    usage: ".remind <duration> <message>"
    entryPoint: reminder.ts
```

**Repository structure example:**

```
my-akka-commands/
├── akka.yaml          # Manifest file (required)
├── weather.ts         # Command implementation
├── reminder.ts        # Command implementation
├── package.json       # Optional: if you need dependencies
└── README.md          # Optional: documentation
```

### Publishing Steps

1. Push your command code to a **public GitHub repository** with an `akka.yaml` manifest.
2. Each command module must have a default export created with `command()`.
3. Log in to the [Akka Developer Portal](https://akka.arkk.dev/developer).
4. Link your repository — Akka will fetch the manifest, validate all commands, and publish them to the marketplace.
5. Users can discover and install your commands via `.marketplace`.

### Troubleshooting

**"Manifest file 'akka.yaml' not found"**
- Ensure `akka.yaml` is at the root of your repository
- Check the file name is exactly `akka.yaml` (not `akka.yml`)

**"Entry point not found"**
- Verify the `entryPoint` path in `akka.yaml` matches your file structure
- Paths are relative to repository root

**"Command failed to execute"**
- Check your command exports a default object with a `handle` function
- Review error logs in the Developer Dashboard
- Test locally by importing and calling your handler

## License

MIT
