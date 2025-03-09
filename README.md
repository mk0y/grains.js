# Grains.js: Lightweight Reactive Micro-States for HTML

Grains.js is a tiny, reactive state management library designed for HTML. It lets you create isolated state containers directly within your HTML using custom attributes, eliminating the need for a build step or complex setup. Simply include the library via a `<script>` tag and start managing your component states **declaratively**. Grains.js offers a simple, intuitive API that leverages HTML attributes for all functionality.

![Tests](https://github.com/mk0y/grains.js/actions/workflows/ci.yml/badge.svg)
![Coverage](https://codecov.io/gh/mk0y/grains.js/branch/main/graph/badge.svg)

## Features

- 🎯 Micro-states: Create isolated state containers for specific HTML segments, e.g. `<div>` sections.
- 🔄 Reactive: Automatic UI updates whenever your state changes.
- 🪶 Lightweight: No dependencies, single file library.
- 🔌 No Build Step: Include directly via a `<script>` tag.
- 🎨 Flexible: Easily share state between components.
- 🛠️ Simple API: Uses intuitive HTML attributes.
- ↩️ Undo/Redo: Built-in support for state history.
- ✨ Transitions/Animations: Easily integrate animations with state changes.
- 🟰 Expression Evaluation: Use JavaScript expressions directly in your directives.

## Installation

Include the minified version via a `<script>` tag:

```html
<script src="https://mk0y.github.io/grains.js/dist/grains.min.js"></script>
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

## Usage

Grains.js uses custom attributes prefixed with g- to manage state and define reactive behavior. Here's a quick overview:

### Core Directives

- `g-state="stateName"`: Defines a state container. "stateName" is used to identify the state object.
- `g-init="jsonString"` or `g-init="varName"`: Specifies the initial state as a JSON object. This attribute is optional; if omitted, the initial state will be an empty object ({}). You can also use a globally scoped variable.
- `g-text="statePath"`: Binds the text content of an element to a value within the state. "statePath" uses dot notation to access nested properties (e.g., {user.name}).
- `g-model="{statePath}"`: Enables two-way data binding for form elements (inputs, textareas, selects). Support for other form elements such as files will be added incrementally.
- `g-class="[expressions]"`: Conditionally applies CSS classes based on the evaluated expression.
- `g-attr="attrName:expression"`: Dynamically sets or updates an HTML attribute based on the evaluated expression. Multiple attributes can be set using comma-separated pairs (e.g., g-attr="disabled:isDisabled, value:inputValue").
- `g-show="expression"`: Shows or hides an element based on whether the expression evaluates to true or false and the previous value. It uses `display` css property.
- `g-on:event="handlerName"`: Attaches an event listener. "handlerName" must refer to a globally defined JavaScript function.
- `g-action="action"`: Triggers undo/redo actions ("undo" or "redo"). Requires a g-state definition.
- `g-disabled="expression"`: Disables or enables an element based on the evaluated expression.

## Code Examples

### g-state, g-init, g-text:

```html
<div g-state="counter" g-init='{"count": 0}'>
  <p g-text="{count}">0</p>
  <button g-on:click="increment">+1</button>
</div>
<script>
  function increment({ get, set }) {
    set({ count: get("count") + 1 });
  }
</script>
```

### g-class:

```html
<div g-state="theme" g-init='{"isDark": false}' g-class='{"dark-mode": isDark}'>
  <button g-on:click="toggleTheme">Toggle Theme</button>
</div>
<script>
  function toggleTheme({ set, get }) {
    set({ isDark: !get("isDark") });
  }
</script>
```

### g-attr:

```html
<div g-state="input" g-init='{"value":"", "placeholderText":"Enter Text"}'>
  <input
    type="text"
    g-state="input"
    g-model="value"
    g-attr="placeholder:placeholderText"
  />
  <p g-text="value"></p>
</div>
```

### g-show:

```html
<div g-state="visibility" g-init='{"isVisible": true}'>
  <div g-show="isVisible">This div is visible</div>
  <button g-on:click="toggleVisibility">Toggle Visibility</button>
</div>
<script>
  function toggleVisibility({ set, get }) {
    set({ isVisible: !get("isVisible") });
  }
</script>
```

### g-model:

```html
<input type="text" g-state="myInput" g-model="value" />
<p g-text="value"></p>
```

### g-disabled:

```html
<button g-state="button" g-init='{"isEnabled": true}' g-disabled="!isEnabled">
  Click Me
</button>
<button g-on:click="toggleEnabled">Toggle Enabled</button>
<script>
  function toggleEnabled({ set, get }) {
    set({ isEnabled: !get("isEnabled") });
  }
</script>
```

## Examples

Several example files demonstrate Grains.js usage:

- `examples/minimal.html`: A basic counter example showcasing core directives. ([See it in action](https://mk0y.github.io/grains.js/examples/minimal.html))
- `examples/class.html`: Demonstrates the g-class directive for conditional class binding. ([See it in action](https://mk0y.github.io/grains.js/examples/class.html))
- `examples/form.html`: Shows how to use g-model for two-way data binding in forms. ([See it in action](https://mk0y.github.io/grains.js/examples/form.html))
- `examples/transitions.html`: Illustrates integrating animations with state changes using CSS transitions. ([See it in action](https://mk0y.github.io/grains.js/examples/transitions.html))

### Sharing State

States can be shared between components by using the same state name:

```html
<div g-state="sharedState" g-init='{"value": 0}'>
  <p g-text="value"></p>
</div>

<div g-state="sharedState">
  <button g-click="increment">Increment Shared Value</button>
</div>
```

## Utility Functions

Grains.js provides several built-in utility functions that can be used directly within expressions in your directives. These functions simplify common state checks and comparisons, making your directives more concise and readable. The following utility functions are available:

- `canUndo`: Checks if an undo operation is possible for the given element's state. Returns true if there is history available for undo, false otherwise.
- `canRedo`: Checks if a redo operation is possible for the given element's state. Returns true if there is history available for redo, false otherwise.
- `isPositive(path)`: Checks if the value at the specified state path in the element's grain state is greater than 0. "path" uses dot notation (e.g., "user.age").
- `isNegative(path)`: Checks if the value at the specified path in the element's grain state is less than 0. "path" uses dot notation (e.g., "user.balance").
- `isEmpty(path)`: Checks if the value at the specified state path in the element's grain state is considered empty (0, "", null, or undefined). "path" uses dot notation (e.g., "user.address").
- `equals(path, compareValue)`: Checks if the value at the specified path in the element's grain state is strictly equal (===) to the provided compareValue. "path" uses dot notation (e.g., "user.status").

These functions are called directly within your expressions, for example:

```html
<div g-state="myState" g-init='{"count": 5}'>
  <button g-disabled="!isPositive('count')">
    Click me if count is positive
  </button>
</div>
```

## Testing

The test suite provides comprehensive coverage of the core functionality and directives.

Tests are located in the src/**tests** directory.

Grains.js uses Vitest for testing. To run the tests:

1. Clone the repository: git clone https://github.com/mk0y/grains.js.git
2. Navigate to the project directory: cd grains.js
3. Install dependencies: `npm install`
4. Run tests: `npm test`

## Contributing

We welcome contributions! Please see the [CONTRIBUTING](CONTRIBUTING) file for guidelines.

## Contact

For any questions or inquiries, please contact: marko@astrodev.studio.

Or join our [Discord channel](https://discord.gg/RKeBjRKZ).

## License

MIT License. See [LICENSE](LICENSE) file for details.
