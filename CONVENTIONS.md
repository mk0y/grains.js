You are an expert software developer assistant, especially for the frontend development.
Please always ask me if you have any questions or need further assistance especially if you need more context. If you're unsure about something, feel free to ask! If you're still unsure, don't hesitate to reach out to me.
Don't assume anything. If you're unsure about some function's definition, feel free to ask me.
Always think step by step.

In this file we'll describe what each file in our project does.
All tests are in `src/__tests__`.

# Core functionality

## src/app.ts

Main entry point for Grains.js library.

This file serves as the primary bootstrapping mechanism for Grains.js, responsible for:

1. Initializing the grain state management system
2. Scanning the DOM for grain elements on page load
3. Setting up reactive bindings for found grain elements
4. Exposing core library exports and types

The bootstrap process:

- Clears existing store state
- Queries DOM for elements with grain directives
- Sets up each grain element with reactive bindings

**Methods:**

- `bootstrap()`: Initializes the grain state management system. Clears the store, queries the DOM for elements with grain directives (`DIRECTIVE_SELECTORS.STATE`), and calls `setupGrain` for each element found. This function is triggered by the `DOMContentLoaded` event.

**Variables:**

- None are directly defined within `app.ts`; it uses:
  - `DIRECTIVE_SELECTORS.STATE` (from `./constants.ts`): A CSS selector string to find grain state elements.
  - `setupGrain` (from `./core/setup.ts`): A function to initialize individual grain instances.
  - `store` (from `./store.ts`): The global state store instance.

**Public exports:**

- `bootstrap`: Manual initialization function.
- `grainStore`: Global state store instance.
- `Grain`, `GrainContext`, `GrainElement`: Types.

## src/core/setup.ts

Core initialization module for individual grain instances.

This module handles the complete lifecycle setup of a grain component:

1.  State Initialization

    - Parses `g-state` directive to get state name
    - Initializes state using `getInitValue` (see below)
    - Sets up state history tracking

2.  Element Processing

    - Caches all relevant DOM elements for performance
    - Performs initial content updates for all directive elements

3.  Reactivity Setup

    - Creates observable state proxy
    - Configures update batching for state changes

4.  Global Integration

    - Registers state in global store
    - Adds state reference to window object
    - Sets up event listeners for interactive directives

5.  Cleanup Handling

    - Provides cleanup function to remove state and cache
    - Handles proper teardown of grain instances

This is a crucial file that orchestrates the core functionality
of grain components and their reactive behavior.

**Methods:**

- `setupGrain(el: GrainElement)`: The main function. Initializes a single grain instance. Handles state initialization, element caching, initial updates, reactivity setup, global integration, and cleanup.

**Helper Function:**

- `getInitValue(el: GrainElement): Grain`: This helper function retrieves the initial state value from the `g-init` attribute. It attempts to parse the attribute value as JSON. If parsing fails, it attempts to resolve the attribute value as a global variable name. It handles errors gracefully, providing informative console messages and defaulting to an empty object if neither JSON parsing nor global variable resolution succeeds. It also checks if the resolved global variable is of type `object` to prevent potential errors.

**Variables:**

- `el: GrainElement`: The root HTMLElement of the grain component.
- `stateName: string`: The name of the grain state, extracted from the `g-state` attribute.
- `initialState: Grain`: The parsed initial state object obtained from `getInitValue`.
- `cache: ElementCache`: The cached DOM elements within the grain component.
- `state: Grain`: The observable proxy of the grain's state.
- `el.$grain: Grain`: A property added to `el` to store the current grain state.
- `el.$cleanup: () => void`: A cleanup function added to `el` to remove the grain's state and cached elements.

## src/constants.ts

Global constants and configuration values for Grains.js

Contains:

1. DIRECTIVE_SELECTORS: CSS selector strings for different directive types

   - STATE: Elements that define grain states
   - INTERACTIVE: Elements with user interaction directives
   - DYNAMIC: Elements with reactive content directives
   - ALL: Combined selector for all grain-enabled elements

2. DIRECTIVES: List of all valid grain directive names
   Used for type checking and directive validation

3. MAX_HISTORY: Configuration for state history limit
   Defines maximum number of state changes to keep in history

**Variables:**

- `VALID_DOM_EVENTS`: A `Set` containing a list of valid DOM event names. Used to generate `EVENT_SELECTORS`.
- `EVENT_SELECTORS`: A string containing comma-separated CSS selectors for all events in `VALID_DOM_EVENTS`, used in `DIRECTIVE_SELECTORS.INTERACTIVE`.

These constants are used throughout the library to maintain
consistency in selectors and directive naming.

## src/batcher.ts

Provides a mechanism to batch multiple state changes and DOM updates
into a single render cycle using `requestAnimationFrame`.

Key features:

- Prevents redundant updates in the same animation frame
- Maintains a queue of pending grain element updates
- Provides both scheduled and force update capabilities
- Uses element cache for optimal performance

**Methods:**

- `scheduleUpdate(el: GrainElement)`: Adds an element to the pending updates queue and schedules a `requestAnimationFrame` callback if one isn't already scheduled.
- `processUpdates()`: Iterates through the pending updates queue, retrieves cached elements using `ElementCache`, and updates their content using `updateElementContent`. Clears the queue and resets the frame request flag after processing.
- `forceUpdate(el: GrainElement)`: Immediately updates the content of the provided element without waiting for the next animation frame. Removes the element from the pending updates queue.

**Variables:**

- `pendingUpdates`: A `Set` storing `GrainElement`s awaiting updates.
- `frameRequested`: A boolean flag indicating whether a `requestAnimationFrame` callback is already scheduled.

**Exports:**

- `updateElement(el: GrainElement)`: A function to schedule an update for a given element.
- `UpdateBatcher`: The class itself, exporting its methods for direct access.

## src/cache.ts

DOM element caching system for performance optimization.

Uses WeakMap to store references to directive elements, preventing
repeated DOM queries. Caches elements by their directive types:

- Text elements (g-text)
- Show/hide elements (g-show)
- Interactive elements (g-click, g-action)
- All directive elements combined

WeakMap ensures proper garbage collection when elements are removed

**Methods:**

- `cacheElements(rootEl: HTMLElement)`: Caches all relevant elements within the provided `rootEl` and returns the cached object. The cached object contains arrays of elements for each directive type (`textElements`, `showElements`, `interactiveElements`, `allElements`).
- `getCache(rootEl: HTMLElement)`: Retrieves the cached element data for a given `rootEl`. Returns an object containing arrays of elements or `undefined` if no cache exists.
- `clearCache(rootEl: HTMLElement)`: Removes the cached element data for a given `rootEl`.

**Variables:**

- `cache`: A `WeakMap` storing cached element data. The key is the `HTMLElement` and the value is an object containing arrays of elements for each directive type.

## src/utils.ts

Utility functions for common operations.

Contains core helper functions:

- **deepClone(obj: T): T:** Deep object cloning using `rfdc`. Clones the input object recursively.
- **findClosestGrainElement(el: HTMLElement): GrainElement | null:** Traverses the DOM upwards from the given element to find the closest ancestor element with the "g-state" attribute. Returns the element or null if not found.
- **getValueAtPath(obj: any, path: string): any:** Accesses a nested property of an object using a dot-separated path string. Returns the value at the specified path or undefined if not found.
- **setValueAtPath(obj: any, path: string, value: any): void:** Sets a nested property of an object using a dot-separated path string. Creates intermediate objects if necessary.
- **applyDiff(target: Record<string, any>, diffs: ReturnType<typeof diff>): Record<string, any>:** Applies a diff (from `microdiff`) to a target object. Modifies the target object in place.

These utilities support state management, DOM operations, and object manipulations throughout the library.

## src/types.ts

Type definitions for Grains.js core functionality.

Defines:

- Grain: Base state object interface
- GrainHistory: State history tracking structure
- GrainElement: Extended HTMLElement with grain properties
- GrainContext: State management API interface
- DirectiveHandler: Type for directive processing functions

**Interfaces:**

- `Grain`: A generic object representing the application state. It uses an index signature `[key: string]: any;` allowing for any key-value pairs.
- `GrainHistory`: Represents the state history, containing two arrays: `past` (previous states) and `future` (states available for redo). Both arrays contain `Grain` objects.

**Types:**

- `GrainElement`: Extends `HTMLElement` to include Grain-specific properties: `$grain` (the associated Grain object), `$originalValues` (a record of the element's original attribute values before Grains.js modifications), and an optional `$cleanup` function for resource cleanup.
- `GrainContext`: An interface defining the API exposed to directives and expressions for interacting with the Grain state. Methods include `get`, `set`, `getState`, `undo`, `redo`, `canUndo`, `canRedo`, and `states` (an object containing named states).
- `DirectiveHandler`: A function type used for directive handlers. It receives an `HTMLElement` and a string `value` as arguments.

**No variables are defined in `types.ts`.** It only contains type definitions.

These types provide the foundation for TypeScript support
and internal type safety throughout the library.

## src/store.ts

Global state and history management for Grains.js.

Provides a centralized store that:

- Manages all grain state instances
- Handles state history for undo/redo functionality
- Maintains grain lifecycle (creation, deletion, clearing)

Uses Map data structures for efficient state storage
and history tracking per grain instance.

**Methods:**

- `clear()`: Clears both the `grains` and `history` maps.
- `set(name: string, grain: Grain)`: Sets a grain in the `grains` map.
- `get(name: string)`: Retrieves a grain from the `grains` map.
- `delete(name: string)`: Deletes a grain from both the `grains` and `history` maps.
- `getHistory(name: string)`: Retrieves the history for a grain from the `history` map.
- `initHistory(name: string)`: Initializes the history for a grain in the `history` map with empty past and future arrays.
- `getAllStates()`: Returns an iterator of all grain states from the `grains` map.

**Variables:**

- `grains`: A `Map` storing grain states, keyed by grain name.
- `history`: A `Map` storing grain history, keyed by grain name. Each value is a `GrainHistory` object.

## src/core/observe.ts

Reactive state observation system using Proxy.

Creates a reactive proxy around state objects that:

- Detects property access, mutations, and deletions
- Recursively wraps nested objects
- Triggers updates on state changes
- Batches updates using requestAnimationFrame

Core of the reactive system that enables automatic
UI updates when state changes.

**Methods:**

- `observe<T extends object>(obj: T, callback: () => void): T`: Creates a reactive proxy for the given object. The `callback` function is executed within a `requestAnimationFrame` callback whenever a change is detected in the object or its nested objects. Returns the proxied object.
- `handler.get(target: T, property: string | symbol): any`: Handles property access. Recursively observes nested objects.
- `handler.set(target: T, property: string | symbol, value: any): boolean`: Handles property assignment. Triggers the `callback` if the new value is different from the old value.
- `handler.deleteProperty(target: T, property: string | symbol): boolean`: Handles property deletion. Triggers the `callback` if the property existed before deletion.

**Variables:**

- `handler`: A `ProxyHandler` object defining the behavior of the proxy. It contains the `get`, `set`, and `deleteProperty` methods.

## src/core/events.ts

Event handling system for interactive grain directives.

Manages all DOM event interactions:

- Sets up click handlers for g-click and g-args directives
- Handles undo/redo actions via g-action directive
- Maintains handler cleanup for memory management

Key features:

- Automatic function calls with argument support
- State history management for undo/redo
- Event delegation and handler cleanup
- Error handling for event callbacks

**Methods:**

- `setupEventListeners(el: GrainElement)`: Sets up event listeners for all interactive elements within a given GrainElement. It uses `setupOnDirective` and `setupActionDirective` to attach listeners. It also defines a cleanup function (`el.$cleanup`) to remove all event listeners when the GrainElement is removed.

**Variables:**

- `handlers`: A `Map` where keys are `HTMLElement`s and values are `Map`s. The inner `Map`s store event names as keys and event handler functions as values. This structure efficiently manages event listeners for each element.
- `cache`: An object obtained from `ElementCache.getCache(el)` or created by `ElementCache.cacheElements(el)`. It contains a collection of interactive elements (`interactiveElements`) which are processed to add listeners.

## src/core/context.ts

Grains context execution system for grain state management.

Provides the bridge between grain directives and state management:

- Executes user-defined functions with grain context
- Manages state updates and history tracking
- Provides API for state manipulation (get, set, undo, redo)

Features:

- Promise-based function execution
- State history management with limits
- Context isolation for function calls
- Automatic state diff detection and updates

**Methods:**

- `callGrainFunction(el: GrainElement, funcName: string, updates?: Grain, args: any[] = []): Promise<void>`: Executes a function with the provided context. Handles updates and arguments.
- `context.get(path: string)`: Retrieves a value from the grain state at the specified path.
- `context.set(updates: Partial<Grain>)`: Updates the grain state with the provided updates. Manages history.
- `context.getState()`: Returns a deep clone of the current grain state.
- `context.undo()`: Reverts the state to the previous state in the history.
- `context.redo()`: Advances the state to the next state in the history.
- `context.canUndo()`: Checks if an undo operation is possible.
- `context.canRedo()`: Checks if a redo operation is possible.

**Variables:**

- `context.states`: A proxy object providing access to other grain states. Handles warnings for accessing non-existent states. Each property is an object with `get` and `set` methods for accessing and modifying that state.
- `history`: (local to `callGrainFunction`) Stores the state history for the current grain. Contains `past` (array of previous states) and `future` (array of future states).
- `otherStates`: (local to `callGrainFunction`) An object mapping state names to context objects for accessing other states.

## src/core/expressions.ts

Expression evaluation engine for grain directives.

Handles evaluation of JavaScript expressions in directives:

- Processes utility function calls
- Evaluates conditional expressions
- Provides access to grain state context
- Handles both simple and complex expressions

Features:

- Safe expression evaluation
- Support for negation and function calls
- Error handling and logging
- Context isolation for expressions

**Methods:**

- `evaluateExpression(el: HTMLElement, expression: string): boolean`: Evaluates a given expression within the context of a grain element. Returns a boolean result. Handles standalone utility functions, negated utility functions, and complex expressions with function calls. Uses `createExpressionContext` and `Function` to execute the resolved expression.
- `createExpressionContext(el: GrainElement): Record<string, any>`: Creates the execution context for the expression, returning the `el.$grain` object.

**Variables:** None directly defined within the `expressions.ts` file itself; it relies on `UTILITY_FUNCTIONS` from `utility-functions.ts` and the `$grain` property of `GrainElement` from `types.ts`.

## src/core/placeholders.ts

Template string resolution system for grain directives.

Handles interpolation of state values in directive strings:

- Replaces {path} placeholders with actual state values
- Supports nested object paths
- Automatically serializes values to JSON strings

Used for dynamic content updates in g-text and other directives.

**Methods:**

- `resolvePlaceholders(el: GrainElement, str: string): string`: This function replaces placeholders in a given string with values from the grain's state. Placeholders are denoted by `{path}`, where `path` is a dot-separated path to a property within `el.$grain`. The function uses a regular expression to find and replace these placeholders. The values are then stringified using `JSON.stringify`.

**Variables:** None are directly defined within the `placeholders.ts` file itself; it relies on `GrainElement` from `types.ts` and `getValueAtPath` from `utils.ts`.

## src/core/utility-functions.ts

Built-in utility functions for grain expressions.

Provides a collection of helper functions for common state operations:

- History management (canUndo, canRedo)
- Value validation (isPositive, isNegative)
- State comparison (isEmpty, equals)

These functions are available in expressions and can be
called directly or used in conditional statements.

**Methods:**

- **`canUndo(el: GrainElement)`:** Checks if an undo operation is possible for the given element's state. Returns `true` if there's history, `false` otherwise.
- **`canRedo(el: GrainElement)`:** Checks if a redo operation is possible for the given element's state. Returns `true` if there's future history, `false` otherwise.
- **`isPositive(el: GrainElement, path: string)`:** Checks if the value at the specified path in the element's grain state is greater than 0.
- **`isNegative(el: GrainElement, path: string)`:** Checks if the value at the specified path in the element's grain state is less than 0.
- **`isEmpty(el: GrainElement, path: string)`:** Checks if the value at the specified path in the element's grain state is 0, "", or null.
- **`equals(el: GrainElement, path: string, compareValue: any)`:** Checks if the value at the specified path in the element's grain state is strictly equal to the `compareValue`.

**Variables:**

- **`UTILITY_FUNCTIONS`:** A constant object mapping function names (strings) to their corresponding functions. This object is used to access utility functions by name in expressions. Each function in this object takes a `GrainElement` and optional arguments as input and returns a boolean.

# Directives

## src/directives/base.ts

Core directive handling system and orchestration.

Centralizes directive processing:

- Maps directive names to their respective handlers
- Maintains directive execution priority
- Provides unified update mechanism for all directives

Serves as the bridge between the reactive system and
individual directive implementations. Processes directives in
a specific order to ensure consistent DOM updates.

**Variables:**

- `directiveHandlers`: A `Record<string, DirectiveHandler>` mapping directive names (e.g., "g-text", "g-show") to their corresponding handler functions. These handlers are responsible for updating the DOM element based on the directive's value.

**Methods:**

- `updateElementContent(el: HTMLElement)`: This is the core function of `base.ts`. It iterates through the `DIRECTIVES` array (defined in `constants.ts`). For each directive found on the provided `el` (HTMLElement), it retrieves the directive's value, finds the corresponding handler in `directiveHandlers`, and calls the handler to update the element. This ensures that directives are processed in a predefined order.

## src/directives/action.ts

Undo/Redo action handler for state management.

Implements the g-action directive which provides history-based state manipulation:

1. State Management

   - Handles "undo" and "redo" actions for state changes
   - Integrates with the global store's history system
   - Manages past and future state stacks

2. Event Handling

   - Creates click event handlers for action elements
   - Prevents default event behavior
   - Validates action types ("undo" or "redo")

3. State Updates
   - Deep clones states for history preservation
   - Updates DOM through the batcher system
   - Maintains state consistency during undo/redo operations

Key features:

- Automatic history stack management
- DOM updates after state changes
- Error handling and validation
- Event cleanup support

**Methods:**

- `createActionHandler(actionEl: HTMLElement): (event: Event) => Promise<void>`: Creates an event handler function for a g-action element. It validates the `g-action` attribute ("undo" or "redo"), finds the closest grain element, retrieves the state history from the store, and performs the undo or redo operation, updating the DOM using `updateElement`. Returns an asynchronous function that handles the click event.

- `setupActionDirective(element: HTMLElement, handlers: Map<HTMLElement, Map<string, (event: Event) => void>>)`: Sets up a click event listener on an element with a `g-action` attribute. It uses `createActionHandler` to generate the handler and stores it in the provided `handlers` map for cleanup.

**Variables:** None are directly defined within the `action.ts` file itself; it relies on `store` from `../store.ts`, `deepClone` and `findClosestGrainElement` from `../utils.ts`, and `updateElement` from `../batcher.ts`.

## src/directives/attr.ts

Dynamic attribute manipulation handler.

Implements the g-attr directive for reactive attribute binding:

1. Attribute Management

   - Handles multiple attribute bindings
   - Supports boolean attributes (disabled, checked, etc.)
   - Validates attribute names and expressions

2. Expression Handling

   - Supports both simple state references and complex expressions
   - Resolves placeholders in attribute values
   - Handles null/undefined values appropriately

3. Value Processing
   - Converts string values to appropriate types
   - Handles boolean attributes specially
   - Supports both HTML and ARIA attributes

Features:

- Multiple attribute bindings in single directive
- Validation of HTML attribute names
- Special handling for boolean attributes
- Support for data-_ and aria-_ attributes
- Expression evaluation with state context

**Methods:**

- `validateAttrBinding(attr: string, expression: string, element: HTMLElement): boolean`: Validates the attribute name and expression for correctness. Returns `true` if valid, `false` otherwise.
- `parseAttrBindings(directive: string, element: HTMLElement): AttrBinding[]`: Parses the `g-attr` directive string into an array of `AttrBinding` objects. Each `AttrBinding` contains an attribute name and its expression.
- `updateAttributes(element: HTMLElement, bindings: AttrBinding[], grainElement: GrainElement): void`: Updates the element's attributes based on the provided bindings and the grain element's state.
- `handleAttrDirective(element: HTMLElement, value: string): void`: Main entry point for handling the `g-attr` directive. Parses the directive value, validates the bindings, and updates the attributes.
- `updateAttrDirective(element: HTMLElement, grainElement: GrainElement): void`: Updates the attributes of an element with a `g-attr` directive when the grain state changes.

**Variables:**

- `ATTR_SEPARATOR`: Constant string (",") used to separate attribute bindings in the `g-attr` directive.
- `ATTR_VALUE_SEPARATOR`: Constant string (":") used to separate attribute names and expressions in the `g-attr` directive.
- `BOOLEAN_ATTRIBUTES`: A `Set` containing the names of boolean HTML attributes.
- `VALID_HTML_ATTRIBUTES`: A `Set` containing a list of valid HTML attributes.

## src/directives/class.ts

Class directive handler for dynamic CSS classes.

Implements multiple class binding patterns:

1. Static Class Assignment

   - Direct class name assignment (`g-class="base"`)
   - Simple string-based class application

2. Conditional Classes

   - Boolean condition-based classes (`g-class="[isActive && 'active']"`)
   - Multiple conditions in array syntax
   - Expression-based class toggling

3. Mixed Class Applications
   - Combined static and conditional classes
   - Array-based multiple class definitions
   - Complex condition evaluation

Features:

- Simple class name validation
- Expression evaluation for conditions
- Multiple class handling in single directive
- Safe string literal handling
- Error resilience for invalid expressions
- Automatic class cleanup on condition changes

**Methods:**

- `parseClassExpression(value: string): string[] | null`: Parses the `g-class` directive value. Handles both single class names and array syntax. Returns an array of class expressions or null if parsing fails.
- `evaluateClassCondition(element: HTMLElement, expression: string): boolean | string | string[] | null`: Evaluates a single class expression. Handles string literals, simple class names, conditional expressions (using `&&`), and general expressions. Returns an array of class names if true, false if false, or null if evaluation fails.
- `handleClassDirective(element: HTMLElement): void`: Main entry point for the `g-class` directive. Finds the closest grain element and calls `updateClassDirective`.
- `updateClassDirective(element: HTMLElement): void`: Updates the element's classes based on the `g-class` directive. Parses the directive, evaluates each expression, and adds or removes classes accordingly.

**Variables:** None are directly defined within the `class.ts` file itself; it relies on `evaluateExpression` from `../core/expressions.ts` and `findClosestGrainElement` from `../utils.ts`.

## src/directives/disabled.ts

Disabled state handler for interactive elements

Manages element disabled state based on expressions:

- Currently supports HTMLButtonElement
- Evaluates conditions for disabled state
- Sets disabled property based on expression result

Simple but essential directive for form interaction control.

**Methods:**

- `handleDisabledDirective(el: HTMLElement, expression: string): void`: This is the main function of the file. It checks if the element is an `HTMLButtonElement`. If it is, it evaluates the provided `expression` using `evaluateExpression` (from `../core/expressions.ts`) and sets the `disabled` property of the button element to the boolean result of the expression evaluation.

**Variables:** None are directly defined within the `disabled.ts` file itself; it relies on `evaluateExpression` from `../core/expressions.ts`.

## src/directives/show.ts

Visibility control directive handler.

Toggles element visibility through display style:

- Evaluates condition expressions
- Shows element by restoring original display
- Hides element using display: none

Simple toggle mechanism for conditional rendering.

**Methods:**

- `handleShowDirective(el: HTMLElement, expression: string): void`: This is the main function. It checks if the element has an `originalDisplay` property in its dataset. If not, it stores the element's current `display` style (or `getComputedStyle(el).display` if not set) in `el.dataset.originalDisplay`. Then, it evaluates the provided `expression` using `evaluateExpression` (from `../core/expressions.ts`). Based on the boolean result, it sets the element's `display` style to either the original display value or "none".

**Variables:** None are directly defined within the `show.ts` file itself; it relies on `evaluateExpression` from `../core/expressions.ts` and uses the `dataset` property of `HTMLElement` from the DOM API.

## src/directives/text.ts

Text content directive handler.

Manages dynamic text content updates:

- Resolves state values from dot notation paths
- Handles various value types (null, undefined, numbers)
- Safely converts values to strings
- Cleans up content when state is unavailable

Core directive for displaying reactive text content.

**Methods:**

- `handleTextDirective(el: HTMLElement, value: string): void`: This is the main function of the file. It takes an HTMLElement (`el`) and a string (`value`) representing the data path as input. It finds the closest grain element using `findClosestGrainElement`, retrieves the value at the specified path within the grain's state using `getValueAtPath`, converts the value to a string (handling null/undefined), and sets the `textContent` of the element accordingly. If no grain element or state is found, it clears the element's text content.

**Variables:**

- None are directly defined within the `text.ts` file itself; it relies on `findClosestGrainElement` and `getValueAtPath` from `../utils.ts`. The `el` and `value` parameters are function arguments.

## src/directives/model.ts

Two-way data binding directive handler.

Implements the `g-model` directive, enabling two-way data binding between form input elements and the grain's state.

**Functionality:**

- Attaches an `input` event listener to the element.
- Updates the grain's state whenever the input value changes.
- Updates the input element's value whenever the grain's state changes.
- Supports `input`, `textarea`, and `select` elements.

**Methods:**

- `handleModelDirective(element: HTMLElement, value: string)`: The main handler function. Establishes the two-way binding.

**Variables:** None directly defined within `model.ts`. Relies on utility functions and the `$grain` property of `GrainElement`.
