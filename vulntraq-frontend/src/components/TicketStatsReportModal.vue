<template>
    <div>
        <b-modal
            id="ticket-stats-report-modal"
            centered
            size="xl"
            button-size="sm"
            title="Ticket Statistics Report"
            :hide-footer="true"
            @show="show"
            @hide="reset_modal_data"
        >
            <div class="loading-display" v-if="are_loading_graph">
                <b-spinner style="width: 3rem; height: 3rem;"/>
                <h2>Loading The Ticket Statistics Report....</h2>
            </div>
            <div v-else>
                <Bar
                    :chart-options="chartOptions"
                    :chart-data="chartData"
                    :chart-id="chartId"
                    :dataset-id-key="datasetIdKey"
                    :plugins="plugins"
                    :css-classes="cssClasses"
                    :styles="styles"
                    :width="width"
                    :height="height"
                    v-if="present_graph"
                />
            </div>

            <!-- Display the button for closing the modal -->
            <div style="height: 20px;"/>
            <b-button variant="primary" block class="close-button" @click="close()">
                Close
            </b-button>

        </b-modal>
    </div>
</template>

<script>
import { Bar } from 'vue-chartjs/legacy';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

function getDateString(date_obj) {
    var to_return = (date_obj.getMonth() + 1) + "/" + date_obj.getDate() + "/" + date_obj.getFullYear();
    return to_return;
}

export default {
  name: 'TicketStatsReportModal',
  components: {
      Bar
  },
  data() {
    return {
        //
        are_loading_graph: true,      // Boolean indicating whether we are loading/preparing graph data for display
        present_graph: false,
        //
        ////////////////////////////////////////////////////////
        // Data for controlling the labels on the graph's x-axis
        //
        // Need to first get the datetime objects representing 
        // the graph's x-axis' start and end
        date_graph_x_axis_first_date_time_obj: null,
        date_graph_x_axis_last_date_time_obj: null,
        //
        // Text labels for the x-axis
        graph_labels_list_str: "",
        //
        ////////////////////////////////////////////////////////
        //
        // Data to be displayed in the graph itself
        graph_labels_list: [],
        graph_tickets_opened_counts_data_list: [],
        graph_tickets_closed_counts_data: [],
        //
        chartOptions: {
            responsive: true,
            maintainAspectRatio: false
        },
        chartData: {
            labels: [
            ],
            datasets: [
                {
                    label: 'Num. Tickets Opened',
                    backgroundColor: '#f87979',
                    data: []
                },
                {
                    label: 'Num. Tickets Closed',
                    backgroundColor: '#e6e6ff',
                    data: []
                }
            ]
        },
        //
        ////////////////////////////////////////////////////////
    }
  },
  methods: {
    show: function show() {
        // This function prepares the graph data to be displayed
        //
        // We want to display a graph *only* if we have at least two tickets we can work with
        if (this.all_ticket_rows_data.length == 0 || this.all_ticket_rows_data.length == 1) {
            this.reset_modal_data();
            return;                 // can't go further
        }
        //
        // We need to prepare the data to be displayed in the graph
        this.are_loading_graph = true;

        var oldest_ticket = this.all_ticket_rows_data[this.all_ticket_rows_data.length-1];
        var newest_ticket = this.all_ticket_rows_data[0]
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Need to first configure the x-axis start and end dates
        //
        // The x-axis starts with the day the oldest ticket was created
        this.date_graph_x_axis_first_date_time_obj = oldest_ticket["day_ticket_created_datetime_object"];
        //
        // The x-axis ends with either the (1) date the latest & currently open ticket was created or (2) date the latest ticket was *CLOSED*
        if (newest_ticket.status == "Open") {
            this.date_graph_x_axis_last_date_time_obj = newest_ticket.day_ticket_created_datetime_object;
        }
        else {
            // The ticket is not open... i.e. closed
            this.date_graph_x_axis_last_date_time_obj = newest_ticket.ticket_closing_date_datetime_obj;
        }
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Now need to create the array of x-axis labels
        //
        // This is the day *immediately* after the last day we want to display on the x-axis
        // It will act as the upper bound that the loop must reach before halting loop iteration + execution
        var upper_loop_bound_date = new Date(this.date_graph_x_axis_last_date_time_obj);
        upper_loop_bound_date.setDate(upper_loop_bound_date.getDate() + 1);
        //
        for (
                var current_date = this.date_graph_x_axis_first_date_time_obj;        // "i" = 0
                getDateString(current_date) != getDateString(upper_loop_bound_date);  // "i" != the day after the last one we want to display
                current_date.setDate(current_date.getDate() + 1)                      // "i++"
            ) {
            this.graph_labels_list_str += getDateString(current_date) + "|";
        }
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Now need to compute the graph_labels_list of the x-axis labels to be displayed
        this.graph_labels_list = this.graph_labels_list_str.split("|");
        this.graph_labels_list.splice(this.graph_labels_list.length - 1, 1); // the splice removes the last item "" since the graph_labels_list_str ends with "|"
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Now need to create an array of opened ticket counts
        //
        this.graph_tickets_opened_counts_data_list = [];
        var i = 0;
        for (i=0; i < this.graph_labels_list.length; i++){
            this.graph_tickets_opened_counts_data_list.push(0);
        }
        //
        /////////////////////////////////////////////////////////////////////////////
        //
        // Next, need to iterate over all the tickets and get the dates they were opened
        var examined_opening_date = "";
        var opening_date_index = -1;
        for (i = 0; i < this.all_ticket_rows_data.length; i++) {
            examined_opening_date = getDateString(this.all_ticket_rows_data[i].day_ticket_created_datetime_object);
            opening_date_index = this.graph_labels_list.indexOf(examined_opening_date);

            if (opening_date_index >= 0) {
                this.graph_tickets_opened_counts_data_list[opening_date_index] = this.graph_tickets_opened_counts_data_list[opening_date_index] + 1;
            }
        }
        //
        /////////////////////////////////////////////////////////////////////////////
        //
        // Next, need to iterate over all the tickets and get the dates they were closed
        //
        // First, we need to create an array of 0's in terms of counts
        this.graph_tickets_closed_counts_data = [];
        i = 0;
        for (i=0; i < this.graph_labels_list.length; i++){
            this.graph_tickets_closed_counts_data.push(0);
        }
        //
        // Next, need to iterate over all the tickets and get the dates they were opened
        var examined_closing_date = "";
        var closing_date_index = -1;
        for (i = 0; i < this.all_ticket_rows_data.length; i++) {
            //
            // We check to see if we have closed the ticket with an available closing date object
            examined_closing_date = this.all_ticket_rows_data[i].ticket_closing_date_datetime_obj;
            //
            if (examined_closing_date == null) {
                // Sorry, we don't have such a closing date object available --> going to next loop iteration!
                continue;
            }
            //
            examined_closing_date = getDateString(examined_closing_date);
            closing_date_index = this.graph_labels_list.indexOf(examined_closing_date);

            if (closing_date_index >= 0) {
                this.graph_tickets_closed_counts_data[closing_date_index] = this.graph_tickets_closed_counts_data[closing_date_index] + 1;
            }
        }
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Now need to update the chart data for graph displaying
        this.chartData.labels = this.graph_labels_list;
        this.chartData.datasets[0].data = this.graph_tickets_opened_counts_data_list;
        this.chartData.datasets[1].data = this.graph_tickets_closed_counts_data;
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // We are ready to start displaying the graph!
        // The data for the graph will be derived as computed properties from the 
        // graph_labels_list_str dependent graph_labels_list
        this.are_loading_graph = false; 
        this.present_graph = true;          // the activation of this boolean automatically refreshes the Bar component & updates its values & settings
    },
    close: function close() {
        this.reset_modal_data();
        this.$bvModal.hide("ticket-stats-report-modal");
    },
    reset_modal_data: function reset_modal_data() {
        this.are_loading_graph = true;
        this.present_graph = false;
        this.date_graph_x_axis_first_date_time_obj = null;
        this.date_graph_x_axis_last_date_time_obj = null;
    }
  },
  props: {
      // This is assumed to be an ordered list of tickets' information
      // The order is from most recent ---> oldest
      all_ticket_rows_data: { type: Array, required: true },
      //
      ////////////////////////////////////////////////////////
      //
      chartId: {
          type: String,
          default: 'bar-chart'
      },
      datasetIdKey: {
          type: String,
          default: 'label'
      },
      width: {
          type: Number,
          default: 400
      },
      height: {
          type: Number,
          default: 400
      },
      cssClasses: {
          default: '',
          type: String
      },
      styles: {
          type: Object,
          default: () => {}
      },
      plugins: {
          type: Array,
          default: () => []
      }
  }
}
</script>
    
<style lang="scss">

/* 
   Formats the section for displaying information indicating 
   the data for making the graph is being loaded 
*/
.loading-display {
    text-align: center;
    align-items: center;
}

/* Formats the button for closing the modal */
.close-button {
    width: 100%;
}

</style>