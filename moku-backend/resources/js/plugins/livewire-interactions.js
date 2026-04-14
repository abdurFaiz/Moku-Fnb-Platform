import { Notyf } from "notyf";
import "notyf/notyf.min.css";

// Create an instance of Notyf
const notyf = new Notyf({
    duration: 1500,
});

document.addEventListener("livewire:init", () => {
    // success with modal
    Livewire.on("success", (event) => {
        notyf.success(event.message);
    });
});