/*
*/

require(["d3", "jtx", "qudom"], function(d3, jtx, qudom) {
    /*
    */
    window.document.body.appendChild(qudom.qudom("div!This is a test."));
    window.document.body.appendChild(qudom.qudom("div$font-style:italic!This is only a test."));

    let data = jtx.Array.union([2, 3, 5], [3, 5, 7]);
    let svg = d3.select("body").append("svg");
    var scale = 100;
    svg.append("g")
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d, i) { return scale * i; })
        .attr("y", 0)
        .attr("width", scale)
        .attr("height", function(d, i) { return scale * d; });
    svg.attr("width", scale * data.length)
        .attr("height", scale * d3.max(data));
});
