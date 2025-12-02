
import { useEffect, useRef, useReducer } from 'react';

const initialState = {
  data: [],
  isLoading: false,
  isError: false,
  searchTerm: 'react',
};

function storiesReducer(state, action) {
  switch (action.type) {
    case 'FETCH_INIT':
      return { ...state, isLoading: true, isError: false };
    case 'FETCH_SUCCESS':
      return { ...state, isLoading: false, data: action.payload };
    case 'FETCH_FAILURE':
      return { ...state, isLoading: false, isError: true };
    case 'REMOVE_ITEM':
      return { ...state, data: state.data.filter(item => item.objectID !== action.payload) };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    default:
      throw new Error();
  }
}

function App() {
  const inputRef = useRef();
  const [state, dispatch] = useReducer(storiesReducer, initialState);

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_INIT' });
      try {
        const response = await fetch(`https://hn.algolia.com/api/v1/search?query=${state.searchTerm}`);
        const result = await response.json();
        dispatch({ type: 'FETCH_SUCCESS', payload: result.hits });
      } catch {
        dispatch({ type: 'FETCH_FAILURE' });
      }
    };

    fetchData();
  }, [state.searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
  };

  return (
    <div>
      <h1>My Articles</h1>
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={state.searchTerm}
          onChange={(e) => dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
        />
        <button type="submit">Search</button>
        <button type="button" onClick={() => inputRef.current.focus()}>Focus Input</button>
      </form>

      {state.isLoading && <p>Loading...</p>}
      {state.isError && <p>Something went wrong...</p>}

      {!state.isLoading && !state.isError && (
        <ul>
          {state.data.map((item) => (
            <li key={item.objectID}>
              <a href={item.url} target="_blank">{item.title}</a>
              <button onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.objectID })}>
                Dismiss
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
