import { Notyf } from "notyf";
import "notyf/notyf.min.css";

// Create an instance of Notyf
const notyf = new Notyf({
    duration: 3000,
});

// Global helper to trigger a success notification from plain JavaScript
// Usage: Call window.showSuccess('Your success message') anywhere in your JS code
// Example: window.showSuccess('Order placed successfully!');
window.showSuccess = function (message) {
    notyf.success(message);
};

window.showError = function (message) {
    notyf.error(message);
};
