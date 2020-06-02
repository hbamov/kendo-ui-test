$(document).ready(function () {
    // var messagesDataSource = new kendo.data.DataSource({ data: messages });
    //
    // messagesDataSource.read()

    var messageDataSource = new kendo.data.DataSource({
        transport: {
            read: (options) => {
                options.success(messages);
            },
            create: (options) => {
                alert(data.length);
            },
            update: (options) => {
                alert("Update");
            },
            destroy: (options) => {
                alert("Destroy");
                alert(data.length);
            },
            schema: {
                model: {
                    fields: {
                        category: { type: "string" },
                        date: { type: "date" },
                        fromEmail: { type: "string" },
                        fromName: { type: "string" },
                        html: { type: "string" },
                        id: { type: "number" },
                        isRead: { type: "number" },
                        subject: { type: "string" },
                        text: { type: "string" },
                        toEmail: { type: "string" },
                        toName: { type: "string" },
                    }
                }
            },
            pageSize: 10
        }
    });

    var tabstrip = $("#tabstrip").kendoTabStrip({
        animation:  {
            open: {
                effects: "fadeIn"
            }
		}					
    });
	
	//mail tab menu
    $("#menu").kendoMenu({
        orientation: 'horizontal',
        // select: onMenuSelect
    });

    var grid = $("#gridmail").kendoGrid({
        dataSource: messageDataSource,
        sortable: true,
        filterable: true,
        pageable: {
            refresh: true,
            pageSizes: true,
            buttonCount: 5
        },
        selectable: "row",
        columns: [
            {
                field: "fromEmail",
                title: "Sender",
                width: 240
            },
            {
                field: "subject",
                title: "Subject",
                template: '#if (isRead) {# ${subject} #} else {# <strong>${subject}</strong> #}#'
            },
            {
                field: "date",
                title: "Date",
                type: "date",
                format:"{0:MMMM dd, yyyy}"
            }
        ],
        change: (options) => {
            var selectedRow = options.sender.select();

            if(selectedRow.length > 0) {
                var rowData = options.sender.dataItem(selectedRow[0]);

                console.log(rowData)
                console.log(rowData.html)
                console.log(rowData.isRead)

                var template = kendo.template("<div id='box'>#= html #</div>");
                var data = rowData; //A value in JavaScript/JSON
                var result = template(data); //Pass the data to the compiled template
                $("#message").html(result);
            }
        }
    });

    tabstrip.one("activate", function() {
    	grid.resize();
    });
});