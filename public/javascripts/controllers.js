

// Controller for the poll list
function ChartListCtrl($scope, Chart) {
    $scope.charts = Chart.query();
 /* $scope.charts = Chart.query(function(){
        for(var i in $scope.charts){
         // Chart.findById({chartId: $scope.charts[i]._id});
            var chart = new Chart($scope.charts[i]);
            console.log($scope.charts[i]._id);
          chart.findByIdAndRemove($scope.charts[i]._id)
          // Chart.remove($scope.charts[i]._id);
        }
    });*/

}

// Controller for an individual poll
function ChartItemCtrl($scope, $routeParams, socket, Chart) {
    $scope.chart = Chart.get({chartId: $routeParams.chartId});

    socket.on('myvote', function(data) {
        console.dir(data);
        if(data._id === $routeParams.chartId) {
            $scope.chart = data;
        }
    });

    socket.on('vote', function(data) {
        console.dir(data);
        if(data._id === $routeParams.chartId) {
            $scope.chart.choices = data.choices;
            $scope.chart.totalVotes = data.totalVotes;
        }
    });

    $scope.vote = function() {
        var pollId = $scope.chart._id,
            choiceId = $scope.chart.userVote;

        if(choiceId) {
            var voteObj = { poll_id: pollId, choice: choiceId };
            socket.emit('send:vote', voteObj);
        } else {
            alert('You must select an option to vote for');
        }
    };
}

// Controller for creating a new poll
function ChartNewCtrl($scope, $location, Chart) {
    // Define an empty poll model object
    $scope.chart = {
        title: '',
        variables: [ { x: '', y:[0] }, { x: '', y:[0]}, { x: '', y:[0] }]
    };

    // Method to add an additional choice option
    $scope.addChoice = function() {
        $scope.chart.variables.push({ text: '' });
    };

    // Validate and save the new poll to the database
    $scope.createChart = function() {
        var chart = $scope.chart;

        // Check that a question was provided
        if(chart.title.length > 0) {
            var variableCount = 0;

            // Loop through the choices, make sure at least two provided
            for(var i = 0, ln = chart.variables.length; i < ln; i++) {
                var variable = chart.variables[i];

                if(variable.x.length > 0) {
                    variableCount++
                }
            }

            if(variableCount > 1) {
                // Create a new chart from the model
                var newChart = new Chart(chart);

                // Call API to save chart to the database
                newChart.$save(function(p, resp) {
                    if(!p.error) {
                        // If there is no error, redirect to the main view
                        $location.path('charts');
                    } else {
                        alert('Could not create poll');
                    }
                });
            } else {
                alert('You must enter at least two x-axis');
            }
        } else {
            alert('You must enter a title');
        }
    };
}
function ChartVolumeCtrl($scope, $routeParams, $location, Chart){
    //$scope.chart = Chart.get({chartId: $routeParams.chartId});
    $scope.chart = Chart.get({chartId: $routeParams.chartId}, function(){
        $scope.data = {"series": [
            "Sales",
            "Income",
            "Expense"
        ], "data": $scope.chart.variables};



        $scope.chartType = 'bar';

        $scope.config = {
            labels: false,
            title : $scope.chart.title,
            legend : {
                display:true,
                position:'left'
            }
        }

        $scope.config1 = {
            labels: false,
            title : "Products",
            legend : {
                display:true,
                position:'right'
            }
        }



        $scope.amounts = [
            0,100,200,300,400


        ];

    });

    $scope.saveVolumes = function(){
        var chart = $scope.chart;
        var newChart = new Chart(chart);
        newChart.$save(function(p, resp) {
            if(!p.error) {
                // If there is no error, redirect to the main view
                $location.path('charts');
            } else {
                alert('Could not create poll');
            }
        })


    }





};