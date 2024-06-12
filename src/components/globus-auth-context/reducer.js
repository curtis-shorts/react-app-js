// Handles the reduction of the input array to a single value
export const reducer = (state, action) => {
  // state: Globus authentication class
  // action = { type: "AUTHENTICATED"; payload: boolean } | { type: "REVOKE" }
  const AUTHENTICATED = "AUTHENTICATED";
  const REVOKE = "REVOKE";
  switch (action.type) {
    case AUTHENTICATED:
      return {
        ...state,
        isAuthenticated: action.payload,
      };
    case REVOKE:
      return {
        ...state,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};
