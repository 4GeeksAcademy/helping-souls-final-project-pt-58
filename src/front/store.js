export const initialStore = () => {
  return {
    message: null,

    /* ===== DEMO TODOS ===== */
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      },
    ],

    /* ===== AUTH ===== */
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user")) || null,
    isAuth: !!localStorage.getItem("token"),

    /* ===== EVENTS ===== */
    events: [],
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {

    /* ===== AUTH ===== */

    case "login_success":
      return {
        ...store,
        token: action.payload.token,
        user: action.payload.user,
        isAuth: true,
      };

    case "logout":
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return {
        ...store,
        token: null,
        user: null,
        isAuth: false,
        events: [],
      };

    /* ===== EXISTING ===== */

    case "set_hello":
      return {
        ...store,
        message: action.payload,
      };

    case "add_task": {
      const { id, color } = action.payload;
      return {
        ...store,
        todos: store.todos.map((todo) =>
          todo.id === id ? { ...todo, background: color } : todo
        ),
      };
    }

    /* ===== EVENTS ===== */

    case "set_events":
      return {
        ...store,
        events: action.payload,
      };

    case "add_event":
      return {
        ...store,
        events: [...store.events, action.payload],
      };

    case "delete_event":
      return {
        ...store,
        events: store.events.filter(
          (event) => event.eventID !== action.payload
        ),
      };

    /* ===== DEFAULT ===== */

    default:
      console.warn("Unknown action:", action.type);
      return store;
  }
}