var headers = ["Center"];
var columns = [{"sTitle": "Center"}];

var d = new Date();
var mm = (d.getMonth() + 1).toString();
var dd = d.getDate().toString();
var table;
$(document).ready(function() {
    var d = new Date();
    var mm = (d.getMonth() + 1).toString();
    var dd = d.getDate().toString();
    for (var i = 0; i <= 6; i++) {
        var new_date = (d.getDate() + i).toString();
        var strDate = (new_date[1] ? new_date : "0" + new_date[0]) + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + d.getFullYear();
        headers.push(strDate);
        columns.push({
            "sTitle": strDate
        });
    };
    table = $('#appointments_table').DataTable({
        "dom": '<"top"f>rt<"bottom"><"row"<"col-xs-6 col-sm-4"l><"col-xs-6 col-sm-4"i><"col-xs-6 col-sm-4;"p>><"clear">',
        "columns": columns,
        "bDestroy": true,
        "data": [],
        'iDisplayLength': 100,
        "language": {
            "emptyTable": "No Appointments available for your selection" //Change your default empty table message
        },
    });

    $('#appointments_table_filter input').addClass('form-control');
    $('.js-example-basic-single').select2();
    $.get("https://cdn-api.co-vin.in/api/v2/admin/location/states", function(data, status) {
        $('#states_drop_down').find('option').remove().end().append('<option value="">Select a State</option>');
        $.each(data.states, function() {
            $('#states_drop_down').append($("<option />").val(this.state_id).text(this.state_name));
        });
    });
    $('#states_drop_down').on('change', function() {
        $.get("https://cdn-api.co-vin.in/api/v2/admin/location/districts/" + this.value, function(data, status) {
            $('#district_drop_down').find('option').remove().end().append('<option value="">Select a District</option>');
            $.each(data.districts, function() {
                $('#district_drop_down').append($("<option />").val(this.district_id).text(this.district_name));
            });
        });
    });
    load_initial();
    // $('#search_btn').click(function() {
    //     fetch_slots();
    // });
    //   $('#checkbox_pin').change(function() {
    //     if(this.checked) {
    //         $("#pin_search_container").show()
    //         $("#state_search_container").hide()
    //     }else{
    //         $("#pin_search_container").hide()
    //         $("#state_search_container").show()
    //  }
    // });

    // $('#search_drop_down').on('change', function() {
    //     $('#checkbox_pin').attr('checked', false);
    //     var ids = this.value.split('-');
    //     if (ids.length === 2) {
    //         $('#states_drop_down').val(ids[1]);
    //         $('#states_drop_down').trigger('change');
    //         setTimeout(function() {
    //             $('#district_drop_down').val(ids[0]);
    //             $('#district_drop_down').trigger('change');
    //             fetch_slots();
    //         }, 1000);
    //     }
    // });
    $('.row_search_district').on('click', function() {
        var ids = $(this).attr('data').split('-');
        if (ids.length === 2) {
            $('#states_drop_down').val(ids[1]);
            $('#states_drop_down').trigger('change');
            setTimeout(function() {
                $('#district_drop_down').val(ids[0]);
                $('#district_drop_down').trigger('change');
                fetch_by_districts();
            }, 1000);
        }
    });
    $('#search_btn_pin').click(function() {
        fetch_by_pin();
    });

    $('#search_btn_district').click(function() {
        fetch_by_districts();
    });

});

function fetch_by_pin() {
    var strDate = (dd[1] ? dd : "0" + dd[0]) + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + d.getFullYear();
    var pincode = $("#id_pincode").val();
    var url = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=" + pincode + "&date=" + strDate
    fetch_slots(url);

}

function fetch_by_districts() {
    var strDate = (dd[1] ? dd : "0" + dd[0]) + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + d.getFullYear();
    var selected_district = $('#district_drop_down').val();
    if (selected_district === "" || selected_district === null || selected_district === "Select a District") {
        alert("Please select a district");
        return;
    }
    var url = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=" + selected_district + "&date=" + strDate;
    $("#save_search_btn").show();
    fetch_slots(url);
}

function fetch_slots(url) {
    var strDate = (dd[1] ? dd : "0" + dd[0]) + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + d.getFullYear();

    $.get(url, function(data, status) {
        var tbody = $('#appointments_table_body');
        // tbody.dataTable().clear();

        tbody.empty();
        table.clear().draw() //clear content\
        $.each(data.centers, function() {
            var name = this.name + "<b> [" + this.fee_type + "]</b>" + " <br> " + this.district_name + " " + this.state_name + ", " + this.pincode;
            var n_a = "<button class='btn-sm btn-disable' title='No slots available'>N/A</button><br><span class='label label-warning'>No Slots Available</span>";
            var sessions = [name, n_a, n_a, n_a, n_a, n_a, n_a, n_a];
            $.each(this.sessions, function() {
                var btn = "<button class='btn-sm btn-success' onclick='open_reg()'>" + this.available_capacity + "</button><br><span class='label label-warning'>Age " + this.min_age_limit + "+ </span><br><span class='label label-warning'>" + this.vaccine + " </span>";
                if (this.available_capacity === "0" || this.available_capacity == 0) {
                    btn = "<button class='btn-sm btn-danger'>Booked</button><br><span class='label label-warning'>Age " + this.min_age_limit + "+ </span><br><span class='label label-warning'>" + this.vaccine + " </span>";

                }
                sessions[headers.indexOf(this.date)] = btn;
            });
            table.row.add(sessions);
        });
        table.draw() //update

        $("#telegram-bot-modal").modal('show');
    });
}

function open_reg() {
    window.open('https://selfregistration.cowin.gov.in/', '_blank');
};

function load_initial() {

    $("#telegram-bot-modal").modal('show');
    var savedSearch = localStorage.getItem("search");
    $("#saved_districts_table tbody tr").remove();
    if (savedSearch !== null) {
        savedSearchList = JSON.parse(savedSearch);
        $.each(savedSearchList, function(i, item) {
            var newRowContent = "<tr class='row_search_district' data='" + item.district_id + "-" + item.state_id + "'><td>" + item.state_name + "</td><td>" + item.district_name + "</td></tr>";
            $("#saved_districts_table tbody").append(newRowContent);
        });
        setTimeout(function() {
            $('.row_search_district')[0].click();
        }, 2000);
    }
}

function save_search() {
    var state_id = $("#states_drop_down option:selected").val();
    var state_name = $("#states_drop_down option:selected").text();
    var district_id = $("#district_drop_down option:selected").val();
    var district_name = $("#district_drop_down option:selected").text();
    var savedSearch = localStorage.getItem("search");
    var savedSearchList = [];
    if (savedSearch !== null) {
        savedSearchList = JSON.parse(savedSearch);

    }

    savedSearchList.push({
        "state_id": state_id,
        "state_name": state_name,
        "district_id": district_id,
        "district_name": district_name
    })
    localStorage.setItem("search", JSON.stringify(savedSearchList));
    load_initial();
    $("#save_search_btn").show();

}