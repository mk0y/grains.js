You are an expert software developer assistant, especially for the frontend development.
Please always ask me if you have any questions or need further assistance especially if you need more context. If you're unsure about something, feel free to ask! If you're still unsure, don't hesitate to reach out to me.
Don't assume anything. If you're unsure about some function's definition, feel free to ask me.
Always think step by step.

In this file we'll describe what each file in our project does.
All tests are in `src/__tests__`.

# src/app.ts

Main entry point for Grains.js library.

This file serves as the primary bootstrapping mechanism for Grains.js,
responsible for:
1. Initializing the grain state management system
2. Scanning the DOM for grain elements on page load
3. Setting up reactive bindings for found grain elements
4. Exposing core library exports and types

The bootstrap process:
- Clears existing store state
- Queries DOM for elements with grain directives
- Sets up each grain element with reactive bindings

Public exports:
- bootstrap: Manual initialization function
- grainStore: Global state store instance
- Types: Grain, GrainContext, GrainElement

## src/core/setup.ts

Core initialization module for individual grain instances.

This module handles the complete lifecycle setup of a grain component:
1. State Initialization
   - Parses g-state directive to get state name
   - Initializes state from g-init attribute or empty object
   - Sets up state history tracking

2. Element Processing
   - Caches all relevant DOM elements for performance
   - Performs initial content updates for all directive elements

3. Reactivity Setup
   - Creates observable state proxy
   - Configures update batching for state changes

4. Global Integration
   - Registers state in global store
   - Adds state reference to window object
   - Sets up event listeners for interactive directives

5. Cleanup Handling
   - Provides cleanup function to remove state and cache
   - Handles proper teardown of grain instances

This is a crucial file that orchestrates the core functionality
of grain components and their reactive behavior

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

These constants are used throughout the library to maintain
consistency in selectors and directive naming

## src/batcher.ts

Update batching system for efficient DOM updates.

Provides a mechanism to batch multiple state changes and DOM updates
into a single render cycle using requestAnimationFrame.
Key features:
- Prevents redundant updates in the same animation frame
- Maintains a queue of pending grain element updates
- Provides both scheduled and force update capabilities
- Uses element cache for optimal performance

## src/cache.ts

DOM element caching system for performance optimization.

Uses WeakMap to store references to directive elements, preventing
repeated DOM queries. Caches elements by their directive types:
- Text elements (g-text)
- Show/hide elements (g-show)
- Interactive elements (g-click, g-action)
- All directive elements combined

WeakMap ensures proper garbage collection when elements are removed

## src/utils.ts

Utility functions for common operations.

Contains core helper functions:
- deepClone: Deep object cloning using rfdc
- findClosestGrainElement: DOM traversal to find parent grain element
- getValueAtPath: Object property access by dot notation path
- applyDiff: State diff application using microdiff

These utilities support state management, DOM operations,
and object manipulations throughout the library.

## src/types.ts

Type definitions for Grains.js core functionality.

Defines:
- Grain: Base state object interface
- GrainHistory: State history tracking structure
- GrainElement: Extended HTMLElement with grain properties
- GrainContext: State management API interface
- DirectiveHandler: Type for directive processing functions

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

## src/core/observe.ts

Reactive state observation system using Proxy.

Creates a reactive proxy around state objects that:
- Detects property access, mutations, and deletions
- Recursively wraps nested objects
- Triggers updates on state changes
- Batches updates using requestAnimationFrame

Core of the reactive system that enables automatic
UI updates when state changes.

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

## src/core/placeholders.ts

Template string resolution system for grain directives.

Handles interpolation of state values in directive strings:
- Replaces {path} placeholders with actual state values
- Supports nested object paths
- Automatically serializes values to JSON strings

Used for dynamic content updates in g-text and other directives.

## src/core/utility-functions.ts

Built-in utility functions for grain expressions.

Provides a collection of helper functions for common state operations:
- History management (canUndo, canRedo)
- Value validation (isPositive, isNegative)
- State comparison (isEmpty, equals)

These functions are available in expressions and can be
called directly or used in conditional statements.

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
- Support for data-* and aria-* attributes
- Expression evaluation with state context

## src/directives/base.ts

Core directive handling system and orchestration.

Centralizes directive processing:
- Maps directive names to their respective handlers
- Maintains directive execution priority
- Provides unified update mechanism for all directives

Serves as the bridge between the reactive system and
individual directive implementations. Processes directives in
a specific order to ensure consistent DOM updates.

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

Implementation details:
- Handles quoted and unquoted class names
- Supports complex state-based conditions
- Integrates with expression evaluation system
- Maintains element class list consistency
- Clean error handling and logging

## src/directives/disabled.ts

Disabled state handler for interactive elements

Manages element disabled state based on expressions:
- Currently supports HTMLButtonElement
- Evaluates conditions for disabled state
- Sets disabled property based on expression result

Simple but essential directive for form interaction control.

## src/directives/show.ts

Visibility control directive handler.

Toggles element visibility through display style:
- Evaluates condition expressions
- Shows element by restoring original display
- Hides element using display: none

Simple toggle mechanism for conditional rendering.

## src/directives/text.ts

Text content directive handler.

Manages dynamic text content updates:
- Resolves state values from dot notation paths
- Handles various value types (null, undefined, numbers)
- Safely converts values to strings
- Cleans up content when state is unavailable

Core directive for displaying reactive text content.
