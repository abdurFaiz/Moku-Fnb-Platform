import Swal from "sweetalert2";

// action delete
$(document).on("click", ".action-delete", function (e) {
    e.preventDefault();
    var url = $(this).attr("data-url");
    var itemName = $(this).attr("data-item");
    var title = itemName
        ? `Anda yakin ingin menghapus ${itemName}?`
        : "Anda yakin ingin menghapus item ini?";
    deleteData(url, title);
});

// delete data
function deleteData(url, title) {
    var csrf_token = $('meta[name="csrf-token"]').attr("content");

    Swal.fire({
        title: title,
        text: "Anda mungkin tidak dapat mengembalikan item yang telah dihapus",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Ya, Hapus Saja!",
        cancelButtonText: "Kembali",
        showLoaderOnConfirm: true,
        preConfirm: (data) => {
            return $.ajax({
                url: url,
                type: "POST",
                data: {
                    _method: "DELETE",
                    _token: csrf_token,
                },
                success: function (data) {
                    return data;
                },
                error: function (err) {
                    var error = err.responseJSON;

                    Swal.fire({
                        title: "Failed!",
                        text: error.message,
                        icon: "error",
                        confirmButtonColor: "#3085d6",
                        confirmButtonText: "OK",
                    });
                },
            });
        },
        allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
        console.log(result);
        if (result.isConfirmed) {
            Swal.fire({
                title: "Deleted!",
                text: result.value?.message ?? "Item berhasil dihapus",
                icon: "success",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "OK",
            }).then((confirm) => {
                if (confirm.isConfirmed) {
                    if (result.value?.redirect) {
                        location.href = result.value?.redirect;
                    } else {
                        location.reload();
                    }
                }
            });
        }
    });
}
