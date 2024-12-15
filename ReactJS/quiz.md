# Question 1
## Tags
#react #lifecycle_hook #use_effect #dependency_array
## Question
When using React, how does the `useEffect` hook behave when provided with an empty dependency array (`[]`)?
## Options
- [ ] Executes on every render
- [ ] Executes only once after the initial render
- [ ] Executes once per component lifecycle, including unmounting
- [ ] Does not execute at all unless explicitly invoked
## Answer
2. Executes only once after the initial render

# Question 2
## Tags
#react #performance #rendering
## Question
How does React optimize performance when rendering a list of components?
## Options
- [ ] By re-rendering the entire list whenever there’s a state or prop change
- [ ] By automatically caching each rendered component
- [ ] By using key props to identify which items in a list have changed
- [ ] By always skipping rendering for unchanged items in a list
## Answer
3. By using key props to identify which items in a list have changed

# Question 3
## Tags
#react #lifecycle_hook #settate
## Question
What happens when you call `setState` in a React class component?
## Options
- [ ] The state is updated immediately, and the UI re-renders synchronously
- [ ] The state is merged with the current state, and the UI re-renders asynchronously
- [ ] The state is replaced entirely, and the UI re-renders synchronously
- [ ] The state is updated in the next render cycle, but merging doesn’t occur automatically
## Answer
2. The state is merged with the current state, and the UI re-renders asynchronously

# Question 4
## Tags
#react #lifecycle_hook #use_ref
## Question
In React, what does the `useRef` hook primarily provide?
## Options
- [ ] A way to manage state that re-renders the component
- [ ] A mutable reference to a DOM element or value that persists across renders
- [ ] A method to pass props deeply through the component tree
- [ ] A way to create controlled form inputs
## Answer
2. A mutable reference to a DOM element or value that persists across renders

# Question 5
## Tags
#react #memo #higher_order_component
## Question
In React, what does the `React.memo` higher-order component do?
## Options
- [ ] Optimizes rendering by automatically handling state updates
- [ ] Enables a component to use React hooks
- [ ] Prevents a component from ever re-rendering
- [ ] Wraps a component to ensure it only re-renders when its props change
## Answer
4. Wraps a component to ensure it only re-renders when its props change

# Question 6
## Tags
#react #context_api #provider_component
## Question
When using React’s Context API, what is the primary purpose of the Provider component?
## Options
- [ ] Provide default values for context consumers
- [ ] Share data globally without manually passing props down the tree
- [ ] Automatically memoize context values for performance
- [ ] Control which components can access the React state
## Answer
2. Share data globally without manually passing props down the tree

# Question 7
## Tags
#react #lifecycle_hook #use_effect #dependency_array
## Question
What happens if you update the state inside a `useEffect` hook without specifying a dependency array?
## Options
- [ ] The component re-renders once, and the `useEffect` runs again once
- [ ] The `useEffect` creates an infinite loop of re-renders
- [ ] The state update is ignored unless it changes manually
- [ ] The component runs the effect only once during the initial render
## Answer
2. The `useEffect` creates an infinite loop of re-renders

# Question 8
## Tags
#react #lifecycle_hook #use_reducer
## Question
What is the primary purpose of the `useReducer` hook in React?
## Options
- [ ] To manage side effects in functional components
- [ ] To replace the useState hook for single value state updates
- [ ] To handle complex state logic with multiple sub-values
- [ ] To optimize performance by memoizing component outputs

## Answer
3. To handle complex state logic with multiple sub-values

# Question 9
## Tags
#react #lifecycle_hook #use_effect
## Question
What will be logged to the console when the following code runs in a React component?
```jsx
function Example() {
    const [count, setCount] = React.useState(0);
    
    React.useEffect(() => {
        console.log("Count updated:", count);
    });

    const handleClick = () => {
        setCount(count + 1);
        setCount(count + 2);
    };

    return <button onClick={handleClick}>Increment</button>;
}
```
## Options
- [ ] `Count updated: 0`
- [ ] `Count updated: 1`
- [ ] `Count updated: 2`
- [ ] `Count updated: 0`, `Count updated: 2`
## Answer
4. `Count updated: 0`, `Count updated: 2`

# Question 10
## Tags
#react #lifecycle_hook
## Question
In the React lifecycle, which lifecycle method(s) is/are triggered when a component’s props or state change?
## Options
- [ ] `componentDidMount` only
- [ ] `componentDidUpdate` only
- [ ] Both `componentDidMount` and `componentDidUpdate`
- [ ] `shouldComponentUpdate` only
## Answer
2. `componentDidUpdate` only

# Question 11
## Tags
## Question
What will the following code output when the button is clicked?
```jsx
class Counter extends React.Component {
  constructor() {
    super();
    this.state = { count: 0 };
  }

  handleClick = () => {
    this.setState({ count: this.state.count + 1 });
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    console.log("Rendered with count:", this.state.count);
    return <button onClick={this.handleClick}>Increment</button>;
  }
}
```
## Options
- [ ] `Rendered with count: 0`, `Rendered with count: 2`
- [ ] `Rendered with count: 0`, `Rendered with count: 1`
- [ ] `Rendered with count: 0`, `Rendered with count: 0`
- [ ] `Rendered with count: 0`, `Rendered with count: 1`, `Rendered with count: 2`
## Answer
2. `Rendered with count: 0`, `Rendered with count: 1`.











# Question 11
## Tags
## Question
## Options
## Answer