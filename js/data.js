function getColonyHealthScore(d) {
  let hcc =
    ((d.Bees + d.Brood + d.Food + d.Queen + d.Space + d.Stressors) / 6) * 100;

  return hcc.toFixed(2);
}

function formatDate(date) {
  return (
    date.getDate().toString().padStart(2, "0") +
    "/" +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    "/" +
    date.getFullYear()
  );
}

function filterApiary(apiary) {
  if (apiary.ApiaryID === "Beesboro" || apiary.ApiaryID === "BBCC") {
    return apiary.ApiaryID;
  }

  return 0;
}

d3.json("../data/csvjson.json", (data) => {
  data.forEach((d) => {
    d.InsptDate = new Date(d.InsptDate);
    d.Bees = +d.Bees;
    d.Brood = +d.Brood;
    d.Food = +d.Food;
    d.Queen = +d.Queen;
    d.Space = +d.Space;
    d.Stressors = +d.Stressors;
  });

  const facts = crossfilter(data);
  const all = facts.groupAll();

  const dateDim = facts.dimension((d) => d.InsptDate);
  const minDate = dateDim.bottom(1)[0].InsptDate;
  const maxDate = dateDim.top(1)[0].InsptDate;

  // console.log('minDate, maxDate :>> ', minDate, maxDate);

  const yearDim = facts.dimension((d) => d.InsptDate.getFullYear());
  const minDateYear = yearDim.bottom(1)[0].InsptDate.getFullYear();
  const maxDateYear = yearDim.top(1)[0].InsptDate.getFullYear();
  const yearTotal = dateDim.group((d) => d.getFullYear());

  const apiaryDim = facts.dimension((d) => d.ApiaryID);
  const apiaryDimGroup = apiaryDim.group().reduce(
    function (p, v) {
      p.push(Math.abs(getColonyHealthScore(v)));
      return p;
    },
    function (p, v) {
      p.splice(p.indexOf(Math.abs(getColonyHealthScore(v))), 1);
      return p;
    },
    function () {
      return [];
    }
  );

  // const attrDim = facts.dimension((d) => [d.Bees, d.Brood]);
  // const attrDimGroup = attrDim.group(d => {console.log('d :>> ', d);});

  // const beesboro = dateDim.group().reduceSum((d) => {
  //   if (d.ApiaryID === "Beesboro") {
  //     return getColonyHealthScore(d);
  //   } else {
  //     return 0;
  //   }
  // });

  // const bbcc = dateDim.group().reduceSum((d) => {
  //   if (d.ApiaryID === "BBCC") {
  //     return getColonyHealthScore(d);
  //   } else {
  //     return 0;
  //   }
  // });

  dc.pieChart("#chart-ring-year")
    .width(400)
    .height(300)
    .colors(d3.scale.category10())
    .dimension(yearDim)
    .group(yearTotal)
    .innerRadius(50);

  dc.lineChart("#chart-line-regperyear")
    .renderArea(true)
    .width(500)
    .height(340)
    .transitionDuration(1000)
    .margins({ top: 30, right: 50, bottom: 30, left: 40 })
    .dimension(yearDim)
    .brushOn(false)
    .mouseZoomable(false)
    .elasticX(true)
    .elasticY(true)
    .group(yearTotal)
    .yAxisLabel("Qtd. de Inspeções")
    .yAxisPadding(100)
    .x(d3.scale.linear().domain([minDate, maxDate]).range([0, 50]))
    .xAxisLabel("Anos")
    .xAxis()
    .tickFormat(d3.format("d"))
    .ticks(3);

  dc.dataTable("#registration-table-graph")
    .dimension(dateDim)
    .group(() => "Tabela Análitica")
    .columns([
      (d) => formatDate(d.InsptDate),
      (d) => d.ApiaryID,
      (d) => d.HiveID,
      (d) => d.Bees,
      (d) => d.Brood,
      (d) => d.Food,
      (d) => d.Queen,
      (d) => d.Space,
      (d) => d.Stressors,
      (d) => getColonyHealthScore(d),
    ])
    .sortBy((d) => d.InsptDate)
    .order(d3.descending);

  dc.boxPlot("#box-plot")
    .width(1100)
    .height(400)
    .margins({ top: 0, right: 50, bottom: 50, left: 50 })
    .dimension(apiaryDim)
    .group(apiaryDimGroup)
    .elasticY(true)
    .elasticX(true)
    .boxWidth(10)
    .yAxisPadding(10)
    .y(d3.scale.linear().domain([0, 100]))
    .tickFormat(d3.format(".0f"));

  dc.renderAll();
});

// https://github.com/dc-js/dc.js/blob/2.0.0-beta.12/web/docs/api-2.0.0.md#box-plot
// https://github.com/dc-js/dc.js/blob/2.0.0-beta.12/web/examples/box-plot.html
