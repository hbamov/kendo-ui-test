$(document).ready(function () {
    // Initialize DataSource for Messages
    const messageDataSource = new kendo.data.DataSource({
        transport: {
            read: (options) => {
                options.success(messages);
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
            }
        },
        pageSize: 10
    });

    // Initialize DataSource for Tasks
    const tasksDataSource = new kendo.data.SchedulerDataSource({
        transport: {
            read: (options) => {
                options.success(tasks);
            },
        },
        schema: {
            model: {
                id: "id",
                fields: {
                    taskId: { from: "id", type: "number" },
                    title: { from: "title", defaultValue: "No title", validation: { required: true } },
                    start: { type: "date", from: "starttime" },
                    end: { type: "date", from: "endtime" },
                    // startTimezone: { from: "starttimezone" },
                    // endTimezone: { from: "endtimezone" },
                    description: { from: "description" },
                    recurrenceId: { from: "recurrenceid" },
                    recurrenceRule: { from: "recurrencerule" },
                    recurrenceException: { from: "recurrenceexception" },
                    ownerId: { from: "ownerid", defaultValue: 1 },
                    isAllDay: { type: "boolean", from: "isallday" }
                }
            }
        }
    });

    // Initialize DataSource for Contacts
    const contactsDataSource = new kendo.data.DataSource({
        transport: {
            read: (options) => {
                options.success(contacts);
            },
        }
    });

    // Initialization of tabs - Email, Calendar and Contacts
    const tabStrip = $("#tabstrip").kendoTabStrip({
        animation:  {
            open: {
                effects: "fadeIn"
            }
		},
        select: (event) => {
            const filteredCategory = event.item.getAttribute('section');

            /*
            Switch and the whole select event is needed to load Calendar
            and Contacts tab only on first click of tabs
            */
            switch(filteredCategory) {
                case 'calendar':
                    if(typeof $("#scheduler").data('kendoScheduler') === "undefined") {
                        loadTabs.calendar();
                    }
                    break;
                case 'contacts':
                    if(typeof $("#listView").data('kendoScheduler') === "undefined") {
                        loadTabs.contacts();
                    }
                    break;
                default:
            }
        }
    });

    // Initialization of Menu Widget - Inbox, Important, Perso and Outbox
    const menu = $("#menu").kendoMenu({
        orientation: 'horizontal',
        select: (event) => {
            // On Menu item click - filter the emails
            const filterArray = [];
            const filteredCategory = event.item.getAttribute('category');

            filterArray.push({
                field: "category",
                operator: "contains",
                value: filteredCategory
            });

            messageDataSource.filter(filterArray)
        }
    });

    // Initialization of Grid with emails
    const grid = $("#gridmail").kendoGrid({
        dataSource: messageDataSource,
        sortable: true,
        pageable: {
            refresh: false,
            pageSizes: true,
            buttonCount: 5
        },
        selectable: "row",
        columns: [
            {
                field: "fromEmail",
                title: "From",
                width: "20%"
            },
            {
                field: "subject",
                title: "Subject",
                template: '#if (isRead) {# ${subject} #} else {# <strong>${subject}</strong> #}#',
                width: "56%"
            },
            {
                field: "date",
                title: "Date",
                type: "date",
                template: "#= kendo.toString(kendo.parseDate(date, 'yyyy-MM-dd'), 'MMMM dd, yyyy') #",
                width: "15%"
            },
            {
                command: [
                    {
                        name: "destroy",
                        text: "Delete"
                    }
                ],
                field: "id",
                title: " ",
                width: "8%",
                sortable: false
            }
        ],
        editable: "inline",
        change: (options) => {
            /*
            On click of grid row display email message under the grid
            and mark it as read
            */
            var selectedRow = options.sender.select();

            if(selectedRow.length > 0) {
                var rowData = options.sender.dataItem(selectedRow[0]);

                rowData.set('isRead', 1);

                /*
                Render email as a pretty Kendo UI Card
                Reply and Forward buttons are only dummy buttons
                */
                var template = kendo.template(
                    "<div class=\"k-card\">\n" +
                        "<div class=\"k-card-header\">\n" +
                            "<h5 class=\"k-card-title\">#= fromEmail #</h5>\n" +
                            "<h6 class=\"k-card-subtitle\">#= kendo.toString(kendo.parseDate(date), \"MMMM dd, yyyy\") #</h6>\n" +
                        "</div>\n" +
                        "<div class=\"k-card-body\">\n" +
                            "<p>#= html #</p>\n" +
                        "</div>\n" +
                        "<div class=\"k-card-actions k-card-actions-stretched\">\n" +
                            "<span class=\"k-card-action\"><span class=\"k-button k-flat k-primary\">Reply</span></span>\n" +
                            "<span class=\"k-card-action\"><span class=\"k-button k-flat k-primary\">Forward</span></span>\n" +
                        "</div>\n" +
                    "</div>"
                )

                var result = template(rowData);
                $("#message").html(result);
            }
        }
    });

    // Resize grid to prevent tabs issue
    tabStrip.one("activate", () => {
        grid.resize();
    });

    // Tab loading methods share one namespace
    const loadTabs = {
        calendar: () => {
            $("#scheduler").kendoScheduler({
                height: 510,
                views: [
                    "day",
                    "week",
                    {type: "month", selected: true},
                    "month",
                ],
                timezone: "Etc/UTC",
                dataSource: tasksDataSource,
            });
        },
        contacts: () => {
            $("#listView").kendoListView({
                dataSource: contactsDataSource,
                template: kendo.template(
                    "<div class=\"user\">\n" +
                        "<img src=\"#= avatar #\" alt=\"#: email # image\" />\n" +
                        "<h3>#:firstname# #:lastname#</h3>\n" +
                        "<p>#:email#</p>\n" +
                    "</div>"
                )
            });
        }
    }
});