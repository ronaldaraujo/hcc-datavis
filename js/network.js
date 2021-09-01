const dataset = d3.json("../data/csvjson.json").then((data) => {
  const parseDate = d3.timeParse("%Y-%m-%d");

  data.forEach((d) => {
    d.InsptDate = parseDate(d.InsptDate);
    d.Bees = +d.Bees;
    d.Brood = +d.Brood;
    d.Food = +d.Food;
    d.Queen = +d.Queen;
    d.Space = +d.Space;
    d.Stressors = +d.Stressors;
  });

  const facts = crossfilter(data);

  const dateDim = facts.dimension((d) => d.InsptDate);

  const dateDimCount = dateDim.group();

  const dateScale = d3
    .scaleTime()
    .domain([dateDim.bottom(1)[0].InsptDate, dateDim.top(1)[0].InsptDate]);

  // const barChart = dc.barChart(document.querySelector("#bar-chart"));

  // const width = document.getElementById("bar-chart").offsetWidth + 100;
  // const height = 600;

  // barChart
  //   .width(width)
  //   .height(300)
  //   .dimension(dateDim)
  //   .margins({ top: 30, right: 50, bottom: 25, left: 40 })
  //   .x(dateScale)
  //   .gap(1)
  //   .centerBar(true)
  //   .renderHorizontalGridLines(true)
  //   .legend(
  //     dc
  //       .legend()
  //       .x(width - 256)
  //       .y(10)
  //       .itemHeight(13)
  //       .gap(5)
  //   )
  //   .brushOn(true)
  //   .group(dateDimCount, "Qtd. de Inspeções ao longo dos meses");

  // -------

  let nodes = [];
  let nodesApiaries = [];
  let links = [];

  function drag(simulation) {
    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragend(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragend);
  }

  data.forEach((d) => {
    if (nodes.indexOf(d.ApiaryID) < 0) {
      nodes.push(d.ApiaryID);
      nodesApiaries.push(d.ApiaryID);
    }

    if (nodes.indexOf(d.HiveID) < 0) {
      nodes.push(d.HiveID);
    }

    links.push({
      source: nodes.indexOf(d.ApiaryID),
      target: nodes.indexOf(d.HiveID),
    });
  });

  nodes = nodes.map(function (n) {
    return { name: n };
  });

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink(links).id((d) => d.index)
    )
    .force("charge", d3.forceManyBody().strength(-50))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .on("tick", () => {
      link.attr("x1", (d) => d.source.x);
      link.attr("y1", (d) => d.source.y);
      link.attr("x2", (d) => d.target.x);
      link.attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x);
      node.attr("cy", (d) => d.y);
    });

  const svg = d3
    .create("svg")
    .attr("viewBox", [-1100 / 2, -600 / 2, 1100, 600]);

  const link = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line");

  const node = svg
    .append("g")
    .attr("fill", "#fff")
    .attr("stroke", "#000")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("fill", (d) =>
      nodesApiaries.indexOf(d.name) < 0 ? "#FFF" : "#FF0000"
    )
    .attr("r", 10)
    .call(drag(simulation));

  node.append("title").text((d) => d.name);
  node.append("p").text((d) => d.name);

  link
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);

  node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

  document.getElementById("network-chart").appendChild(svg.node());

  dc.renderAll();
});
