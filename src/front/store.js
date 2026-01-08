export const initialStore = () => {
  const token = localStorage.getItem("token");
  return {
    message: null,

    /* ===== AUTH ===== */
    token: token && token !== "null" && token !== "undefined" ? token : null,
    user:
      token && token !== "null" && token !== "undefined"
        ? JSON.parse(localStorage.getItem("user"))
        : null,
    isAuth: token && token !== "null" && token !== "undefined",

    /* ===== EVENTS ===== */
    events: [],

    selectedCategory: null,

    contactMessages: [],
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

    /* ===== CATEGORY ===== */
    case "set_category":
      return {
        ...store,
        selectedCategory: action.payload,
      };

    /* ===== CONTACT ===== */
    case "set_contact_messages":
      return {
        ...store,
        contactMessages: action.payload,
      };

    case "add_contact_message":
      return {
        ...store,
        contactMessages: [...store.contactMessages, action.payload],
      };

    case "delete_contact_message":
      return {
        ...store,
        contactMessages: store.contactMessages.filter(
          (msg) => msg.id !== action.payload
        ),
      };

    /* ===== DEFAULT ===== */

    default:
      console.warn("Unknown action:", action.type);
      return store;
  }
}
