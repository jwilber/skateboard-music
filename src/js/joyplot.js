function resize() {}

function init() {

    


var margin = { top: 100, right: 10, bottom: 100, left: 100 },
    width = 1000 - margin.left - margin.right,
    height = 1200 - margin.top - margin.bottom;

var svg = d3.select('.joyplot').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Percent two area charts can overlap
var overlap = 0.8;

// NEED TO FIGURE THIS OUT
// var formatTime = d3.timeFormat('%I %p');
var formatTime = d3.timeFormat('%Y');

// Function to return d.time
var x = function(d) { return d.time; };

// xScale
var xScale = d3.scaleTime().range([0, width]);
var xValue = function(d) { return xScale(x(d)); };
var xAxis = d3.axisBottom(xScale).tickFormat(formatTime).ticks(10);

// y
var y = function(d) { return d.value; };
var yScale = d3.scaleLinear();
var yValue = function(d) { return yScale(y(d)) + 10; };

//
var activity = function(d) { return d.key; };
var activityScale = d3.scaleBand().range([0, height - 600]);
var activityValue = function(d) { return activityScale(activity(d)); };
var activityAxis = d3.axisLeft(activityScale);

var area = d3.area()
    .x(xValue)
    .y1(yValue);

var line = area.lineY1();

// function parseTime(offset) {
//     var date = new Date(2017, 0, 1); // chose an arbitrary day
//     return d3.timeMinute.offset(date, offset);
// }

var parseTime = d3.timeParse('%Y');


function row(d) {
    return {
        activity: d.activity,
        time: parseTime(+d.time),
        value: +d.p_smooth
    };
}

d3.tsv('assets/cities.tsv', row, function(error, dataFlat) {
    if (error) throw error;
    // Sort x-axis by time
    dataFlat.sort(function(a, b) { return a.time - b.time; });
    console.log(dataFlat);


    var data = d3.nest()
        .key(function(d) { return d.activity; })
        .entries(dataFlat);
    console.log(data);

    // Place activities based in order of max peak time
    function peakTime(d) {
        var i = d3.scan(d.values, function(a, b) { return y(a) - y(b); });
        return d.values[i].time;
    };

    // Sort activities by 
    var activityDomain = ["Indie/Alternative", "Hip Hop", "Punk", "Classic Rock", "Other", "Jazz/Soul", "Electronic", "Metal", "Rock"];

    data.sort(function (a, b) {return activityDomain.indexOf(a.key) - activityDomain.indexOf(b.key)})
    console.log(data)

    // data.sort(function(a, b) { return peakTime(a) - peakTime(b); });

    xScale.domain(d3.extent(dataFlat, x));
    // xScale.domain([parseTime(1989), parseTime(2017)]);


    activityScale.domain(activityDomain); 
    // activityScale.domain(data.map(function(d) { return d.key; }));

    var areaChartHeight = (1 + overlap) * (height / activityScale.domain().length);

    yScale
        .domain(d3.extent(dataFlat, y))
        .range([areaChartHeight, 0]);
    
    area.y0(yScale(0));
    svg.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + (height / 2 + 50) + ')') // hard-coded => bad
        .call(xAxis);

    svg.append('g')
        .attr('class', 'axis axis--activity')
        .attr('transform', 'translate(0,' + 148 + ')')
        .call(activityAxis);

    var gActivity = svg.append('g')
            .attr('class', 'activities')
            .selectAll('.activity').data(data)
            .enter().append('g')
                .attr('class', function(d) { return 'activity activity--' + d.key; })
                .attr('transform', function(d) {
                    var ty = activityValue(d) - activityScale.bandwidth() + 5;
                    return 'translate(0,' + ty + ')';
                });

    gActivity.append('path')
        .attr('class', 'area')
        .datum(function(d) { return d.values; })
        .attr('d', area);
        // .on('mouseover', function(d) {
        //     d3.select(this)
        //         .style('opacity', .8);
        // })
        // .on('mouseout', function(d) {
        //     d3.select(this)
        //         .style('opacity', 1)
        // });
    
    gActivity.append('path')
        .attr('class', 'line')
        .datum(function(d) { return d.values; })
        .attr('d', line)
        .style('opacity', 1);
});

}

export default { init, resize };