export default class DefaultAuthState {
  constructor() {
    this.isAuthenticated = false;
    this.isLoading = false;
    this.error = undefined;
    this.authorization = undefined;
    this.events = undefined;
  }
}
