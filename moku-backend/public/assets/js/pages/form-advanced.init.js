/*
Template Name: Minia - Admin & Dashboard Template
Author: Themesbrand
Website: https://themesbrand.com/
Contact: themesbrand@gmail.com
File: Form advanced Js File
*/

// Chocies Select plugin
document.addEventListener("DOMContentLoaded", function () {
    var genericExamples = document.querySelectorAll("[data-trigger]");
    for (i = 0; i < genericExamples.length; ++i) {
        var element = genericExamples[i];
        new Choices(element, {
            placeholderValue: "This is a placeholder set in the config",
            searchPlaceholderValue: "This is a search placeholder",
        });
    }

    // singleNoSearch
    var singleNoSearch = new Choices("#choices-single-no-search", {
        searchEnabled: false,
        removeItemButton: true,
        choices: [
            { value: "One", label: "Label One" },
            { value: "Two", label: "Label Two", disabled: true },
            { value: "Three", label: "Label Three" },
        ],
    }).setChoices(
        [
            { value: "Four", label: "Label Four", disabled: true },
            { value: "Five", label: "Label Five" },
            { value: "Six", label: "Label Six", selected: true },
        ],
        "value",
        "label",
        false
    );

    // singleNoSorting
    var singleNoSorting = new Choices("#choices-single-no-sorting", {
        shouldSort: false,
    });

    // multiple Remove CancelButton
    var multipleCancelButton = new Choices("#choices-multiple-remove-button", {
        removeItemButton: true,
    });

    //choices-multiple-groups
    var multipleDefault = new Choices(
        document.getElementById("choices-multiple-groups")
    );

    // text inputs example
    var textRemove = new Choices(
        document.getElementById("choices-text-remove-button"),
        {
            delimiter: ",",
            editItems: true,
            maxItemCount: 5,
            removeItemButton: true,
        }
    );

    // choices-text-unique-values
    var textUniqueVals = new Choices("#choices-text-unique-values", {
        paste: false,
        duplicateItemsAllowed: false,
        editItems: true,
    });

    //choices-text-disabled
    var textDisabled = new Choices("#choices-text-disabled", {
        addItems: false,
        removeItems: false,
    }).disable();
});

// flatpickr

flatpickr(".datepicker-basic", {
    defaultDate: new Date(),
    dateFormat: "Y-m-d",
});

flatpickr(".datepicker-datetime", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    time_24hr: true,
});

flatpickr("#datepicker-humanfd", {
    altInput: true,
    altFormat: "F j, Y",
    dateFormat: "Y-m-d",
    defaultDate: new Date(),
});

flatpickr("#datepicker-minmax", {
    minDate: "today",
    defaultDate: new Date(),
    maxDate: new Date().fp_incr(14), // 14 days from now
});

flatpickr("#datepicker-disable", {
    onReady: function () {
        this.jumpToDate("2025-01");
    },
    disable: ["2025-01-30", "2025-02-21", "2025-03-08", new Date(2025, 4, 9)],
    dateFormat: "Y-m-d",
    defaultDate: new Date(),
});

flatpickr("#datepicker-multiple", {
    mode: "multiple",
    dateFormat: "Y-m-d",
    defaultDate: new Date(),
});

flatpickr("#datepicker-range", {
    mode: "range",
    defaultDate: new Date(),
});

flatpickr("#datepicker-timepicker", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    defaultDate: new Date(),
});

flatpickr("#datepicker-inline", {
    inline: true,
    defaultDate: new Date(),
});
