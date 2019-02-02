var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();
/* declare vairables */

var innerHeight = 700;
var innerWidth = 1000;
var margin = { top: 200, left: 100, right: 100, bottom: 20 };
var height = innerHeight + margin.top + margin.bottom;
var width = innerWidth + margin.left + margin.right;
var educationDataSplits = [6, 10, 11.5, 14.7, 17.8, 21.5, 29.9, 42];
var legendWidth = width / 4;


/* draw svg canvas */

var canvas = d3.select('body').
append('svg').
attr('width', width).
attr('height', height).
attr('id', 'canvas');

var innerCanvas = canvas.append('g').
attr('width', innerWidth).
attr('height', innerHeight).
attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');


/* add title and description */

canvas.append('text').
text('United States Educational Attainment').
attr('id', 'title').
attr('transform', 'translate(' + width / 2 + ', ' + margin.top / 3 + ')');

canvas.append('text').
text('Percentage of adults age 25 and older with a bachelor\'s degree or higher (2010-2014)').
attr('id', 'description').
attr('transform', 'translate(' + width / 2 + ', ' + margin.top / 1.7 + ')');


/*create tooltip*/

var tooltip = d3.select('body').
append('div').
attr('id', 'tooltip').
style('white-space', 'pre-line').
text('');


/*set the colour scale */

var colourScale = d3.scaleThreshold().
domain(educationDataSplits).
range(d3.schemeRdPu[9]);


/* add a legend */

var xScale = d3.scaleBand().
domain(educationDataSplits).
range([0, legendWidth]);

var legend = canvas.append('g').
attr('id', 'legend').
attr('transform', 'translate(' + (width - legendWidth - margin.right) + ', ' + margin.top / 1.1 + ')');

var xAxis = d3.axisBottom(xScale).
tickFormat(function (d) {return d + '%';}).
tickSize(20);

legend.selectAll('rect').
data(educationDataSplits).
enter().
append('rect').
attr('x', function (d, i) {return legendWidth / educationDataSplits.length / 2 + i * legendWidth / educationDataSplits.length;}) //funky measuring to ge the ticks positioned at the start of each band
.attr('width', legendWidth / educationDataSplits.length).
attr('height', 20).
attr('fill', function (d) {return colourScale(d);});

legend.append('g').
call(xAxis).
select(".domain").
remove();


/* load in the data */

Promise.
all([d3.json('https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json'), d3.json('https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json')]).
then(function (_ref) {var _ref2 = _slicedToArray(_ref, 2),topoData = _ref2[0],educationData = _ref2[1];

  var counties = topojson.feature(topoData, topoData.objects.counties);

  //organize education data into objects with key that matches their fips/id
  var dataByFips = educationData.reduce(function (acc, v) {
    acc[v.fips] = v;
    return acc;
  }, {});


  //merge in education data to its matching county
  counties.features.forEach(function (d) {
    Object.assign(d.properties, dataByFips[d.id]);
  });


  //draw in the counties from the topo data  
  var path = d3.geoPath();
  var countyPath = innerCanvas.selectAll('path').
  data(counties.features).
  enter().
  append('path').
  attr('d', path).
  attr('id', 'counties').
  attr('fill', function (d) {return colourScale(d.properties.bachelorsOrHigher);}).
  attr('class', 'county').
  attr('data-fips', function (d) {return d.properties.fips;}).
  attr('data-education', function (d) {return d.properties.bachelorsOrHigher;}).
  on("mouseover", function (d) {//show tooltip on mouseover
    tooltip.text(getTooltip(d)).
    style("visibility", "visible").
    style("left", d3.select(this).node().getBBox().x + margin.left + margin.right + "px").
    style("top", d3.select(this).node().getBBox().y + margin.top + "px").
    attr('data-education', d.properties.bachelorsOrHigher);
  }).
  on('mouseout', function (d) {
    tooltip.style('visibility', 'hidden');
  });

  //use topojson.mesh to add clean lines for state borders
  innerCanvas.append('path').
  datum(topojson.mesh(topoData, topoData.objects.states, function (a, b) {return a !== b;})).
  attr('d', path).
  attr('id', 'states');


  //function to get text for the tooltips
  function getTooltip(d) {
    return d.properties.area_name + ', ' + d.properties.state + ' \n ' + d.properties.bachelorsOrHigher + '%';
  }

});