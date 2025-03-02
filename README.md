# Grains.js

A lightweight reactive micro-states management library for HTML. Grains.js allows you to create isolated state containers in your HTML using custom attributes, without any build step or complex setup.

![Tests](https://github.com/mk0y/grains.js/actions/workflows/ci.yml/badge.svg)
![Coverage](https://codecov.io/gh/mk0y/grains.js/branch/main/graph/badge.svg)

## Features

- 🎯 Micro-states: Create isolated state containers for specific HTML segments
- 🔄 Reactive: Automatic UI updates when state changes
- 🪶 Lightweight: No dependencies, single file
- 🔌 No build step: Include via a simple script tag
- 🎨 Flexible: Share state between components when needed
- 🛠️ Simple API: Uses HTML attributes for all functionality

## Installation

```html
<script src="dist/grains.min.js"></script>
```

## Usage

### Basic Example

```html
<div g-state="counter" g-init='{"count": 0}'>
  <p g-text="{count}">0</p>
  <button g-click="increment">+1</button>
</div>

<script>
  function increment({ get, set }) {
    set({ count: get("count") + 1 });
  }
</script>
```

### Directives

- `g-state`: Defines a state container and optionally binds an update function
- `g-init`: Sets initial state (JSON format)
- `g-text`: Binds text content to state value
- `g-class`: Conditionally applies classes
- `g-click`: Binds click handler
- `g-args`: Passes arguments to click handler (JSON format)

### State Management

Each state container provides a context object with the following methods:

- `get(path)`: Get value at path from state
- `set(updates)`: Update state with new values
- `getState()`: Get entire state object

### Class Binding

```html
<div g-state="theme" g-init='{"isDark": false}' g-class='{"dark-mode": isDark}'>
  <button g-click="toggleTheme">Toggle Theme</button>
</div>

<script>
  function toggleTheme({ get, set }) {
    set({ isDark: !get("isDark") });
  }
</script>
```

### Sharing State

States can be shared between components by using the same state name:

```html
<div g-state="sharedState" g-init='{"value": 0}'>
  <p g-text="{value}"></p>
</div>

<div g-state="sharedState">
  <button g-click="increment">Increment Shared Value</button>
</div>
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build library
npm run build
```

## License

MIT
